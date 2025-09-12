import { supabase } from "../supabaseClient";
import { UserPrivate } from "../types";

// 返す型を UserPrivate に position を足したものにする
export type RankedUserPrivate = UserPrivate & { position: number };

export const getParticipantsFromRaceId = async (raceId: string): Promise<RankedUserPrivate[]> => {
  const { data, error } = await supabase
    .from("race_participants")
    .select(
      `
      user_id,
      users:users(
        username,
        avatar,
        age,
        occupation,
        bet_coins,
        total_study_time,
        current_week_study_time
      )
    `
    )
    .eq("race_id", raceId)
    // 学習時間で降順にする
    .order("current_week_study_time", { foreignTable: "users", ascending: false });

  if (!data) {
    return [];
  }

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }

  return (data || []).map((p: any,idx:number) => ({
  id: p.user_id,
  username: p.users.username,
  avatar: p.users?.avatar || '',
  age: p.users.age,
  occupation: p.users.occupation,
  totalStudyTime: p.users.total_study_time || 0,
  betCoins: p.users.bet_coins || 0,
  currentWeekStudyTime: p.users.current_week_study_time || 0,
  // 順位をmapの順序で付与
  position: idx + 1,
} as UserPrivate));

};
