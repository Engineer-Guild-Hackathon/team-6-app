import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Coins, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';
import { generateMockRace } from '../../utils/mockData';
import { Link } from 'react-router-dom';
import { Race, StudySession } from '../../types';
import { getTodayStudySessionsFromUserId } from '../../utils/getTodayStudySessionsFromUserId';
import {
  getStudySessionsFromUserId,
  getRecentStudySessionsFromUserId,
} from '../../utils/getStudySessionsFromUserId';
import { getParticipantsFromRaceId } from '../../utils/getParticipantsFromRaceId';
import { getRacesFromStatus } from '../../utils/getRacesFromStatus';
import { getRaceFromId } from '../../utils/getRaceFromId';

// 参加していない時の暫定ポイント換算
const rankToPoints = (rank: number) => {
  if (rank === 1) return 100;
  if (rank === 2) return 70;
  if (rank === 3) return 50;
  if (rank <= 5) return 30;
  if (rank <= 10) return 20;
  return 10;
};

// 小数1桁に四捨五入して文字列化（例: 1.24 -> "1.2", 1.25 -> "1.3"）
const formatHours = (h: number) => (Math.round(h * 10) / 10).toFixed(1);

// 分数を「n時間n分」に
const toHMString = (mins: number) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}時間${mm}分`;
};

// 今週（日曜23:59:59.999 ローカル）の終了日時
const getThisWeekEndLocal = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilSun = (7 - now.getDay()) % 7; // 0=Sun ... 6=Sat
  end.setDate(end.getDate() + daysUntilSun);
  // 日曜の“最後の瞬間”まで含める（23:59:59.999）
  end.setHours(23, 59, 59, 999);
  return end;
};

// 残りミリ秒を「X日 Y時間 Z分」に整形（負なら 0 でクリップ）
const formatRemaining = (ms: number) => {
  const remain = Math.max(0, ms);
  const totalMinutes = Math.floor(remain / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}日 ${hours}時間 ${minutes}分`;
};

