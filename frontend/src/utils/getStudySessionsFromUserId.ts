import { supabase } from '../supabaseClient';
import { StudySession } from '../types';

/**
 * 今週の「月曜00:00(ローカル)」～「翌月曜00:00(ローカル)」を
 * UTC ISO 文字列にして返す（timestamptz 用）
 *
 * ※ ブラウザ実行前提で、ローカルタイムはユーザーの環境 (JST) を利用。
 *   SSR の場合や別TZにしたい場合は、明示的なTZ計算が必要。
 */
function getThisWeekRangeISO(base = new Date()) {
  // 今日のローカル日付 00:00
  const d0 = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  // 0=Sun ... 6=Sat → Mon=0 になる差分
  const dow = d0.getDay();
  const diffToMon = (dow + 6) % 7;

  // 今週の月曜 00:00 (ローカル)
  const startLocal = new Date(d0);
  startLocal.setDate(d0.getDate() - diffToMon);

  // 翌週の月曜 00:00 (ローカル) [上限は lt で使う]
  const endLocal = new Date(startLocal);
  endLocal.setDate(startLocal.getDate() + 7);

  // ローカル→UTC ISO 文字列に変換
  const toUTCISO = (x: Date) => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString();

  return {
    startISO: toUTCISO(startLocal), // 例: 2025-09-07T15:00:00.000Z (JSTの月曜0時)
    endISO: toUTCISO(endLocal),     // 例: 2025-09-14T15:00:00.000Z (JSTの翌月曜0時)
  };
}

export async function getStudySessionsFromUserId(userId: string): Promise<StudySession[]> {
  const { startISO, endISO } = getThisWeekRangeISO();

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
    .gte('date', startISO)  // 今週の月曜0:00（JST→UTC）
    .lt('date', endISO)     // 翌週の月曜0:00（JST→UTC）※ltで半開区間
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
