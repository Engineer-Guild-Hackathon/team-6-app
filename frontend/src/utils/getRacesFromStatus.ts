import { supabase } from "../supabaseClient";
import { Race, RaceStatus } from "../types";

export async function getRacesFromStatus(raceStatus: RaceStatus): Promise<Race[]> {
    const { data, error } = await supabase.from(`races`).select('*').eq('status', raceStatus).order('race_start_date', { ascending: false });

    if (error) {
        console.error('Error fetching races:', error);
        return [];
    }
    if (!data || data.length === 0) {
        return [];
    }
    // return data as Race[];
    // これだとDBの命名のまま属性を持つ，snakeケースからCamelケースへ変換しないとundefinedになりデータを取得できないエラーに陥る
    return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        raceStartDate: d.race_start_date,
        raceEndDate: d.race_end_date,
        totalPot: d.total_pot,
        firstPrize: d.first_prize,
        secondPrize: d.second_prize,
        thirdPrize: d.third_prize,
        drawingStartDate: d.drawing_start_date,
        drawingEndDate: d.drawing_end_date,
        updatedAt: d.updated_at,
        createdAt: d.created_at,
        minAge: d.min_age ? d.min_age : null,
        maxAge: d.max_age ? d.max_age : null,
    })) as unknown as Race []; // unknownとしてあげることで型エラーを回避
}