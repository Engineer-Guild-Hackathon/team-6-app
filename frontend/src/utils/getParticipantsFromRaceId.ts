import { supabase } from "../supabaseClient";
import { UserPrivate } from "../types";

export const getParticipantsFromRaceId = async (raceId: string): Promise<UserPrivate[]> => {
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
    .eq("race_id", raceId);

  if (!data) {
    return [];
  }
  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
  return (data || []).map((p: any) => ({
  id: p.user_id,
  username: p.users.username,
  avatar: p.users?.avatar || '',
  age: p.users.age,
  occupation: p.users.occupation,
  totalStudyTime: p.users.total_study_time || 0,
  betCoins: p.users.bet_coins || 0,
  currentWeekStudyTime: p.users.current_week_study_time || 0,
} as UserPrivate));

};
