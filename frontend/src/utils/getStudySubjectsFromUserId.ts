import { supabase } from '../supabaseClient';
import { SubjectWithId } from '../types';

export async function getStudySubjectsFromUserId(userId: string): Promise<SubjectWithId[]> {
  const { data, error } = await supabase
    .from('user_subjects')
    .select('subjects(id, name)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching study subjects:', error.message);
    return [];
  }

  return data.map((item: any) => ({
    id: item.subjects.id,
    name: item.subjects.name,
  }));
}
