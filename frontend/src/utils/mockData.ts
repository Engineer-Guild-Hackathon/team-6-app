import { User, Race, RaceParticipant } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'yamada_taro',
    email: 'yamada@example.com',
    age: 25,
    occupation: '会社員',
    grade: '社会人',
    betCoins: 2500,
    totalStudyTime: 120,
    currentWeekStudyTime: 25,
    studySubjects: ['TOEIC', 'プログラミング'],
    avatar: '🧑‍💼',
    weeklyRank: [3, 5, 2, 4, 3, 1, 2],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    username: 'sakura_chan',
    email: 'sakura@example.com',
    age: 17,
    occupation: '高校生',
    grade: '学生',
    betCoins: 1800,
    totalStudyTime: 95,
    currentWeekStudyTime: 32,
    studySubjects: ['数学', '英語'],
    avatar: '👩‍🎓',
    weeklyRank: [1, 2, 1, 2, 1, 3, 1],
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    username: 'coding_master',
    email: 'master@example.com',
    age: 28,
    occupation: 'エンジニア',
    grade: '社会人',
    betCoins: 3200,
    totalStudyTime: 200,
    currentWeekStudyTime: 18,
    studySubjects: ['React', 'Python', 'AWS'],
    avatar: '👨‍💻',
    weeklyRank: [2, 1, 3, 1, 2, 2, 3],
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    username: 'study_queen',
    email: 'queen@example.com',
    age: 22,
    occupation: '大学生',
    grade: '学生',
    betCoins: 2100,
    totalStudyTime: 150,
    currentWeekStudyTime: 28,
    studySubjects: ['簿記', '就活'],
    avatar: '👸',
    weeklyRank: [4, 3, 4, 3, 4, 4, 4],
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    username: 'sensei_san',
    email: 'sensei@example.com',
    age: 35,
    occupation: '教師',
    grade: '社会人',
    betCoins: 1900,
    totalStudyTime: 80,
    currentWeekStudyTime: 15,
    studySubjects: ['教育学', '心理学'],
    avatar: '👨‍🏫',
    weeklyRank: [5, 4, 5, 5, 5, 5, 5],
    createdAt: '2024-01-05',
  },
];

export function generateMockRace(): Race {
  // ランダムに15人選出
  const shuffled = [...mockUsers, ...Array(10).fill(null).map((_, i) => ({
    id: `user_${i + 6}`,
    username: `user_${i + 6}`,
    email: `user${i + 6}@example.com`,
    age: Math.floor(Math.random() * 20) + 18,
    occupation: Math.random() > 0.5 ? '会社員' : '学生',
    grade: Math.random() > 0.5 ? '社会人' : '学生',
    betCoins: Math.floor(Math.random() * 3000) + 500,
    totalStudyTime: Math.floor(Math.random() * 200) + 50,
    currentWeekStudyTime: Math.floor(Math.random() * 40) + 5,
    studySubjects: ['勉強'],
    avatar: ['🧑', '👩', '👨', '👩‍🎓', '👨‍💼'][Math.floor(Math.random() * 5)],
    weeklyRank: Array(7).fill(0).map(() => Math.floor(Math.random() * 15) + 1),
    createdAt: '2024-01-01',
  }))].sort(() => 0.5 - Math.random()).slice(0, 15);

  const participants: RaceParticipant[] = shuffled.map((user, index) => ({
    user,
    currentStudyTime: user.currentWeekStudyTime,
    dailyProgress: Array(7).fill(0).map(() => Math.floor(Math.random() * 8) + 1),
    position: index + 1,
    odds: {
      win: Math.round((Math.random() * 10 + 2) * 100) / 100,
      place: Math.round((Math.random() * 5 + 1.2) * 100) / 100,
    },
  }));

  return {
    id: 'race_2024_w1',
    week: '2024年第1週',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    participants: participants.sort((a, b) => b.currentStudyTime - a.currentStudyTime),
    totalPot: 50000,
  };
}

export function getCurrentUser(): User {
  return {
    id: 'current_user',
    username: 'あなた',
    email: 'you@example.com',
    age: 24,
    occupation: '大学生',
    grade: '学生',
    betCoins: 1500,
    totalStudyTime: 85,
    currentWeekStudyTime: 20,
    studySubjects: ['TOEIC', '簿記'],
    avatar: '🎯',
    weeklyRank: [6, 7, 6, 6, 7, 6, 6],
    createdAt: '2024-01-01',
  };
}