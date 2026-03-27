import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type LoginRequest = {
  loginName?: string;
  password?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeLoginName(rawValue: string) {
  return rawValue.normalize('NFC').trim();
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function buildSyntheticEmail(loginName: string) {
  const digest = await sha256Hex(loginName);
  return `pododong.auth+${digest.slice(0, 24)}@gmail.com`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ message: 'Supabase secrets are not configured.' }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const publicClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let payload: LoginRequest;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ message: '잘못된 요청 형식입니다.' }, 400);
  }

  const normalizedLoginName = normalizeLoginName(payload.loginName ?? '');
  const password = payload.password?.trim() ?? '';

  if (!normalizedLoginName || !password) {
    return jsonResponse({ message: '아이디와 비밀번호를 모두 입력해 주세요.' }, 400);
  }

  if (normalizedLoginName.length < 2 || normalizedLoginName.length > 20) {
    return jsonResponse({ message: '아이디는 2자 이상 20자 이하로 입력해 주세요.' }, 400);
  }

  if (password.length < 4) {
    return jsonResponse({ message: '비밀번호는 4자 이상으로 입력해 주세요.' }, 400);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, login_name, display_name')
    .eq('login_name', normalizedLoginName)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ message: '회원 정보를 확인하지 못했습니다.' }, 500);
  }

  const syntheticEmail = await buildSyntheticEmail(normalizedLoginName);

  if (!profile) {
    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: {
        login_name: normalizedLoginName,
        display_name: normalizedLoginName,
      },
    });

    if (createUserError || !createdUser.user) {
      return jsonResponse({ message: '회원가입 처리에 실패했습니다.' }, 500);
    }

    const { error: insertProfileError } = await adminClient.from('profiles').insert({
      id: createdUser.user.id,
      login_name: normalizedLoginName,
      display_name: normalizedLoginName,
    });

    if (insertProfileError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id);
      return jsonResponse({ message: '회원 프로필 저장에 실패했습니다.' }, 500);
    }

    const { data: signInData, error: signInError } = await publicClient.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });

    if (signInError || !signInData.session || !signInData.user) {
      return jsonResponse({ message: '회원가입 후 로그인 처리에 실패했습니다.' }, 500);
    }

    return jsonResponse({
      mode: 'signed-up-and-logged-in',
      user: {
        id: signInData.user.id,
        loginName: normalizedLoginName,
        displayName: normalizedLoginName,
      },
      session: {
        accessToken: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
      },
    });
  }

  const { data: signInData, error: signInError } = await publicClient.auth.signInWithPassword({
    email: syntheticEmail,
    password,
  });

  if (signInError || !signInData.session || !signInData.user) {
    return jsonResponse({ message: '아이디 또는 비밀번호를 확인해 주세요.' }, 401);
  }

  return jsonResponse({
    mode: 'logged-in',
    user: {
      id: signInData.user.id,
      loginName: profile.login_name,
      displayName: profile.display_name,
    },
    session: {
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
    },
  });
});