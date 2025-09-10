import { supabase } from '../supabaseClient';
import { StudySession } from '../types';

export async function getTodayStudySessionsFromUserId(userId: string): Promise<StudySession[]> {
  // 今日の開始と終了の日時を作成
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('userId', userId)
    .gte('date', startOfDay.toISOString())  // >= 今日の00:00
    .lt('date', endOfDay.toISOString());   // < 明日の00:00

  if (error) {
    console.error(error);
    return [];
  }

  return data as StudySession[];
}
