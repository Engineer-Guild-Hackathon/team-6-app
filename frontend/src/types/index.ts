export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  occupation: string;
  grade?: string; // 階級 (学生、社会人、etc)
  betCoins: number;
  totalStudyTime: number;
  currentWeekStudyTime: number;
  studySubjects: string[];
  avatar: string;
  weeklyRank: number[];
  createdAt: string;
}

export interface Race {
  id: string;
  week: string;
  status: 'upcoming' | 'active' | 'finished';
  startDate: string;
  endDate: string;
  participants: RaceParticipant[];
  totalPot: number;
}

export interface RaceParticipant {
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
  subject: string;
  duration: number;
  date: string;
  betCoinsEarned: number;
}