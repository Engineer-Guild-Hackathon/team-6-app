import { User, Race} from '../types';

const RACE_ID = 'race_2024_w1';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'yamada_taro',
    email: 'yamada@example.com',
    age: 25,
    occupation: '会社員',
    betCoins: 2500,
    totalStudyTime: 120,
    currentWeekStudyTime: 25,
    currentWeekStudyGoal: 30,
    avatar: '🧑‍💼',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    username: 'sakura_chan',
    email: 'sakura@example.com',
    age: 17,
    occupation: '高校生',
    betCoins: 1800,
    totalStudyTime: 95,
    currentWeekStudyTime: 32,
    currentWeekStudyGoal: 30,
    avatar: '👩‍🎓',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    username: 'coding_master',
    email: 'master@example.com',
    age: 28,
    occupation: 'エンジニア',
    betCoins: 3200,
    totalStudyTime: 200,
    currentWeekStudyTime: 18,
    currentWeekStudyGoal: 30,
    avatar: '👨‍💻',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    username: 'study_queen',
    email: 'queen@example.com',
    age: 22,
    occupation: '大学生',
    betCoins: 2100,
    totalStudyTime: 150,
    currentWeekStudyTime: 28,
    currentWeekStudyGoal: 30,
    avatar: '👸',
    createdAt: '2024-01-20',
  },
  {
    id: '5',
    username: 'sensei_san',
    email: 'sensei@example.com',
    age: 35,
    occupation: '教師',
    betCoins: 1900,
    totalStudyTime: 80,
    currentWeekStudyTime: 15,
    currentWeekStudyGoal: 30,
    avatar: '👨‍🏫',
    createdAt: '2024-01-05',
  },
];

export function generateMockRace(currentUser?: User): Race {
  // ベースのプール（既存モック + ランダム生成10人）
  const basePool: User[] = [
    ...mockUsers,
    ...Array(10).fill(null).map((_, i) => ({
      id: `user_${i + 6}`,
      username: `user_${i + 6}`,
      email: `user${i + 6}@example.com`,
      age: Math.floor(Math.random() * 20) + 18,
      occupation: Math.random() > 0.5 ? '会社員' : '学生',
      grade: Math.random() > 0.5 ? '社会人' : '学生',
      betCoins: Math.floor(Math.random() * 3000) + 500,
      totalStudyTime: Math.floor(Math.random() * 200) + 50,
      currentWeekStudyTime: Math.floor(Math.random() * 40) + 5,
      currentWeekStudyGoal: 30,
      studySubjects: ['勉強'],
      avatar: ['🧑', '👩', '👨', '👩‍🎓', '👨‍💼'][Math.floor(Math.random() * 5)],
      weeklyRank: Array(7).fill(0).map(() => Math.floor(Math.random() * 15) + 1),
      createdAt: '2024-01-01',
    })),
  ];

  return {
    id: 'race_2024_w1',
    name: '2024年第1週',
    status: 'active',
    raceStartDate: '2024-01-01',
    raceEndDate: '2024-01-07',
    totalPot: 50000,
    firstPrize: 20000,
    secondPrize: 15000,
    thirdPrize: 10000,
    drawingStartDate: '2024-01-08',
    drawingEndDate: '2024-01-10',
    updatedAt: '2024-01-01',
    createdAt: '2024-01-01',
  };
}

export function getCurrentUser(): User {
  return {
    id: 'current_user',
    username: 'あなた',
    email: 'you@example.com',
    age: 24,
    occupation: '大学生',
    betCoins: 1500,
    totalStudyTime: 85,
    currentWeekStudyTime: 10,
    currentWeekStudyGoal: 20,
    avatar: '🎯',
    createdAt: '2024-01-01',
    inRace: true, 
    raceId: RACE_ID, 
  };
}