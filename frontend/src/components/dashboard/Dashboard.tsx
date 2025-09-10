import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Coins, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';
import { generateMockRace } from '../../utils/mockData';
import { Link } from 'react-router-dom';
import { StudySession } from '../../types';
import { getTodayStudySessionsFromUserId } from '../../utils/getTodayStudySessionsFromUserId';

// 参加していない時の暫定ポイント換算
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
  const [todayStudySessions, setTodayStudySessions] = useState<StudySession[]>([]);
  const [todayStudyTime, setTodayStudyTime] = useState(0);

  if (!user) return null;

  useEffect(() => {
    // 今日の勉強記録を抽出
    const fetchTodayStudySessions = async () => {
      const todayStudySessions = await getTodayStudySessionsFromUserId(user.id);
      setTodayStudySessions(todayStudySessions);

      // 今日の勉強時間を計算
      const totalToday = todayStudySessions.reduce((sum, session) => sum + session.duration, 0);
      setTodayStudyTime(totalToday);
    };
    fetchTodayStudySessions();
  }, [user]);

  const MAX_DAILY = 10;
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

  const race = generateMockRace(user.inRace ? user : undefined);
  const participants = race.participants;
  const me = participants.find((p) => p.user.id === user.id);

  // const perDayPoints = (user.weeklyRank ?? []).map(rankToPoints);
  // const totalPoints = perDayPoints.reduce((a, b) => a + b, 0);

  const medal = (pos: number) => (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{user.username}さん！ {user.avatar}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 items-stretch">
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-orange-50 mb-2 sm:mb-3">
              <Coins className="h-7 w-7 text-orange-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">保有ベットコイン</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-0.5 md:mt-1">
              {user.betCoins.toLocaleString('ja-JP')}
            </p>
          </CardContent>
        </Card>

        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-50 mb-2 sm:mb-3">
              <TrendingUp className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">総勉強時間</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-0.5 md:mt-1">
              {(Math.floor(user.totalStudyTime / 60) ?? 0).toLocaleString('ja-JP')}時間
            </p>
          </CardContent>
        </Card>
        
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-emerald-50 mb-2 sm:mb-3">
              <Clock className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">今週の勉強時間</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-0.5 md:mt-1">
              {(Math.floor(user.currentWeekStudyTime / 60) ?? 0).toLocaleString('ja-JP')}時間
            </p>
          </CardContent>
        </Card>

        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-purple-50 mb-2 sm:mb-3">
              <Target className="h-7 w-7 text-purple-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">今日の勉強</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-0.5 md:mt-1">
              {(todayStudyTime ?? 0).toLocaleString('ja-JP')}時間
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              今週の勉強進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 昨日の学習リスト */}
            {(() => {
              // 昨日の日付（ローカル）
              const now = new Date();
              const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
              const yKey = y.toDateString();

              // 昨日分を抽出
              const yesterdaySessions = studySessions.filter(
                (s) => new Date(s.date).toDateString() === yKey
              );

              // 何もなければダミー表示
              const items =
                yesterdaySessions.length > 0
                  ? yesterdaySessions.map((s, i) => ({
                      id: s.id ?? `ys-${i}`,
                      subject: s.subject,
                      duration: s.duration,
                      note: s.betCoinsEarned > 0 ? `+${s.betCoinsEarned} BC 獲得` : '記録のみ',
                    }))
                  : [
                      { id: 'd1', subject: 'TOEIC リスニング', duration: 1.5, note: '公式問題集 Test 2' },
                      { id: 'd2', subject: '簿記 仕訳', duration: 0.8, note: '過去問 10問' },
                      { id: 'd3', subject: '英単語', duration: 0.5, note: 'ターゲット600語復習' },
                    ];

              return (
                <div className="mb-5 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">昨日の学習</p>
                    <span className="text-xs text-gray-500">
                      {y.getFullYear()}/{y.getMonth() + 1}/{y.getDate()}
                    </span>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {items.map((it) => (
                      <li key={it.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                            {it.subject}
                          </span>
                          <p className="mt-1 text-sm text-gray-700 truncate">{it.note}</p>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                          {it.duration} 時間
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* 縦棒グラフ（既存） */}
            <div className="flex items-end justify-between h-40 px-2">
              {weeklyProgress.map((d) => (
                <div key={d.day} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-6 h-32 bg-gray-200 rounded-t-lg flex items-end">
                    <div
                      className="bg-emerald-500 w-full rounded-t-lg"
                      style={{ height: `${Math.min((d.hours / MAX_DAILY) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm">{d.day}</div>
                  <div className="text-xs text-gray-500">{d.hours}時間</div>
                </div>
              ))}
            </div>

            {/* 週間目標（透明感ある色分岐） */}
            <div className="mt-4 bg-emerald-50 p-3 rounded-lg">
              💡 週間目標: 40時間 (現在: {user.currentWeekStudyTime}時間)
              <div className="mt-2 bg-gray-200 h-2 rounded-full">
                {(() => {
                  const progress = (user.currentWeekStudyTime ?? 0) / 40;
                  let barColor = 'bg-emerald-500/70'; // デフォ：緑（透過）
                  if (progress < 0.3) {
                    barColor = 'bg-red-500/70'; // 30%未満 → 赤（透過）
                  } else if (progress < 0.6) {
                    barColor = 'bg-yellow-500/70'; // 60%未満 → 黄（透過）
                  }
                  return (
                    <div
                      className={`${barColor} h-2 rounded-full transition-[width] duration-500`}
                      style={{ width: `${Math.min(progress * 100, 100)}%` }}
                    />
                  );
                })()}
              </div>
            </div>
          </CardContent>

        </Card>

        {/* Race Status */}
        <Card>
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
            <div className="text-center py-4">
              <div className="text-5xl mb-2">🏇</div>
              <h3 className="font-semibold">{race.week}</h3>
              <p className="text-gray-600">残り時間: 3日 12時間</p>
            </div>

            {user.inRace && me ? (
              <div className="space-y-4">
                {/* 優勝賞金（元デザイン） */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-medium">優勝賞金</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {race.totalPot.toLocaleString('ja-JP')} BC
                  </p>
                </div>

                {/* ▼順位表 全体をクリックで遷移（内部に <Link> は置かない） */}
                {(() => {
                  const first = participants[0];
                  const diffToFirstHours = Math.max(
                    0,
                    (first?.currentStudyTime ?? 0) - (me?.currentStudyTime ?? 0)
                  );

                  const top3 = participants.slice(0, 3);
                  const rows = me && me.position > 3 ? [...top3, me] : [...top3, participants[3]].filter(Boolean);

                  const seen = new Set<string>();
                  const list = rows.filter((p) => !seen.has(p.user.id) && (seen.add(p.user.id), true));
                  const medal = (pos: number) => (pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '');

                  return (
                    <Link
                      to={`/races/${race.id}`}
                      className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      aria-label="順位表を開いてレースページへ移動"
                    >
                      <p className="text-xs text-gray-500 mb-3">順位表</p>
                      <ul className="space-y-2">
                        {list.map((p) => {
                          const isMe = p.user.id === user.id;
                          return (
                            <li
                              key={p.user.id}
                              className={[
                                "flex items-center justify-between rounded-lg border",
                                "border-gray-100 bg-white px-3 py-2.5",
                                isMe ? "ring-1 ring-emerald-200/60" : ""
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 text-right tabular-nums text-gray-500">{p.position}.</span>
                                <span className="w-6 text-center">{medal(p.position)}</span>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-base">
                                  {p.user.avatar}
                                </span>
                                <span
                                  className={[
                                    "truncate text-base md:text-lg",
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

                              {/* 自分の行だけ 1位との差 */}
                              <div className="shrink-0">
                                {isMe ? (
                                  <span className="text-base text-gray-600">
                                    − 1位との差 {diffToFirstHours}時間
                                  </span>
                                ) : (
                                  <span className="text-sm text-transparent select-none">_</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </Link>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ▼左：順位表（全体クリックで遷移・1位差は表示しない） */}
                <Link
                  to={`/races/${race.id}`}
                  className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  aria-label="順位表を開いてレースページへ移動"
                >
                  <p className="text-xs text-gray-500 mb-3">順位表</p>
                  <ul className="space-y-2">
                    {race.participants.slice(0, 3).map((p) => {
                      const medal = p.position === 1 ? '🥇' : p.position === 2 ? '🥈' : '🥉';
                      return (
                        <li
                          key={p.user.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 text-right tabular-nums text-gray-500">{p.position}.</span>
                            <span className="w-6 text-center">{medal}</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-base">
                              {p.user.avatar}
                            </span>
                            <span
                              className="truncate text-base md:text-lg font-medium text-gray-800"
                              title={p.user.username}
                            >
                              {p.user.username}
                            </span>
                          </div>
                          <span className="text-sm text-transparent select-none">_</span>
                        </li>
                      );
                    })}
                  </ul>
                </Link>

                {/* 右：ポイント合計（従来デザインのまま）
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">現状の順位によるポイント合計</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>日別内訳</span>
                      <span>{perDayPoints.join(' + ')} = <b>{totalPoints}</b> pt</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">※ 暫定ロジックです。後で正式ルールに合わせて置き換えてください。</p>
                  </div>
                </div> */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Subjects
      <Card className="mt-8 rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader> 
          <CardTitle>勉強科目</CardTitle> 
        </CardHeader> 
        <CardContent> 
          <div className="flex flex-wrap gap-2"> {user.studySubjects.map((subject: string, index: number) => ( <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium" > {subject} </span> 
        ))} 
          </div> 
        </CardContent> 
      </Card> */}
    </div>
  );
}
