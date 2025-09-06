import React from 'react';
import { Clock, Trophy, Coins, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

export default function Dashboard() {
  const { user, studySessions } = useAppContext();

  if (!user) return null;

  const todayStudyTime = studySessions
    .filter(session => new Date(session.date).toDateString() === new Date().toDateString())
    .reduce((total, session) => total + session.duration, 0);

  const weeklyProgress = [
    { day: '月', hours: 4 },
    { day: '火', hours: 6 },
    { day: '水', hours: 3 },
    { day: '木', hours: 5 },
    { day: '金', hours: 7 },
    { day: '土', hours: 2 },
    { day: '日', hours: user.currentWeekStudyTime - 27 },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{user.username}さん！ {user.avatar}
        </h1>
        <p className="text-gray-600 mt-2">今週も頑張って勉強しましょう！</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">保有ベットコイン</p>
                <p className="text-2xl font-bold text-amber-600">{user.betCoins.toLocaleString()}</p>
              </div>
              <Coins className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今週の勉強時間</p>
                <p className="text-2xl font-bold text-emerald-600">{user.currentWeekStudyTime}時間</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総勉強時間</p>
                <p className="text-2xl font-bold text-blue-600">{user.totalStudyTime}時間</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日の勉強</p>
                <p className="text-2xl font-bold text-purple-600">{todayStudyTime}時間</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span>今週の勉強進捗</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-8 text-sm font-medium text-gray-700">{day.day}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((day.hours / 8) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-medium text-right">
                    {day.hours}時間
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                💡 週間目標: 40時間 (現在: {user.currentWeekStudyTime}時間)
              </p>
              <div className="mt-2 bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((user.currentWeekStudyTime / 40) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Race Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <span>今週のレース状況</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏇</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2024年第1週レース
              </h3>
              <p className="text-gray-600 mb-4">残り時間: 3日 12時間</p>
              
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium">現在の順位</p>
                <p className="text-3xl font-bold text-amber-900">6位</p>
                <p className="text-xs text-amber-700">15人中</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>1位との差</span>
                  <span className="font-medium">12時間</span>
                </div>
                <div className="flex justify-between">
                  <span>賞金プール</span>
                  <span className="font-medium text-amber-600">50,000 BC</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Subjects */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>勉強科目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.studySubjects.map((subject, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}