export default function Dashboard() {
  const { user } = useAppContext();
  const [remainingText, setRemainingText] = useState<string>('');
  const [todayStudyTime, setTodayStudyTime] = useState(0); // 今日の勉強時間[min]
  const [race, setRace] = useState<Race | null>(null);
  // 曜日別の合計時間（h）
  const [weekDayHours, setWeekDayHours] = useState({
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
  });

  // 直近3件
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  if (!user) return null;

  useEffect(() => {
    // 今日の勉強記録を抽出
    const fetchTodayStudySessions = async () => {
      const todayStudySessions = await getTodayStudySessionsFromUserId(user.id);
      // duration は分保存なので /60 して時間に
      const totalToday = todayStudySessions.reduce((sum, session) => sum + session.duration, 0) / 60;
      setTodayStudyTime(totalToday);
    };
    fetchTodayStudySessions();
  }, [user]);

  // 今週(月→来週月)のセッションを取得して曜日別に合計
  useEffect(() => {
    if (!user) return;
    (async () => {
      const sessions = await getStudySessionsFromUserId(user.id);
      const acc = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };

      for (const s of sessions) {
        const dt = new Date(s.date); // timestamptz
        const day = dt.getDay(); // 0=Sun ... 6=Sat
        const key = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[day];
        // duration は分保存なので /60 して時間に
        const hours = (Number(s.duration) || 0) / 60;
        acc[key] += hours;
      }
      setWeekDayHours(acc);
    })();
  }, [user]);

  // 直近3件を取得
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        setRecentLoading(true);
        const recents = await getRecentStudySessionsFromUserId(user.id, 3);
        if (alive) setRecentSessions(recents);
      } finally {
        if (alive) setRecentLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // 残り時間を毎秒更新（リロード不要）
  useEffect(() => {
    const update = () => {
      const end = getThisWeekEndLocal();
      const now = new Date();
      setRemainingText(formatRemaining(end.getTime() - now.getTime()));
    };
    update(); // 初期表示
    const id = setInterval(update, 1000); // 毎秒更新
    return () => clearInterval(id);
  }, []);

  // 棒グラフ表示用
  const MAX_DAILY = 6; // 6時間勉強すれば緑で棒グラフが満たされる
  const weeklyProgress = [
    { day: '月', hours: weekDayHours.mon },
    { day: '火', hours: weekDayHours.tue },
    { day: '水', hours: weekDayHours.wed },
    { day: '木', hours: weekDayHours.thu },
    { day: '金', hours: weekDayHours.fri },
    { day: '土', hours: weekDayHours.sat },
    { day: '日', hours: weekDayHours.sun },
  ];

  useEffect(() => {
    const fetchRace = async () => {
      if (user.raceId) {
        const fetchedRace = await getRaceFromId(user.raceId);
        setRace(fetchedRace);
        return;
      }
      const fetchedRaces = await getRacesFromStatus('active');
      if (fetchedRaces.length > 0) {
        setRace(fetchedRaces[0]);
      } else {
        setRace(null);
      }
    };
    fetchRace();
  }, [user]);
  const participants = race?.participants || [];
  const me = user;

  // 週間目標（DBは分保存）
  const weeklyGoalMinutes = user.currentWeekStudyGoal ?? 2400; // 40h = 2400分 フォールバック
  const currentWeekMinutes = user.currentWeekStudyTime ?? 0;

  // 表示用: 分 → 「時間・分」に分解
  const toHM = (mins: number) => {
    const t = Math.max(0, Math.round(mins)); // 念のため丸め & マイナス防止
    return { h: Math.floor(t / 60), m: t % 60 };
  };
  const goalHM = toHM(weeklyGoalMinutes);
  const curHM = toHM(currentWeekMinutes);

  // const perDayPoints = (user.weeklyRank ?? []).map(rankToPoints);
  // const totalPoints = perDayPoints.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          おかえりなさい、{user.username}さん! {user.avatar}
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
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center tex-center justify-between">
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
              {(Math.floor(todayStudyTime / 60)).toLocaleString('ja-JP')}時間
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
            {/* 直近の学習（3件） */}
            <div className="mb-6 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">直近の学習（3件）</p>
              </div>

              <ul className="divide-y divide-gray-100">
                {recentLoading ? (
                  <>
                    <li className="py-2">
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                    </li>
                    <li className="py-2">
                      <div className="h-5 bg-gray-100 rounded w-2/3" />
                    </li>
                    <li className="py-2">
                      <div className="h-5 bg-gray-100 rounded w-1/2" />
                    </li>
                  </>
                ) : recentSessions.length > 0 ? (
                  recentSessions.map((s, i) => {
                    const when = new Date(s.date);
                    const subject = (s as any).subjectName ?? (s as any).subject ?? '学習';
                    const durationMinutes = Number(s.duration) || 0; // 分
                    const coins = Number(s.betCoinsEarned) || 0;

                    return (
                      <li
                        key={s.id ?? `recent-${i}`}
                        className="py-2 grid grid-cols-12 items-center gap-3"
                      >
                        {/* 左：科目 + 日時 */}
                        <div className="col-span-7 md:col-span-8 min-w-0">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                            {subject}
                          </span>
                          {/* 例: 9/11 21:30 */}
                          <p className="mt-1 text-xs text-gray-500">
                            {when.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}{' '}
                            {when.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* 中央：学習時間（n時間n分） */}
                        <div className="col-span-3 md:col-span-2 text-center">
                          <span className="text-sm font-semibold text-gray-900 tabular-nums">
                            {toHMString(durationMinutes)}
                          </span>
                        </div>

                        {/* 右：獲得BC（0でも表示） */}
                        <div className="col-span-2 md:col-span-2 text-right">
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                            +{coins} BC
                          </span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="py-2 text-sm text-gray-500">直近の学習記録はまだありません</li>
                )}
              </ul>
            </div>

            {/* 縦棒グラフ（てっぺんが食い込まないよう mt-4 で余白） */}
            <div className="mt-4 flex items-end justify-between h-40 px-2">
              {weeklyProgress.map((d) => (
                <div key={d.day} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-6 h-32 bg-gray-200 rounded-t-lg flex items-end">
                    <div
                      className="bg-emerald-500 w-full rounded-t-lg"
                      style={{ height: `${Math.min((d.hours / MAX_DAILY) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm">{d.day}</div>
                  <div className="text-xs text-gray-500">{formatHours(d.hours)}時間</div>
                </div>
              ))}
            </div>

            {/* 週間目標（透明感ある色分岐） */}
            <div className="mt-4 bg-emerald-50 p-3 rounded-lg">
              💡 週間目標: {goalHM.h}時間{goalHM.m}分 (現在: {curHM.h}時間{curHM.m}分)
              <div className="mt-2 bg-gray-200 h-2 rounded-full">
                {(() => {
                  // 進捗は「分 ÷ 分」で安全に計算
                  const safeGoal = weeklyGoalMinutes > 0 ? weeklyGoalMinutes : 1;
                  const progress = currentWeekMinutes / safeGoal;

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
        {/* <Card>
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
              <h3 className="font-semibold">{race.name}</h3>
              <p className="text-gray-600">残り時間: {remainingText}</p>
            </div>

            {user.inRace && me ? (
              <div className="space-y-4"> */}
                {/* 優勝賞金（元デザイン） */}
                {/* <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-medium">優勝賞金</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {race.totalPot.toLocaleString('ja-JP')} BC
                  </p>
                </div> */}

                {/* ▼順位表 全体をクリックで遷移（内部に <Link> は置かない） */}
                {/* {(() => {
                  const first = participants![0];
                  const diffToFirstHours = Math.max(
                    0,
                    (first?.currentStudyTime ?? 0) - (me?.currentStudyTime ?? 0)
                  );

                  const top3 = participants!.slice(0, 3);
                  const rows =
                    me && me.position > 3 ? [...top3, me] : [...top3, participants![3]].filter(Boolean);

                  const seen = new Set<string>();
                  const list = rows.filter((p) => !seen.has(p.user.id) && (seen.add(p.user.id), true));
                  const medal = (pos: number) =>
                    pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '';

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
                                isMe ? "ring-1 ring-emerald-200/60" : "",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 text-right tabular-nums text-gray-500">
                                  {p.position}.
                                </span>
                                <span className="w-6 text-center">{medal(p.position)}</span>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-base">
                                  {p.user.avatar}
                                </span>
                                <span
                                  className={[
                                    'truncate text-base md:text-lg',
                                    isMe ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
                                  ].join(' ')}
                                  title={p.user.username}
                                >
                                  {p.user.username}
                                </span>
                                {isMe && (
                                  <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                    あなた
                                  </span>
                                )}
                              </div> */}

                              {/* 自分の行だけ 1位との差 */}
                              {/* <div className="shrink-0">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                {/* ▼左：順位表（全体クリックで遷移・1位差は表示しない） */}
                {/* <Link
                  to={`/races/${race.id}`}
                  className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  aria-label="順位表を開いてレースページへ移動"
                >
                  <p className="text-xs text-gray-500 mb-3">順位表</p>
                  <ul className="space-y-2">
                    {race.participants!.slice(0, 3).map((p) => {
                      const medal = p.position === 1 ? '🥇' : p.position === 2 ? '🥈' : '🥉';
                      return (
                        <li
                          key={p.user.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 text-right tabular-nums text-gray-500">
                              {p.position}.
                            </span>
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
                </Link> */}

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
              {/* </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
