import {supabase} from '../supabaseClient';
import { UserPrivate } from '../types';

// BC順にユーザーを取得する関数
export async function getUsersByBetCoins(): Promise<UserPrivate[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar, age, occupation, bet_coins, total_study_time')
    .order('bet_coins', { ascending: false });

  if (error) {
    console.error('Error fetching users by betCoins:', error.message);
    return [];
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    age: u.age,
    occupation: u.occupation,
    betCoins: u.bet_coins || 0,
    totalStudyTime: u.total_study_time || 0,
    currentWeekStudyTime: u.current_week_study_time || 0,
  }));
}

// 総勉強時間順にユーザーを取得する関数
export async function getUsersByStudyTime(): Promise<UserPrivate[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar, age, occupation, bet_coins, total_study_time')
    .order('total_study_time', { ascending: false });

  if (error) {
    console.error('Error fetching users by study time:', error.message);
    return [];
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    age: u.age,
    occupation: u.occupation,
    betCoins: u.bet_coins,
    totalStudyTime: u.total_study_time,
    currentWeekStudyTime: u.current_week_study_time,
  }));
}