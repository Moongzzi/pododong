import { FILLED_GRAPE_VARIANTS } from '../constants/grapeCluster';
import { supabase } from './supabase';

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase 설정이 완료되지 않았습니다.');
  }
}

export function getMonthStart(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function getDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getRandomVariant() {
  const randomIndex = Math.floor(Math.random() * FILLED_GRAPE_VARIANTS.length);
  return FILLED_GRAPE_VARIANTS[randomIndex];
}

export async function fetchMonthlyTop3(targetMonth = getMonthStart()) {
  ensureSupabase();

  const { data, error } = await supabase.rpc('get_monthly_top3', {
    p_target_month: targetMonth,
  });

  if (error) {
    throw new Error('이번 달 베스트 회원을 불러오지 못했습니다.');
  }

  return data ?? [];
}

export async function fetchGrapeField(targetMonth = getMonthStart()) {
  ensureSupabase();

  const { data, error } = await supabase.rpc('get_grape_field', {
    p_target_month: targetMonth,
  });

  if (error) {
    throw new Error('포도밭 현황을 불러오지 못했습니다.');
  }

  return data ?? [];
}

export async function fetchMyGrapeCluster(targetMonth = getMonthStart()) {
  ensureSupabase();

  const { data, error } = await supabase.rpc('get_my_grape_cluster', {
    p_target_month: targetMonth,
  });

  if (error) {
    throw new Error('내 포도송이 정보를 불러오지 못했습니다.');
  }

  return data;
}

export async function fetchMonthlyGoal({ userId, targetMonth = getMonthStart() }) {
  ensureSupabase();

  const { data, error } = await supabase
    .from('monthly_goals')
    .select('id, goal_text, is_locked, target_month')
    .eq('user_id', userId)
    .eq('target_month', targetMonth)
    .maybeSingle();

  if (error) {
    throw new Error('이번 달 목표를 확인하지 못했습니다.');
  }

  return data;
}

export async function saveMonthlyGoal({ userId, goalText, targetMonth = getMonthStart() }) {
  ensureSupabase();

  const { data, error } = await supabase
    .from('monthly_goals')
    .insert({
      user_id: userId,
      target_month: targetMonth,
      goal_text: goalText.trim(),
    })
    .select('id, goal_text, is_locked, target_month')
    .single();

  if (error) {
    if (error.code === '23505' || error.status === 409) {
      throw new Error('이번 달 목표는 이미 저장되어 있습니다.');
    }

    throw new Error('이번 달 목표를 저장하지 못했습니다.');
  }

  return data;
}

export async function addGrapeEntry({ userId, fillDate = getDateString(), variant = getRandomVariant() }) {
  ensureSupabase();

  const { data, error } = await supabase
    .from('grape_entries')
    .insert({
      user_id: userId,
      fill_date: fillDate,
      variant,
    })
    .select('id, fill_date, variant, target_month')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('오늘은 이미 포도알을 채웠습니다.');
    }

    throw new Error('포도알 저장에 실패했습니다.');
  }

  return data;
}