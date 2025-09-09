import { supabase } from '../supabaseClient';

export async function getAllSubjects(): Promise<string[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('name');

  if (error) {
    console.error('Error fetching subjects:', error.message);
    return [];
  }

  return data.map((item: any) => item.name);
}
