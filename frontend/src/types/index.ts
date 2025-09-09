export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  occupation: string;
  betCoins: number;
  totalStudyTime: number;
  currentWeekStudyTime: number;
  avatar: string;
  createdAt: string;
  /** 追加: レース参加関連 */
  inRace?: boolean;            // 参加しているか
  raceId?: string | null;      // 参加しているレースのID（未参加なら null/undefined）
}

export type RaceStatus = 'upcoming' | 'active' | 'finished';

export interface Race {
  id: string;
  week: string;
  status: RaceStatus;
  startDate: string;  // ISO文字列
  endDate: string;    // ISO文字列
  participants: RaceParticipant[];
  totalPot: number;   // 賞金プール(BC)
}

export interface RaceParticipant {
  /** 追加: Bet.participantId と紐づけるための識別子 */
  id: string;

  user: User;
  currentStudyTime: number;
  dailyProgress: number[];
  position: number;
  odds: {
    win: number;
    place: number;
  };
}

export interface Bet {
  id: string;
  userId: string;
  raceId: string;
  participantId: string;
  type: 'win' | 'place';
  amount: number;
  odds: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName?: string; // Supbase側でJOINして取得
  duration: number;
  date: string;
  betCoinsEarned: number;
}

export interface SubjectWithId {
  id: string;
  name: string;
}


/** --- 任意: UI表示用のビュー型（Dashboardで使うと便利） --- */
/** 参加している場合にUIへ渡す情報 */
export interface RaceViewIn {
  inRace: true;
  weekLabel: string;
  timeRemaining: string;         // "3日 12時間" など
  prizePoolBC: number;
  participantsCount: number;
  currentRank: number;
  diffToFirstHours: number;      // 1位との差(時間)
  top3: string[];                // 上位3名のユーザー名
}

/** 参加していない場合にUIへ渡す情報 */
export interface RaceViewOut {
  inRace: false;
  weekLabel: string;
  timeRemaining: string;
  prizePoolBC: number;
  totalPoints: number;           // 現状の順位からの合計ポイント（UI側仮ロジックでもOK）
  perDayPoints: number[];        // 日別ポイント内訳
}

export type RaceView = RaceViewIn | RaceViewOut;