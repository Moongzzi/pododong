import { supabase } from './supabase';

function normalizeLoginName(rawValue) {
  return rawValue.normalize('NFC').trim();
}

function normalizeProfileImageUrl(rawValue) {
  if (typeof rawValue !== 'string') {
    return null;
  }

  const trimmedValue = rawValue.trim();

  return trimmedValue || null;
}

function buildFallbackProfile(loginName, profileImageUrl = null) {
  return {
    login_name: loginName,
    display_name: loginName,
    profile_image_url: normalizeProfileImageUrl(profileImageUrl),
  };
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function buildSyntheticEmail(loginName) {
  const digest = await sha256Hex(loginName);
  return `pododong.auth+${digest.slice(0, 24)}@gmail.com`;
}

async function fetchOwnProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('login_name, display_name, profile_image_url')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function ensureOwnProfile(userId, loginName, profileImageUrl = null) {
  const existingProfile = await fetchOwnProfile(userId);
  const nextProfile = {
    id: userId,
    login_name: existingProfile?.login_name?.trim() || loginName,
    display_name: existingProfile?.display_name?.trim() || loginName,
    profile_image_url: normalizeProfileImageUrl(existingProfile?.profile_image_url ?? profileImageUrl),
  };

  const { error } = await supabase.from('profiles').upsert(nextProfile, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });

  if (error) {
    return existingProfile ?? buildFallbackProfile(loginName, profileImageUrl);
  }

  return (await fetchOwnProfile(userId)) ?? buildFallbackProfile(loginName, profileImageUrl);
}

function getProfileSeedFromUser(user) {
  const rawLoginName =
    user?.user_metadata?.login_name ??
    user?.user_metadata?.display_name ??
    user?.raw_user_meta_data?.login_name ??
    user?.raw_user_meta_data?.display_name ??
    '';
  const profileImageUrl =
    user?.user_metadata?.profile_image_url ??
    user?.user_metadata?.avatar_url ??
    user?.raw_user_meta_data?.profile_image_url ??
    user?.raw_user_meta_data?.avatar_url ??
    null;

  const loginName = normalizeLoginName(rawLoginName);

  if (!user?.id || !loginName) {
    return null;
  }

  return {
    userId: user.id,
    loginName,
    profileImageUrl: normalizeProfileImageUrl(profileImageUrl),
  };
}

export async function ensureCurrentUserProfile(user = null) {
  if (!supabase) {
    throw new Error('Supabase 설정이 완료되지 않았습니다.');
  }

  let nextUser = user;

  if (!nextUser) {
    const {
      data: { user: authenticatedUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error('현재 사용자 정보를 확인하지 못했습니다.');
    }

    nextUser = authenticatedUser;
  }

  const profileSeed = getProfileSeedFromUser(nextUser);

  if (!profileSeed) {
    return null;
  }

  return ensureOwnProfile(profileSeed.userId, profileSeed.loginName, profileSeed.profileImageUrl);
}

export async function loginWithNamePassword({ loginName, password }) {
  if (!supabase) {
    throw new Error('Supabase 설정이 완료되지 않았습니다.');
  }

  const normalizedLoginName = normalizeLoginName(loginName);
  const trimmedPassword = password.trim();

  if (!normalizedLoginName || !trimmedPassword) {
    throw new Error('아이디와 비밀번호를 모두 입력해 주세요.');
  }

  if (trimmedPassword.length < 6) {
    throw new Error('비밀번호는 6자 이상으로 입력해 주세요.');
  }

  const syntheticEmail = await buildSyntheticEmail(normalizedLoginName);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: syntheticEmail,
    password: trimmedPassword,
    options: {
      data: {
        login_name: normalizedLoginName,
        display_name: normalizedLoginName,
      },
    },
  });

  const isAlreadyRegistered =
    signUpError?.code === 'user_already_exists' ||
    signUpError?.code === 'email_exists' ||
    (!signUpError &&
      signUpData?.user &&
      Array.isArray(signUpData.user.identities) &&
      signUpData.user.identities.length === 0);

  if (isAlreadyRegistered) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: trimmedPassword,
    });

    if (signInError || !signInData.session || !signInData.user) {
      throw new Error('이미 가입된 계정입니다. 비밀번호를 다시 확인해 주세요. profiles 테이블이 비어 있어도 auth 계정은 남아 있을 수 있습니다.');
    }

    const existingProfile = await ensureOwnProfile(signInData.user.id, normalizedLoginName);

    return {
      mode: 'logged-in',
      user: {
        id: signInData.user.id,
        loginName: existingProfile.login_name,
        displayName: existingProfile.display_name,
        profileImageUrl: existingProfile.profile_image_url,
      },
      session: signInData.session,
    };
  }

  if (signUpError || !signUpData.user) {
    if (signUpError?.status === 422) {
      if (signUpError.code === 'user_already_exists' || signUpError.code === 'email_exists') {
        throw new Error('이미 가입된 계정입니다. 비밀번호를 다시 확인해 주세요.');
      }

      if (signUpError.code === 'email_address_not_authorized') {
        throw new Error('Supabase 기본 메일 정책 때문에 현재 이메일 가입을 처리할 수 없습니다. Email Confirm을 끄거나 SMTP 설정을 확인해 주세요.');
      }

      if (signUpError.code === 'email_address_invalid' || signUpError.code === 'validation_failed') {
        throw new Error(`회원가입 이메일 형식을 Supabase가 허용하지 않습니다: ${signUpError.message}`);
      }

      if (signUpError.code === 'weak_password') {
        throw new Error('비밀번호 강도가 부족합니다. 더 길고 복잡한 비밀번호를 입력해 주세요.');
      }

      if (signUpError.message?.toLowerCase().includes('password')) {
        throw new Error('비밀번호는 6자 이상으로 입력해 주세요.');
      }

      if (signUpError.message?.toLowerCase().includes('email')) {
        throw new Error(`회원가입 이메일 형식을 Supabase가 허용하지 않습니다: ${signUpError.message}`);
      }

      throw new Error(signUpError.message || '회원가입 입력값을 다시 확인해 주세요.');
    }

    throw new Error(signUpError?.message || '회원가입 처리에 실패했습니다.');
  }

  let nextSession = signUpData.session;

  if (!nextSession) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: trimmedPassword,
    });

    if (signInError || !signInData.session || !signInData.user) {
      throw new Error('회원가입 후 로그인 처리에 실패했습니다. 이메일 인증 설정을 확인해 주세요.');
    }

    nextSession = signInData.session;
  }

  const newProfile = await ensureOwnProfile(signUpData.user.id, normalizedLoginName);

  return {
    mode: 'signed-up-and-logged-in',
    user: {
      id: signUpData.user.id,
      loginName: newProfile.login_name,
      displayName: newProfile.display_name,
      profileImageUrl: newProfile.profile_image_url,
    },
    session: nextSession,
  };
}