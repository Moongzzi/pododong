alter table public.profiles
add column if not exists profile_image_url text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login_name text;
  v_display_name text;
  v_profile_image_url text;
begin
  v_login_name := trim(coalesce(new.raw_user_meta_data->>'login_name', ''));
  v_display_name := trim(coalesce(new.raw_user_meta_data->>'display_name', v_login_name));
  v_profile_image_url := nullif(trim(coalesce(new.raw_user_meta_data->>'profile_image_url', new.raw_user_meta_data->>'avatar_url', '')), '');

  if v_login_name = '' then
    raise exception 'login_name is required';
  end if;

  if v_display_name = '' then
    v_display_name := v_login_name;
  end if;

  insert into public.profiles (id, login_name, display_name, profile_image_url)
  values (new.id, v_login_name, v_display_name, v_profile_image_url)
  on conflict (id) do update
    set login_name = excluded.login_name,
        display_name = excluded.display_name,
        profile_image_url = coalesce(excluded.profile_image_url, public.profiles.profile_image_url),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.find_profile_by_login_name(p_login_name text)
returns table (
  user_id uuid,
  login_name text,
  display_name text,
  profile_image_url text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.login_name, p.display_name, p.profile_image_url
  from public.profiles p
  where p.login_name = trim(p_login_name)
  limit 1;
$$;