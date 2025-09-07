import React from 'react';
import { Clock, Trophy, Coins, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

/** 共通の統計カード */
function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  color = 'emerald',
  ariaLabel,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  color?: 'amber' | 'emerald' | 'blue' | 'purple';
  ariaLabel?: string;
}) {
  const tone = {
    amber:  { text: 'text-amber-600', chip: 'text-amber-700 bg-amber-50 ring-1 ring-amber-100' },
    emerald:{ text: 'text-emerald-600', chip: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100' },
    blue:   { text: 'text-blue-600', chip: 'text-blue-700 bg-blue-50 ring-1 ring-blue-100' },
    purple: { text: 'text-purple-600', chip: 'text-purple-700 bg-purple-50 ring-1 ring-purple-100' },
  } as const;

  return (
    <Card
      aria-label={ariaLabel ?? label}
      className="rounded-2xl border border-gray-100 shadow-sm transition-colors hover:bg-gray-50/60"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 tracking-wide">{label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-2xl font-semibold ${tone[color].text}`}>{value}</span>
              {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
            </div>
          </div>
          <div
            className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full ${tone[color].chip}`}
            aria-hidden="true"
          >
            <Icon className={`${tone[color].text} h-5 w-5`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, studySessions } = useAppContext();
  if (!user) return null;

  // 今日の学習時間（0なら "—" 表示にしたい場合は下の fmt を使う）
  const todayStudyTime = studySessions
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((total, s) => total + s.duration, 0);

  // 週次の可視化
  const MAX_DAILY = 8; // 1日の目安
  const base = { mon: 4, tue: 6, wed: 3, thu: 5, fri: 7, sat: 2 };
  const sumMonToSat = base.mon + base.tue + base.wed + base.thu + base.fri + base.sat;
  const sundayHours = Math.max(0, (user.currentWeekStudyTime ?? 0) - sumMonToSat);

  const weeklyProgress = [
    { day: '月', hours: base.mon },
    { day: '火', hours: base.tue },
    { day: '水', hours: base.wed },
    { day: '木', hours: base.thu },
    { day: '金', hours: base.fri },
    { day: '土', hours: base.sat },
    { day: '日', hours: sundayHours },
  ];

  const fmt = (n: number) => (n > 0 ? n.toLocaleString('ja-JP') : '—');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{user.username}さん！ {user.avatar}
        </h1>
        <p className="text-gray-600 mt-2">今週も頑張って勉強しましょう！</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 items-stretch">
        <Card className="flex-1 rounded-2xl shadow-md border border-gray-100">
          <CardContent className="pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-orange-50 mb-3">
              <Coins className="h-7 w-7 text-orange-500" />
            </div>
            <p className="text-base text-gray-600">保有ベットコイン</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {user.betCoins.toLocaleString('ja-JP')}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-2xl shadow-md border border-gray-100">
          <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-emerald-50 mb-3">
              <Clock className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-base text-gray-600">今週の勉強時間</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {user.currentWeekStudyTime}時間
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-2xl shadow-md border border-gray-100">
          <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-50 mb-3">
              <TrendingUp className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-base text-gray-600">総勉強時間</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {user.totalStudyTime}時間
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-2xl shadow-md border border-gray-100">
          <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-purple-50 mb-3">
              <Target className="h-7 w-7 text-purple-500" />
            </div>
            <p className="text-base text-gray-600">今日の勉強</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {todayStudyTime}時間
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span>今週の勉強進捗</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-8 text-sm font-medium text-gray-700">{day.day}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200/70 rounded-full h-3 relative overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${Math.min((day.hours / MAX_DAILY) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-medium text-right">{day.hours}時間</div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                💡 週間目標: 40時間 (現在: {(user.currentWeekStudyTime ?? 0).toLocaleString('ja-JP')}時間)
              </p>
              <div className="mt-2 bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${Math.min(((user.currentWeekStudyTime ?? 0) / 40) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Race Status */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <span>今週のレース状況</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏇</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2024年第1週レース</h3>
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
                  <span className="font-medium text-amber-600">
                    {(50000).toLocaleString('ja-JP')} BC
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Subjects */}
      <Card className="mt-8 rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>勉強科目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.studySubjects.map((subject: string, index: number) => (
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
