import React from 'react';
import { Clock, Trophy, Coins, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { generateMockRace } from '../../utils/mockData';

// 参加していない時の暫定ポイント換算（必要に応じて差し替え）
const rankToPoints = (rank: number) => {
  if (rank === 1) return 100;
  if (rank === 2) return 70;
  if (rank === 3) return 50;
  if (rank <= 5) return 30;
  if (rank <= 10) return 20;
  return 10;
};

export default function Dashboard() {
  const { user, studySessions } = useAppContext();
  if (!user) return null;

  // 今日の学習時間合計
  const todayStudyTime = studySessions
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((total, s) => total + s.duration, 0);

  // 週次可視化（ダミー）
  const MAX_DAILY = 10; // 1日の目安
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

  // レース情報（IIFEをやめて先に計算）
  const race = generateMockRace(user.inRace ? user : undefined);
  const participants = race.participants;
  const me = participants.find((p) => p.user.id === user.id) ?? null;
  const top3 = participants.slice(0, 3).map((p) => p.user.username);
  const diffToFirstHours =
    me ? Math.max(0, (participants[0]?.currentStudyTime ?? 0) - me.currentStudyTime) : null;

  // 不参加時のポイント合算（暫定）
  const perDayPoints = (user.weeklyRank ?? []).map(rankToPoints);
  const totalPoints = perDayPoints.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{user.username}さん！ {user.avatar}
        </h1>
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
          <CardContent className="pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center">
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
          <CardContent className="pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center">
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
          <CardContent className="pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center">
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

      {/* 週次進捗 & レース状況 */}
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
            {/* 縦棒グラフ */}
            <div className="flex items-end justify-between h-40 px-2">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-6 h-32 bg-gray-200/70 rounded-t-lg relative overflow-hidden flex items-end">
                    <div
                      className="bg-emerald-500 w-full transition-[height] duration-500 rounded-t-lg"
                      style={{
                        height: `${Math.min((day.hours / MAX_DAILY) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-700">{day.day}</div>
                  <div className="text-xs text-gray-500">{day.hours}時間</div>
                </div>
              ))}
            </div>

            {/* 週間目標（横） */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                💡 週間目標: 40時間 (現在:{' '}
                {(user.currentWeekStudyTime ?? 0).toLocaleString('ja-JP')}
                時間)
              </p>
              <div className="mt-2 bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.min(((user.currentWeekStudyTime ?? 0) / 40) * 100, 100)}%`,
                  }}
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
                {user.inRace ? (
                  <span className="ml-3 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-base font-semibold text-emerald-700">
                    レース参加
                  </span>
                ) : (
                  <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-base font-semibold text-gray-600">
                    ベット参加
                  </span>
                )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* レース基本情報（共通） */}
            <div className="text-center py-6">
              <div className="text-6xl mb-3">🏇</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{race.week}</h3>
              <p className="text-gray-600">残り時間: 3日 12時間</p>
            </div>

            {user.inRace && me ? (
              <div className="space-y-4">
                {/* 優勝賞金（共通） */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-medium">優勝賞金</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {race.totalPot.toLocaleString('ja-JP')} BC
                  </p>
                </div>

                {/* 順位表（見やすいレイアウト版） */}
                {(() => {
                  const first = participants[0];
                  const diffToFirstHours = Math.max(
                    0,
                    (first?.currentStudyTime ?? 0) - me.currentStudyTime
                  );

                  // 上位3名 + （自分がTOP3外なら自分 / TOP3内なら4位）
                  const top3 = participants.slice(0, 3);
                  const rows = me.position > 3 ? [...top3, me] : [...top3, participants[3]].filter(Boolean);

                  // 重複除去
                  const seen = new Set<string>();
                  const list = rows.filter(p => !seen.has(p.user.id) && (seen.add(p.user.id), true));

                  const medal = (pos: number) => (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '');

                  return (
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 mb-3">順位表</p>
                      <ul className="space-y-2">
                        {list.map((p) => {
                          const isMe = p.user.id === user.id;
                          return (
                            <li
                              key={p.user.id}
                              className={[
                                "flex items-center justify-between rounded-lg border",
                                "border-gray-100 bg-white px-3 py-2.5 transition-colors",
                                "hover:bg-gray-50",
                                isMe ? "ring-1 ring-emerald-200/60" : ""
                              ].join(" ")}
                            >
                              {/* 左側：順位・アバター・名前 */}
                              <div className="flex items-center gap-3 min-w-0">
                                {/* 順位（等幅数字で揃える） */}
                                <span className="w-8 text-right tabular-nums text-gray-500">{p.position}.</span>

                                {/* メダル or プレースホルダ */}
                                <span className="w-6 text-center">{medal(p.position)}</span>

                                {/* アバター */}
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-base">
                                  {p.user.avatar}
                                </span>

                                {/* ユーザー名 */}
                                <span
                                  className={[
                                    "truncate",
                                    "text-base md:text-lg",
                                    isMe ? "font-semibold text-gray-900" : "font-medium text-gray-800"
                                  ].join(" ")}
                                  title={p.user.username}
                                >
                                  {p.user.username}
                                </span>

                                {isMe && (
                                  <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                    あなた
                                  </span>
                                )}
                              </div>

                              {/* 右側：自分の行だけ 1位との差 */}
                              <div className="shrink-0">
                                {isMe ? (
                                  <span className="text-base text-gray-600">− 1位との差 {diffToFirstHours}時間</span>
                                ) : (
                                  <span className="text-sm text-transparent select-none">_</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // 2) 参加していない場合（既存のポイント表示のまま）
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-medium">優勝賞金</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {race.totalPot.toLocaleString('ja-JP')} BC
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">現状の順位によるポイント合計</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>日別内訳</span>
                      <span>
                        {perDayPoints.join(' + ')} = <b>{totalPoints}</b> pt
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ※ 暫定ロジックです。サーバーの正式ルールに合わせて後で置き換えてください。
                    </p>
                  </div>
                </div>
              </div>
            )}

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
