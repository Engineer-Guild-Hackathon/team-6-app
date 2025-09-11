import { useEffect, useState, useCallback } from 'react';
import { X, Coins, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
// 先頭で追加
import { toast } from 'react-toastify';
import { BetType, UserPrivate } from '../../types';

interface BettingModalProps {
  participant: UserPrivate; // ベットされた参加者
  raceId: string;
  onClose: () => void;
  userBalance: number; // 賭けをするユーザーの残高
}

export default function BettingModal({ participant, raceId, onClose, userBalance }: BettingModalProps) {
  const { user, placeBet } = useAppContext();
  const [betType, setBetType] = useState<BetType>('win');
  const [amount, setAmount] = useState(100); // ベット額
  const [showConfirm, setShowConfirm] = useState(false);

  const odds = betType === 'win' ? participant.winOdds : participant.placeOdds;
  const expectedReturn = Math.floor(amount * odds!);
  const balanceIfHit = userBalance - amount + expectedReturn;

  const validate = useCallback(() => {
    if (amount < 100) {
      alert('最小ベット額は100ベットコインです。');
      return false;
    }
    if (amount > userBalance) {
      alert('残高が不足しています。');
      return false;
    }
    return true;
  }, [amount, userBalance]);

  const handleOpenConfirm = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmPlaceBet = () => {
    // 実行
    placeBet({
      userId: user!.id,
      raceId: raceId,
      participantId: participant.id,
      type: betType,
      amount: amount,
      createdAt: new Date().toISOString(),
    });

    // TODO: 色が少しおかしくないか？確認
    toast.success(
      <div className="text-lg font-bold text-center">
        ベットが完了しました
      </div>,
      {
        position: 'top-center',
        autoClose: 4000,
        theme: 'colored',
        icon: <span>✅</span>,
        className: 'min-h-[80px] flex items-center justify-center text-xl', // ← 全体のサイズ調整
      }
    );
    setShowConfirm(false);
    onClose();
  };

  // Escで確認カードを閉じる
  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfirm(false);
      if (e.key === 'Enter') confirmPlaceBet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ベッティング</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="閉じる"
                title="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Participant Info */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{participant.avatar}</div>
              <h3 className="text-xl font-semibold">{participant.username}</h3>
              <p className="text-gray-600">{participant.age}歳 {participant.occupation}</p>
              <p className="text-emerald-600 font-bold mt-2">
                現在勉強時間: {participant.currentWeekStudyTime}時間
              </p>
            </div>

            {/* Bet Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ベット種別
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBetType('win')}
                  className={`p-3 rounded-lg border-2 text-center transition ${betType === 'win'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="font-semibold">単勝</div>
                  <div className="text-sm">{participant.winOdds!}倍</div>
                  <div className="text-xs text-gray-500">1位のみ的中</div>
                </button>
                <button
                  onClick={() => setBetType('place')}
                  className={`p-3 rounded-lg border-2 text-center transition ${betType === 'place'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="font-semibold">複勝</div>
                  <div className="text-sm">{participant.placeOdds!}倍</div>
                  <div className="text-xs text-gray-500">3位以内で的中</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ベット額
              </label>
              <input
                type="number"
                min={100}
                max={userBalance}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex space-x-2 mt-2">
                {[100, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    disabled={preset > userBalance}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance and Expected Return */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>現在の残高</span>
                <span className="font-semibold">{userBalance.toLocaleString()} BC</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>ベット額</span>
                <span className="font-semibold text-red-600">-{amount.toLocaleString()} BC</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>予想配当</span>
                <span className="font-semibold text-green-600">+{expectedReturn.toLocaleString()} BC</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>的中時残高</span>
                  <span className="text-emerald-600">
                    {balanceIfHit.toLocaleString()} BC
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                キャンセル
              </Button>
              <Button onClick={handleOpenConfirm} className="flex-1" disabled={amount < 100 || amount > userBalance}>
                <Coins className="h-4 w-4 mr-2" />
                ベットする
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== 確認用の“小さな画面”オーバーレイ ===== */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm mx-4 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 animate-[fadeIn_120ms_ease-out] relative"
            role="dialog"
            aria-modal="true"
            aria-label="ベット内容の確認"
          >
            <div className="absolute right-3 top-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="閉じる"
                title="閉じる"
                autoFocus
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold">この内容でベットしますか？</h2>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl mb-2">{participant.avatar}</div>
                <div className="font-semibold">{participant.username}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {betType === 'win' ? '単勝' : '複勝'} / オッズ {odds}倍
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ベット額</span>
                  <span className="font-semibold">{amount.toLocaleString()} BC</span>
                </div>
                <div className="flex justify-between">
                  <span>予想配当</span>
                  <span className="font-semibold text-green-700">+{expectedReturn.toLocaleString()} BC</span>
                </div>
                <div className="flex justify-between">
                  <span>的中時残高</span>
                  <span className="font-semibold text-emerald-700">{balanceIfHit.toLocaleString()} BC</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  戻る
                </Button>
                <Button
                  onClick={confirmPlaceBet}
                  className="flex-1"
                >
                  この内容で確定
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== /確認画面 ===== */}
    </div>
  );
}
