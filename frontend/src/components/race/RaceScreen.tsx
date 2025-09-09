import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Clock, TrendingUp, Users, Target, Palette } from 'lucide-react';
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

  useEffect(() => {
    if (!currentRace) {
      setCurrentRace(generateMockRace());
    }
  }, [currentRace, setCurrentRace]);

  if (!user || !currentRace) return null;

  const userInRace = currentRace.participants.find((p: any) => p.user.id === user.id);
  const topParticipants = currentRace.participants.slice(0, 5);

  const handleBet = (participant: any) => {
    setSelectedParticipant(participant);
    setShowBettingModal(true);
  };

// 週の開始曜日（0:日, 1:月, 2:火, 3:水, 4:木, 5:金, 6:土）
// 例) 木曜はじめ → 4、月曜はじめ（既定）→ 1
const WEEK_START: 0|1|2|3|4|5|6 = 1;

// 指定の週開始曜日で「今週の開始日～終了日」を返す（期間は days 日）
const getAutoWeekPeriod = (
  now = new Date(), 
  weekStart = WEEK_START, 
  days = 7,
  offsetWeeks = 1
) => {
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day - weekStart + 7) % 7; // 週開始まで戻る差分
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);
  // ここで週オフセット（来週=+1、再来週=+2、先週=-1 など）
  start.setDate(start.getDate() + offsetWeeks * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + (days - 1));
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// レース期間を「M/D ~ M/D」で表示
// currentRace.startAt / endAt があればそれを優先、無ければ週自動計算
const formatRacePeriod = (start?: string|number|Date, end?: string|number|Date) => {
  let s: Date, e: Date;
  if (start && end) {
    s = new Date(start);
    e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      const auto = getAutoWeekPeriod();
      s = auto.start; e = auto.end;
    }
  } else {
    const auto = getAutoWeekPeriod();
    s = auto.start; e = auto.end;
  }
  const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${md(s)} ~ ${md(e)}`;
};

  /** =========================
   *  競馬トラック表示
   *  - 表示ラベル（芝/フィニッシュ/スタート/ゴール）を全削除
   *  - 左端の赤線(フィニッシュ)も削除
   *  - 連続芝背景は維持、横の時間/オッズ表示は非表示
   *  - FINISH_BUFFER で左端ベタ付き回避
   * ========================== */
  const renderTrackView = () => {
    const sorted = [...currentRace.participants].sort(
      (a: any, b: any) => b.currentStudyTime - a.currentStudyTime
    );
    const maxTime = Math.max(...sorted.map((p: any) => p.currentStudyTime), 1);
    const FINISH_BUFFER = 0.06; // 左端にベタ付かないように少し余白

    return (
      <div className="space-y-4">
        {/* ラベル・凡例は一切表示しない */}

        {/* コース全体（連続する芝） */}
        <div
          className="relative w-full rounded-xl border"
          style={{
            background:
              'repeating-linear-gradient(0deg, #e8f5e9 0px, #e8f5e9 22px, #e3f2e1 22px, #e3f2e1 44px)',
            borderColor: '#d1d5db',
          }}
        >
          {/* 左端の赤線・右端のスタート線は置かない */}

          {/* 区切り無しで各馬 */}
          <div className="flex flex-col gap-2 p-2 md:p-3">
            {sorted.map((participant: any, laneIdx: number) => {
              const normalized = Math.min(participant.currentStudyTime / maxTime, 1);
              const capped = normalized * (1 - FINISH_BUFFER); // 0..(1 - buffer)
              // 右(100%)→左(0%)に進む。左位置は (100 - capped*100)%
              const horseLeft = `${Math.max(0, 100 - capped * 100)}%`;

              const silksBg =
                laneIdx % 3 === 0
                  ? 'repeating-linear-gradient(45deg, #0ea5e9 0, #0ea5e9 6px, #ffffff 6px, #ffffff 12px)'
                  : laneIdx % 3 === 1
                  ? 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 6px, #ffffff 6px, #ffffff 12px)'
                  : 'repeating-linear-gradient(45deg, #10b981 0, #10b981 6px, #ffffff 6px, #ffffff 12px)';

              return (
                <div
                  key={participant.user.id}
                  className="relative h-16 md:h-20 rounded-lg"
                  role="group"
                  aria-label={`${participant.user.username} のコース`}
                >
                  {/* 馬（右→左へ移動） */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                    style={{ left: horseLeft }}
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
                      {/* 名前と属性（小さめ） */}
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-2">
                          <div className="text-xl">{participant.user.avatar}</div>
                          <span className="text-sm font-semibold">{participant.user.username}</span>
                        </div>
                        <div className="text-[11px] text-gray-800/90">
                          {participant.user.age}歳 {participant.user.occupation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 横の時間/オッズ表示は非表示のまま */}
                </div>
              );
            })}
          </div>
        </div>

        {/* アクセシビリティ補助（テキストのみ・ラベル語は使わない） */}
        <p className="sr-only">
          先頭は {sorted[0]?.user.username}、最後尾は {sorted[sorted.length - 1]?.user.username} です。
        </p>
      </div>
    );
  };

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
              <div className="flex flex-wrap gap-2 mt-1">
                {participant.user.studySubjects.map((subject: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
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

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏇 {currentRace.week} レース</h1>
        <p className="text-gray-600">15人の競走馬が今週の勉強時間を競っています！</p>
      </div>

      {/* Race Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">賞金プール</p>
                <p className="text-2xl font-bold text-amber-600">
                  {currentRace.totalPot.toLocaleString()} BC
                </p>
              </div>
              <Coins className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">レース状態</p>
                <p className="text-2xl font-bold text-emerald-600">進行中</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">出走馬</p>
                <p className="text-2xl font-bold text-blue-600">{currentRace.participants.length}人</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">残り時間</p>
                <p className="text-2xl font-bold text-purple-600">3日</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={selectedTab === 'race' ? 'primary' : 'outline'}
          onClick={() => setSelectedTab('race')}
        >
          <Trophy className="h-4 w-4 mr-2" />
          レース状況
        </Button>
        <Button
          variant={selectedTab === 'betting' ? 'primary' : 'outline'}
          onClick={() => setSelectedTab('betting')}
        >
          <Coins className="h-4 w-4 mr-2" />
          ベッティング
        </Button>
        <Button
          variant={selectedTab === 'results' ? 'primary' : 'outline'}
          onClick={() => setSelectedTab('results')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          過去の結果
        </Button>
      </div>

      {selectedTab === 'race' && (
        <div className="space-y-6">
          {/* Your Position */}
          {userInRace && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>あなたの現在位置</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRaceTheme(t => (t === 'default' ? 'keiba' : 'default'))}
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
                    <p className="text-3xl font-bold text-blue-600">
                      {userInRace.currentStudyTime}時間
                    </p>
                    <p className="text-gray-600">今週の学習時間</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard / Track */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{raceTheme === 'keiba' ? '競馬トラック表示' : '現在の順位表'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRaceTheme(t => (t === 'default' ? 'keiba' : 'default'))}
                aria-pressed={raceTheme === 'keiba'}
                aria-label="表示デザインを切り替え"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                {raceTheme === 'keiba' ? '通常表示に戻す' : '競馬トラックに切替'}
              </Button>
            </CardHeader>
            <CardContent>
              {raceTheme === 'keiba' ? renderTrackView() : renderDefaultLeaderboard()}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'betting' && (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>ベッティング - 勝者を予想しよう！</CardTitle>

            {/* レース期間を表示 */}
            <div className="text-sm text-gray-700 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">レース期間</span>
                <span className="font-medium">
                  {formatRacePeriod((currentRace as any).startAt, (currentRace as any).endAt)}
                </span>
              </span>
              <span className="font-bold text-lg text-amber-700">
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
              const maxTime = Math.max(...participants.map((p: any) => p.currentStudyTime), 1);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map((p: any, idx: number) => {
                    const progress = Math.min(p.currentStudyTime / maxTime, 1);
                    return (
                      <div
                        key={p.user.id}
                        className="rounded-xl border hover:shadow-md transition-shadow p-4 bg-white"
                      >
                        {/* アバター＋名前 */}
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

                        {/* 学習時間*/}
                        <div className="mt-3 flex items-baseline justify-between" >
                          <span className="text-lg font-semibold text-gray-700">先週の学習時間</span>
                            <span className="text-3xl font-extrabold text-emerald-600">
                              {p.currentStudyTime}時間
                            </span>
                        </div>


                        {/* オッズとベットボタン */}
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
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}


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

      {/* Betting Modal */}
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
