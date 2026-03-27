drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.find_profile_by_login_name(text);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login_name text;
  v_display_name text;
begin
  v_login_name := trim(coalesce(new.raw_user_meta_data->>'login_name', ''));
  v_display_name := trim(coalesce(new.raw_user_meta_data->>'display_name', v_login_name));

  if v_login_name = '' then
    raise exception 'login_name is required';
  end if;

  if v_display_name = '' then
    v_display_name := v_login_name;
  end if;

  insert into public.profiles (id, login_name, display_name)
  values (new.id, v_login_name, v_display_name)
  on conflict (id) do update
    set login_name = excluded.login_name,
        display_name = excluded.display_name,
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.find_profile_by_login_name(p_login_name text)
returns table (
  user_id uuid,
  login_name text,
  display_name text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.login_name, p.display_name
  from public.profiles p
  where p.login_name = trim(p_login_name)
  limit 1;
$$;

grant execute on function public.find_profile_by_login_name(text) to anon, authenticated;