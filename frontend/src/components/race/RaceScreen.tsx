import { useState, useEffect } from 'react';
import {
  Trophy,
  Coins,
  Clock,
  TrendingUp,
  Users,
  Palette,
  RefreshCcw,
  Hourglass,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { generateMockRace } from '../../utils/mockData';
import BettingModal from './BettingModal';
import { Race, RaceStatus, UserPrivate } from '../../types';
import { getRacesFromStatus } from '../../utils/getRacesFromStatus';
import { getParticipantsFromRaceId } from '../../utils/getParticipantsFromRaceId';

type RaceTheme = 'default' | 'keiba';

export default function RaceScreen() {
  const { user } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<RaceStatus>('active'); // レースの種類を選択するタブ
  const [selectedRaces, setSelectedRaces] = useState<Race[]>([]); // 選択されたタブに応じたレース全て
  const [selectedRace, setSelectedRace] = useState<Race | null>(null); // タブ内で選択されたレース 
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<UserPrivate[]>([]);  // selectedRaceの参加者
  const [bettedParticipant, setBettedParticipant] = useState<UserPrivate | null>(null); // 自分がベットした参加者
  const [raceTheme, setRaceTheme] = useState<RaceTheme>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // selectedTab に応じてレースをフィルタリング
    async function fetchRaces() {
      const races = await getRacesFromStatus(selectedTab);
      setSelectedRaces(races);
      if (races.length > 0) {
        setSelectedRace(races[0]); // selectedRace が未設定なら最初のレースをセット
        const participants = await getParticipantsFromRaceId(races[0].id);
        setSelectedParticipants(participants);
      }
      if (races.length === 0) {
        setSelectedRace(generateMockRace()); // レースがない場合はモックをセット TODO: 後で変更
        setSelectedParticipants([]); // 参加者も空にする
      }
    }
    fetchRaces();
  }, [selectedTab]);

  const handleSelectedRaceOnClick = async (raceId: string) => {
    const race = selectedRaces.find(r => r.id === raceId);
    if (race) {
      setSelectedRace(race);
      const participants = await getParticipantsFromRaceId(race.id);
      setSelectedParticipants(participants);
    }
  };

  if (!user || !selectedRace) return null;

  // レース状況用：現在のレース期間（startAt/endAt があればそれを優先。なければ今週）
  const getActiveRaceWindow = (): { startDate: Date, endDate: Date } => {
    let startDate: string;
    let endDate: string;
    if (selectedTab !== `drawing`) {
      // オッズ受付中レース以外はレース開始日時を優先
      startDate = selectedRace.raceStartDate
      endDate = selectedRace.raceEndDate;
    }
    else {
      startDate = selectedRace.drawingStartDate;
      endDate = selectedRace.drawingEndDate;
    }
    return { startDate: new Date(startDate), endDate: new Date(endDate) };
  };

  // 今週のレース期間を "M/D ~ M/D" で表示する
  const formatActivePeriod = () => {
    const { startDate, endDate } = getActiveRaceWindow();
    const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${md(startDate)} ~ ${md(endDate)}`;
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

  const getRemainingTime = (): string => {
    const now = new Date();
    const { startDate, endDate } = getActiveRaceWindow();
    if (now < startDate) return ``;
    if (now > endDate || selectedRace.status === 'finished') return `終了`;
    // TODO: エラーハンドリング raceのstatusと日付が連動しているか不安
    return `${humanizeRemaining(endDate.getTime() - now.getTime())}`;
  };

  // オッズの更新を呼び出す関数
  const handleRefreshBetting = async () => {
    try {
      setIsRefreshing(true);
      // TODO: 選択されたレースのオッズ情報をDBから再取得
      getOdds(selectedParticipants, selectedRace.id);
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getOdds = (participants: UserPrivate[], raceId: string): void => {
    const updatedParticipants = participants.map(participant => {
      // TODO: raceIdを使ってオッズを獲得
      let winOdds = parseFloat((Math.random() * 10 + 1).toFixed(1)); // 仮のオッズ計算（小数第一位まで）
      let placeOdds = parseFloat((Math.random() * 5 + 1).toFixed(1)); // 仮のオッズ計算
      if (winOdds < placeOdds) {
        // 単勝オッズが複勝オッズより低くなることはないように調整
        const tmp = winOdds;
        winOdds = placeOdds;
        placeOdds = tmp;
      }
      return {
        ...participant,
        winOdds: winOdds,
        placeOdds: placeOdds,
      };
    });
    setSelectedParticipants(updatedParticipants);
  }
  /** =========================
   *  競馬トラック表示
   * ========================== */
  const renderTrackView = () => {
    const sorted = [...selectedParticipants].sort(
      (a: any, b: any) => b.currentWeekStudyTime - a.currentWeekStudyTime
    );
    const maxTime = Math.max(...sorted.map((p: any) => p.currentWeekStudyTime), 1);

    // 位置の上下限バッファ（0〜1の割合）
    const START_BUFFER = 0.15; // 右端ベタ付きを防ぐ下限（スタート側）
    const FINISH_BUFFER = 0.0; // 左端ベタ付きを防ぐ上限（ゴール側）

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
            {sorted.map((participant: UserPrivate, laneIdx: number) => {
              // 先頭比（0..1）
              const normalizedRaw = Math.min(participant.currentWeekStudyTime / maxTime, 1);

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
                  key={participant.id}
                  className="relative h-16 md:h-20 rounded-lg"
                  role="group"
                  aria-label={`${participant.username} のコース`}
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
                          <div className="text-xl">{participant.avatar}</div>
                          <span className="text-sm font-semibold break-words">
                            {participant.username}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-800/90">
                          {participant.age}歳 {participant.occupation}
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
      {/* // 今週の勉強時間が多い順にソートして表示 */}
      {[...selectedParticipants].sort((a, b) => b.currentWeekStudyTime - a.currentWeekStudyTime).map((participant: UserPrivate, index: number) => (
        <div
          key={participant.id}
          className={`flex items-center justify-between p-4 rounded-lg border-2 ${index === 0
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
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0
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
            <div className="text-2xl">{participant.avatar}</div>
            <div>
              <h4 className="font-semibold">{participant.username}</h4>
              <p className="text-sm text-gray-600">
                {participant.age}歳 {participant.occupation}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-600">{Math.floor(participant.currentWeekStudyTime / 60)}時間 {participant.currentWeekStudyTime % 60}分</p>
            {/* TODO: oddsはこれから調整 */}
            {/* <div className="text-sm text-gray-600">単勝 {participant.odds.win}倍</div> */}
          </div>
        </div>
      ))}
    </div>
  );

  // ===== レース情報カード（ホーム画面と統一） =====
  const RaceInfo = () => {
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
              {selectedRace?.totalPot || 0} BC
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
              className={`text-2xl md:text-3xl font-bold mt-0.5 md:mt-1 ${selectedRace.status === 'active'
                ? 'text-emerald-600'
                : selectedRace.status === 'upcoming'
                  ? 'text-blue-600'
                  : selectedRace.status === 'finished'
                    ? 'text-gray-600'
                    : 'text-purple-600'
                }`}
            >
              {selectedRace.status === 'active' ? '進行中' : selectedRace.status === 'upcoming' ? '未開始' : selectedRace.status === 'finished' ? '終了' : 'ベット可能'}
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
              {selectedParticipants.length.toLocaleString('ja-JP')}人
            </p>
          </CardContent>
        </Card>

        {/* 残り時間 */}
        <Card className="h-full rounded-2xl shadow-md border border-gray-100">
          <CardContent className="h-full pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center text-center justify-between">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-purple-50 mb-2 sm:mb-3">
              <Hourglass className="h-7 w-7 text-purple-500" />
            </div>
            <p className="text-sm md:text-base text-gray-600">残り時間</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-0.5 md:mt-1">
              {getRemainingTime()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };


  // ===== 画面本体 =====
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* タブ切替 */}
      <div className="flex space-x-4 mb-6">
        <Button variant={selectedTab === 'active' ? 'primary' : 'outline'} className='text-sm md:text-lg' onClick={() => setSelectedTab('active')}>
          <Trophy className="h-4 w-4 mr-2 " />
          レース状況
        </Button>
        <Button variant={selectedTab === 'drawing' ? 'primary' : 'outline'} className='text-sm md:text-lg' onClick={() => setSelectedTab('drawing')}>
          <Coins className="h-4 w-4 mr-2" />
          ベッティング
        </Button>
        <Button variant={selectedTab === 'finished' ? 'primary' : 'outline'} className='text-sm md:text-lg' onClick={() => setSelectedTab('finished')}>
          <TrendingUp className="h-4 w-4 mr-2" />
          過去の結果
        </Button>
      </div>
      {/* 選択されたレースのステータスに応じて該当するレースを横並びで表示 */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {selectedRaces.map((race) => (
          <Button key={race.id} variant={selectedRace.id === race.id ? 'primary' : 'outline'} className="rounded shadow hover:shadow-md transition cursor-pointer" onClick={() => handleSelectedRaceOnClick(race.id)}>
            <span className="md:text-lg font-semibold text-gray-800">{race.name}</span>
          </Button>
        ))}
      </div>

      {/* レース情報カード（常時表示） */}
      <RaceInfo />

      {/* ===== レース状況 ===== */}
      {selectedTab === 'active' && (
        <div className="space-y-6">
          {/* {userInRace && (
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
          )} */}

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
                  <Palette className="h-auto w-auto" />
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
      {selectedTab === 'drawing' && (
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className='text-lg md:text-xl'>ベッティング - 勝者を予想しよう！</CardTitle>
            </div>

            <div className="text-sm text-gray-700 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">ベット可能期間</span>
                <span className="font-medium">
                  {formatActivePeriod()}
                </span>
              </span>
              <span className="md:text-lg text-amber-700">
                💰 あなたの保有ベットコイン:
                <span className="font-bold ml-1 md:text-xl">{user.betCoins.toLocaleString()} BC</span>
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshBetting}
                disabled={isRefreshing}
                className="gap-2 w-fit py-5"
                >
                <RefreshCcw className={`h-fit w-fit ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '更新中…' : 'オッズの取得'}
              </Button>
              <div className="text-xs text-gray-600">
                最小ベット額: <span className="font-semibold">100 BC</span> ／ 単勝・複勝から選択できます
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {(() => {
              const participants = [...selectedParticipants].sort(
                (a: any, b: any) => b.currentStudyTime - a.currentStudyTime
              );

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map((p: UserPrivate) => (
                    <div key={p.id} className="rounded-xl border p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{p.avatar}</div>
                          <div>
                            <div className="font-semibold">{p.username}</div>
                            <div className="text-xs text-gray-600">
                              {p.age}歳 {p.occupation}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 先週の学習時間（ラベル左／数値右） */}
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-700">今週の学習時間</span>
                        <span className="text-3xl font-extrabold text-emerald-600">
                          {/*TODO: 今週ではなく先週の学習時間を表示させたいけどどうしよう */}
                          {Math.floor(p.currentWeekStudyTime / 60)}時間
                        </span>
                      </div>

                      {/* オッズ & ボタン */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                            {/* TODO: p.winOddsをnullにさせない工夫 */}
                            単勝 {p.winOdds ? p.winOdds : '-'}倍
                          </span>
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            複勝 {p.placeOdds ? p.placeOdds : '-'}倍
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            setBettedParticipant(p);
                            setShowBettingModal(true);
                          }}
                          disabled={user.betCoins < 100 || !p.winOdds || !p.placeOdds}
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
      {selectedTab === 'finished' && (
        <Card>
          <CardHeader>
            <CardTitle>過去のレース結果</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRaces.length > 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div >
                  <p>
                    TODO: ここに選択された過去のレース結果の詳細をリッチに表示する
                    <br />
                    例えば順位表とオッズなど
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                過去のレース結果はまだありません。
                <br />
                初回レースの結果をお楽しみに！
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ベッティングモーダル */}
      {showBettingModal && bettedParticipant && (
        <BettingModal
          participant={bettedParticipant}
          raceId={selectedRace.id}
          onClose={() => setShowBettingModal(false)}
          userBalance={user.betCoins}
        />
      )}
    </div>
  );
}
