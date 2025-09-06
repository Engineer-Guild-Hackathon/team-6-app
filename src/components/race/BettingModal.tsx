import React, { useState } from 'react';
import { X, Coins } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

interface BettingModalProps {
  participant: any;
  onClose: () => void;
  userBalance: number;
}

export default function BettingModal({ participant, onClose, userBalance }: BettingModalProps) {
  const { placeBet, currentRace } = useAppContext();
  const [betType, setBetType] = useState<'win' | 'place'>('win');
  const [amount, setAmount] = useState(100);

  const handlePlaceBet = () => {
    if (amount < 100) {
      alert('最小ベット額は100ベットコインです。');
      return;
    }

    if (amount > userBalance) {
      alert('残高が不足しています。');
      return;
    }

    const odds = betType === 'win' ? participant.odds.win : participant.odds.place;
    const expectedReturn = Math.floor(amount * odds);

    const confirmMessage = `${participant.user.username}に${amount}BCを${betType === 'win' ? '単勝' : '複勝'}でベットしますか？\n\n予想配当: ${expectedReturn}BC`;
    
    if (confirm(confirmMessage)) {
      placeBet({
        userId: 'current_user',
        raceId: currentRace?.id || '',
        participantId: participant.user.id,
        type: betType,
        amount,
        odds,
        createdAt: new Date().toISOString(),
      });
      
      alert(`ベットが完了しました！\n${participant.user.username}に${amount}BCをベットしました。`);
      onClose();
    }
  };

  const expectedReturn = Math.floor(amount * (betType === 'win' ? participant.odds.win : participant.odds.place));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ベッティング</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Participant Info */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{participant.user.avatar}</div>
              <h3 className="text-xl font-semibold">{participant.user.username}</h3>
              <p className="text-gray-600">{participant.user.age}歳 {participant.user.occupation}</p>
              <p className="text-emerald-600 font-bold mt-2">
                現在勉強時間: {participant.currentStudyTime}時間
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
                  className={`p-3 rounded-lg border-2 text-center ${
                    betType === 'win'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="font-semibold">単勝</div>
                  <div className="text-sm">{participant.odds.win}倍</div>
                  <div className="text-xs text-gray-500">1位のみ的中</div>
                </button>
                <button
                  onClick={() => setBetType('place')}
                  className={`p-3 rounded-lg border-2 text-center ${
                    betType === 'place'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="font-semibold">複勝</div>
                  <div className="text-sm">{participant.odds.place}倍</div>
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
                min="100"
                max={userBalance}
                step="100"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 100)}
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
                    {(userBalance - amount + expectedReturn).toLocaleString()} BC
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                キャンセル
              </Button>
              <Button onClick={handlePlaceBet} className="flex-1">
                <Coins className="h-4 w-4 mr-2" />
                ベットする
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}