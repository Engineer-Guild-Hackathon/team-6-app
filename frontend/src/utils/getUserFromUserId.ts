import { supabase } from '../supabaseClient';
import { User } from '../types';

export async function getUserFromUserId(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }

  // DBから取ってきた値をアプリ側の型に合わせる
  const mappedUser: User = {
    id: data.id,
    username: data.username,
    email: data.email,
    age: data.age,
    occupation: data.occupation,
    betCoins: data.bet_coins,
    totalStudyTime: data.total_study_time,
    currentWeekStudyTime: data.current_week_study_time,
    avatar: data.avatar,
    createdAt: data.created_at,
    inRace: false, // これはアプリ側ロジックで設定
    raceId: null,  // これも同上
  };

  return mappedUser;
}
