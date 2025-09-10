import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Coins,
  Clock,
  TrendingUp,
  Users,
  Target,
  Palette,
  RefreshCcw,
  AlarmCheck,
  AlarmClock,
  Hourglass,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { generateMockRace } from '../../utils/mockData';
import BettingModal from './BettingModal';

type RaceTheme = 'default' | 'keiba';

export default function RaceScreen() {
  const { user, currentRace, setCurrentRace } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'race' | 'betting' | 'results'>('race');
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [raceTheme, setRaceTheme] = useState<RaceTheme>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!currentRace) setCurrentRace(generateMockRace());
  }, [currentRace, setCurrentRace]);

  if (!user || !currentRace) return null;

  const userInRace = currentRace.participants.find((p: any) => p.user.id === user.id);

  const handleBet = (participant: any) => {
    setSelectedParticipant(participant);
    setShowBettingModal(true);
  };

  // ====== ヘルパー（期間・残り時間） ======
  const WEEK_START: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // 月曜はじまり

  // 任意の週の開始・終了（offsetWeeks: 今週=0, 来週=+1）
  const getWeekPeriod = (
    now = new Date(),
    weekStart = WEEK_START,
    days = 7,
    offsetWeeks = 0
  ) => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = (day - weekStart + 7) % 7;
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diff + offsetWeeks * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // ベッティングの見出し用（来週表示）
  const formatRacePeriodNextWeek = (start?: string | number | Date, end?: string | number | Date) => {
    let s: Date, e: Date;
    if (start && end) {
      s = new Date(start);
      e = new Date(end);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        const auto = getWeekPeriod(new Date(), WEEK_START, 7, 1);
        s = auto.start; e = auto.end;
      }
    } else {
      const auto = getWeekPeriod(new Date(), WEEK_START, 7, 1);
      s = auto.start; e = auto.end;
    }
    const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${md(s)} ~ ${md(e)}`;
  };

  // レース状況用：現在のレース期間（startAt/endAt があればそれを優先。なければ今週）
  const getActiveRaceWindow = () => {
    const s = (currentRace as any).startAt ? new Date((currentRace as any).startAt) : undefined;
    const e = (currentRace as any).endAt ? new Date((currentRace as any).endAt) : undefined;
    if (s && e && !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
      return { start: s, end: e };
    }
    return getWeekPeriod(new Date(), WEEK_START, 7, 0); // 今週
  };

  // 今週のレース期間を "M/D ~ M/D" で表示する
  const formatActivePeriod = () => {
    const { start, end } = getActiveRaceWindow();
    const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${md(start)} ~ ${md(end)}`;
  };

  const humanizeRemaining = (ms: number) => {
    if (ms <= 0) return '0';
    const sec = Math.floor(ms / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (d >= 1) return `${d}日${h > 0 ? `${h}時間` : ''}`;
    if (h >= 1) return `${h}時間${m > 0 ? `${m}分` : ''}`;
    return `${m}分`;
  };

  const getRaceState = () => {
    const now = new Date();
    const { start, end } = getActiveRaceWindow();
    if (now < start) return { state: '開始前', remaining: humanizeRemaining(start.getTime() - now.getTime()) };
    if (now > end) return { state: '終了', remaining: '0' };
    return { state: '進行中', remaining: humanizeRemaining(end.getTime() - now.getTime()) };
  };

  // 更新ボタン（ベッティング）
  const handleRefreshBetting = async () => {
    try {
      setIsRefreshing(true);
      // 本来はAPI取得に置換
      setCurrentRace(generateMockRace());
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsRefreshing(false);
    }
  };

  /** =========================
   *  競馬トラック表示
   * ========================== */
  const renderTrackView = () => {
  const sorted = [...currentRace.participants].sort(
    (a: any, b: any) => b.currentStudyTime - a.currentStudyTime
  );
  const maxTime = Math.max(...sorted.map((p: any) => p.currentStudyTime), 1);

  // 位置の上下限バッファ（0〜1の割合）
  const START_BUFFER  = 0.08; // 右端ベタ付きを防ぐ下限（スタート側）
  const FINISH_BUFFER = 0.06; // 左端ベタ付きを防ぐ上限（ゴール側）

  return (
    <div className="space-y-4">
      <div
        className="relative w-full rounded-xl border"
        style={{
          background:
            'repeating-linear-gradient(0deg, #e8f5e9 0px, #e8f5e9 22px, #e3f2e1 22px, #e3f2e1 44px)',
          borderColor: '#d1d5db',
        }}
      >
        <div className="flex flex-col gap-2 p-2 md:p-3">
          {sorted.map((participant: any, laneIdx: number) => {
            // 先頭比（0..1）
            const normalizedRaw = Math.min(participant.currentStudyTime / maxTime, 1);

            // 1) 上限（ゴール手前） 2) 下限（スタート側）でクランプ
            //    → 0..1 を [START_BUFFER, 1 - FINISH_BUFFER] に制限
            const normalized = Math.min(1 - FINISH_BUFFER, Math.max(START_BUFFER, normalizedRaw));

            // 横位置：右(100%)→左(0%)
            const horseLeftPct = 100 - normalized * 100;

            const silksBg =
              laneIdx % 3 === 0
                ? 'repeating-linear-gradient(45deg, #0ea5e9 0, #0ea5e9 6px, #ffffff 6px, #ffffff 12px)'
                : laneIdx % 3 === 1
                ? 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 6px, #ffffff 6px, #ffffff 12px)'
                : 'repeating-linear-gradient(45deg, #10b981 0, #10b981 6px, #ffffff 12px)';

            return (
              <div
                key={participant.user.id}
                className="relative h-16 md:h-20 rounded-lg"
                role="group"
                aria-label={`${participant.user.username} のコース`}
              >
                {/* 🧷 基準点（🐎）のみを left% で配置。transform による水平スライドは行わない */}
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${horseLeftPct}%` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-3xl md:text-4xl select-none">🐎</span>
                      <span
                        className="ml-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] md:text-xs font-bold border"
                        style={{ background: silksBg, borderColor: 'rgba(0,0,0,0.05)', color: '#111827' }}
                        aria-hidden
                      >
                        勝負服
                      </span>
                    </div>

                    {/* ラベルは横に並べるだけ（スライド一切なし） */}
                    <div className="hidden sm:block max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{participant.user.avatar}</div>
                        <span className="text-sm font-semibold break-words">
                          {participant.user.username}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-800/90">
                        {participant.user.age}歳 {participant.user.occupation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


  // ===== 通常の順位表 =====
  const renderDefaultLeaderboard = () => (
    <div className="space-y-4">
      {currentRace.participants.map((participant: any, index: number) => (
        <div
          key={participant.user.id}
          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
            index === 0
              ? 'border-yellow-300 bg-yellow-50'
              : index === 1
              ? 'border-gray-300 bg-gray-50'
              : index === 2
              ? 'border-orange-300 bg-orange-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                index === 0
                  ? 'bg-yellow-500 text-white'
                  : index === 1
                  ? 'bg-gray-500 text-white'
                  : index === 2
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {index + 1}
            </div>
            <div className="text-2xl">{participant.user.avatar}</div>
            <div>
              <h4 className="font-semibold">{participant.user.username}</h4>
              <p className="text-sm text-gray-600">
                {participant.user.age}歳 {participant.user.occupation}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-600">{participant.currentStudyTime}時間</p>
            <div className="text-sm text-gray-600">単勝 {participant.odds.win}倍</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ===== レース情報カード（ホーム画面と統一） =====
  const RaceInfo = () => {
    const { state, remaining } = getRaceState();

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 items-stretch">
        {/* 賞金プール */}
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-orange-50 mb-2 sm:mb-3">
              <Coins className="h-7 w-7 text-orange-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">賞金プール</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-0.5 md:mt-1">
              {currentRace.totalPot.toLocaleString('ja-JP')} BC
            </p>
          </CardContent>
        </Card>

        {/* レース状態 */}
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-emerald-50 mb-2 sm:mb-3">
              <Clock className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">レース状態</p>
            <p
              className={`text-2xl md:text-3xl font-bold mt-0.5 md:mt-1 ${
                state === '進行中'
                  ? 'text-emerald-600'
                  : state === '開始前'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {state}
            </p>
          </CardContent>
        </Card>

        {/* 出走馬 */}
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-50 mb-2 sm:mb-3">
              <Users className="h-7 w-7 text-blue-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">出走馬</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-0.5 md:mt-1">
              {currentRace.participants.length.toLocaleString('ja-JP')}人
            </p>
          </CardContent>
        </Card>

        {/* 残り時間 */}
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-purple-50 mb-2 sm:mb-3">
              <Hourglass className="h-7 w-7 text-purple-500"  />
            </div>
            <p className="text-sm md:text-base text-gray-600">残り時間</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-0.5 md:mt-1">
              {getRaceState().remaining}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };


  // ===== 画面本体 =====
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏇 {currentRace.week} レース</h1>
      </div>

      {/* レース情報カード（常時表示） */}
      <RaceInfo />
      {/* タブ切替 */}
      <div className="flex space-x-4 mb-6">
        <Button variant={selectedTab === 'race' ? 'primary' : 'outline'} onClick={() => setSelectedTab('race')}>
          <Trophy className="h-4 w-4 mr-2" />
          レース状況
        </Button>
        <Button variant={selectedTab === 'betting' ? 'primary' : 'outline'} onClick={() => setSelectedTab('betting')}>
          <Coins className="h-4 w-4 mr-2" />
          ベッティング
        </Button>
        <Button variant={selectedTab === 'results' ? 'primary' : 'outline'} onClick={() => setSelectedTab('results')}>
          <TrendingUp className="h-4 w-4 mr-2" />
          過去の結果
        </Button>
      </div>

      {/* ===== レース状況 ===== */}
      {selectedTab === 'race' && (
        <div className="space-y-6">
          {userInRace && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>あなたの現在位置</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRaceTheme((t) => (t === 'default' ? 'keiba' : 'default'))}
                  aria-pressed={raceTheme === 'keiba'}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  {raceTheme === 'keiba' ? '通常表示に戻す' : '競馬トラックに切替'}
                </Button>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{user.avatar}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      <p className="text-gray-600">
                        {user.age}歳 {user.occupation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{userInRace.currentStudyTime}時間</p>
                    <p className="text-gray-600">今週の学習時間</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
              <CardHeader className="pb-2">
    {/* 1行目：左=タイトル（左寄せ）／右=切替ボタン（右寄せ） */}
    <div className="flex items-center justify-between">
      <CardTitle className="!text-left">
        {raceTheme === 'keiba' ? '競馬トラック表示' : '現在の順位表'}
      </CardTitle>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setRaceTheme((t) => (t === 'default' ? 'keiba' : 'default'))}
        aria-pressed={raceTheme === 'keiba'}
        aria-label="表示デザインを切り替え"
        className="flex items-center gap-2 ml-4"
      >
        <Palette className="h-4 w-4" />
        {raceTheme === 'keiba' ? '通常表示に戻す' : '競馬トラックに切替'}
      </Button>
    </div>

    {/* 2行目：レース期間（左寄せ） */}
    <div className="mt-1 text-left">
      <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">レース期間</span>
        <span className="font-medium">{formatActivePeriod()}</span>
      </span>
    </div>
  </CardHeader>

            <CardContent>
              {raceTheme === 'keiba' ? renderTrackView() : renderDefaultLeaderboard()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== ベッティング ===== */}
      {selectedTab === 'betting' && (
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>ベッティング - 勝者を予想しよう！</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshBetting}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '更新中…' : '更新'}
              </Button>
            </div>

            <div className="text-sm text-gray-700 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">レース期間</span>
                <span className="font-medium">
                  {formatRacePeriodNextWeek((currentRace as any).startAt, (currentRace as any).endAt)}
                </span>
              </span>
              <span className="text-lg text-amber-700">
                💰 あなたの保有ベットコイン:
                <span className="font-bold ml-1 text-xl">{user.betCoins.toLocaleString()} BC</span>
              </span>
            </div>

            <div className="text-xs text-gray-600">
              最小ベット額: <span className="font-semibold">100 BC</span> ／ 単勝・複勝から選択できます
            </div>
          </CardHeader>

          <CardContent>
            {(() => {
              const participants = [...currentRace.participants].sort(
                (a: any, b: any) => b.currentStudyTime - a.currentStudyTime
              );

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map((p: any) => (
                    <div key={p.user.id} className="rounded-xl border p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{p.user.avatar}</div>
                          <div>
                            <div className="font-semibold">{p.user.username}</div>
                            <div className="text-xs text-gray-600">
                              {p.user.age}歳 {p.user.occupation}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 先週の学習時間（ラベル左／数値右） */}
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-700">先週の学習時間</span>
                        <span className="text-3xl font-extrabold text-emerald-600">
                          {p.currentStudyTime}時間
                        </span>
                      </div>

                      {/* オッズ & ボタン */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                            単勝 {p.odds.win}倍
                          </span>
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            複勝 {p.odds.place}倍
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedParticipant(p);
                            setShowBettingModal(true);
                          }}
                          disabled={user.betCoins < 100}
                        >
                          ベットする
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* ===== 過去の結果 ===== */}
      {selectedTab === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle>過去のレース結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              過去のレース結果はまだありません。
              <br />
              初回レースの結果をお楽しみに！
            </div>
          </CardContent>
        </Card>
      )}

      {/* ベッティングモーダル */}
      {showBettingModal && selectedParticipant && (
        <BettingModal
          participant={selectedParticipant}
          onClose={() => setShowBettingModal(false)}
          userBalance={user.betCoins}
        />
      )}
    </div>
  );
}
