drop function if exists public.get_monthly_top3(date);

create or replace function public.get_monthly_top3(
  p_target_month date default date_trunc('month', current_date)::date
)
returns table (
  user_id uuid,
  display_name text,
  profile_image_url text,
  grape_count bigint,
  rank bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with monthly_counts as (
    select
      ge.user_id,
      count(*)::bigint as grape_count
    from public.grape_entries ge
    where ge.target_month = p_target_month
    group by ge.user_id
  ),
  ranked_members as (
    select
      mc.user_id,
      p.display_name,
      p.profile_image_url,
      mc.grape_count,
      row_number() over (
        order by mc.grape_count desc, p.display_name asc, mc.user_id asc
      )::bigint as rank
    from monthly_counts mc
    join public.profiles p on p.id = mc.user_id
  )
  select
    rm.user_id,
    rm.display_name,
    rm.profile_image_url,
    rm.grape_count,
    rm.rank
  from ranked_members rm
  where rm.rank <= 3
  order by rm.rank;
$$;

grant execute on function public.get_monthly_top3(date) to anon, authenticated;

drop function if exists public.get_grape_field(date);

create or replace function public.get_grape_field(
  p_target_month date default date_trunc('month', current_date)::date
)
returns table (
  user_id uuid,
  display_name text,
  profile_image_url text,
  grape_count bigint,
  goal_text text
)
language sql
stable
security definer
set search_path = public
as $$
  with monthly_counts as (
    select
      ge.user_id,
      count(*)::bigint as grape_count
    from public.grape_entries ge
    where ge.target_month = p_target_month
    group by ge.user_id
  ),
  monthly_goals_for_target as (
    select
      mg.user_id,
      mg.goal_text
    from public.monthly_goals mg
    where mg.target_month = p_target_month
  )
  select
    p.id as user_id,
    p.display_name,
    p.profile_image_url,
    coalesce(mc.grape_count, 0)::bigint as grape_count,
    coalesce(mg.goal_text, '') as goal_text
  from public.profiles p
  left join monthly_counts mc on mc.user_id = p.id
  left join monthly_goals_for_target mg on mg.user_id = p.id
  order by coalesce(mc.grape_count, 0) desc, p.display_name asc, p.id asc;
$$;

grant execute on function public.get_grape_field(date) to anon, authenticated;