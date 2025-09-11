import { supabase } from "../supabaseClient";
import { Race } from "../types";

export const getRaceFromId = async (id: string): Promise<Race | null> => {
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching race:", error);
    return null;
  }

  // return data; 
  return {
    id: data.id,
    name: data.name,
    status: data.status,
    raceStartDate: data.race_start_date,
    raceEndDate: data.race_end_date,
    totalPot: data.total_pot,
    firstPrize: data.first_prize,
    secondPrize: data.second_prize,
    thirdPrize: data.third_prize,
    drawingStartDate: data.drawing_start_date,
    drawingEndDate: data.drawing_end_date,
    updatedAt: data.updated_at,
    createdAt: data.created_at,
    minAge: data.min_age ? data.min_age : null,
    maxAge: data.max_age ? data.max_age : null,
  };

};
