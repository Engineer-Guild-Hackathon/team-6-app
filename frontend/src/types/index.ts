export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  occupation: string;
  betCoins: number;
  totalStudyTime: number;
  currentWeekStudyTime: number;
  currentWeekStudyGoal: number;
  avatar: string;
  createdAt: string;
  /** 追加: レース参加関連 */
  inRace?: boolean;            // 参加しているか
  raceId?: string | null;      // 参加しているレースのID（未参加なら null/undefined）
}

export type RaceStatus = 'upcoming' | 'active' | 'finished' | 'drawing';

export interface Race {
  id: string;
  name: string;
  status: RaceStatus;
  raceStartDate: string;  // ISO文字列
  raceEndDate: string;    // ISO文字列
  participants?: RaceParticipant[]; // DBにはない
  totalPot: number;   // 賞金プール(BC)
  firstPrize: number; // 1位賞金(BC)
  secondPrize: number;// 2位賞金(BC)
  thirdPrize: number; // 3位賞金(BC)
  drawingStartDate: string; // 抽選開始日時(ISO文字列)
  drawingEndDate: string;   // 抽選終了日時(ISO文字列)
  updatedAt: string; // ISO文字列
  createdAt: string; // ISO文字列
  minAge?: number; // 参加最低年齢, 条件指定に用いる
  maxAge?: number; // 参加最高年齢
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
// ベットの種類(単勝，複勝，応援馬券(単勝と複勝の1:1配分))
export type BetType = `win` | `place` | `support`;

export interface Bet {
  id: string;
  userId: string;
  raceId: string;
  participantId: string;
  type: BetType;
  amount: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName?: string; // Supbase側でJOINして取得
  duration: number;
  comment?: string;
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

// ランキング画面用
export interface UserPrivate {
  id: string;
  avatar: string;
  username: string;
  age: number;
  occupation: string;
  betCoins: number;
  totalStudyTime: number;
  currentWeekStudyTime: number;
  winOdds?: number;   // 追加: 単勝オッズ
  placeOdds?: number; // 追加: 複勝オッズ
};