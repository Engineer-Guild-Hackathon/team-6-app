import { supabase } from '../supabaseClient';
import { StudySession } from '../types';

export async function getStudySessionsFromUserId(userId: string): Promise<StudySession[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      id,
      user_id,
      subject_id,
      duration,
      date,
      bet_coins_earned,
      subjects (name) 
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching study sessions:', error.message);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    subjectId: item.subject_id,
    subjectName: item.subjects?.name || '',
    duration: item.duration,
    date: item.date,
    betCoinsEarned: item.bet_coins_earned,
  }));
}
