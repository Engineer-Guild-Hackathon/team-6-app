import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Clock, TrendingUp, Users, Target } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { generateMockRace } from '../../utils/mockData';
import BettingModal from './BettingModal';

export default function RaceScreen() {
  const { user, currentRace, setCurrentRace } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'race' | 'betting' | 'results'>('race');
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  useEffect(() => {
    if (!currentRace) {
      setCurrentRace(generateMockRace());
    }
  }, [currentRace, setCurrentRace]);

  if (!user || !currentRace) return null;

  const userInRace = currentRace.participants.find(p => p.user.id === user.id);
  const topParticipants = currentRace.participants.slice(0, 5);

  const handleBet = (participant: any) => {
    setSelectedParticipant(participant);
    setShowBettingModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏇 {currentRace.week} レース
        </h1>
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
              <CardHeader>
                <CardTitle>あなたの現在位置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{user.avatar}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      <p className="text-gray-600">{user.age}歳 {user.occupation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{userInRace.position}位</p>
                    <p className="text-gray-600">{userInRace.currentStudyTime}時間</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>現在の順位表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRace.participants.map((participant, index) => (
                  <div
                    key={participant.user.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      index === 0 ? 'border-yellow-300 bg-yellow-50' :
                      index === 1 ? 'border-gray-300 bg-gray-50' :
                      index === 2 ? 'border-orange-300 bg-orange-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-2xl">{participant.user.avatar}</div>
                      <div>
                        <h4 className="font-semibold">{participant.user.username}</h4>
                        <p className="text-sm text-gray-600">
                          {participant.user.age}歳 {participant.user.occupation}
                        </p>
                        {/* <div className="flex space-x-2 mt-1">
                          {participant.user.studySubjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {participant.currentStudyTime}時間
                      </p>
                      <div className="text-sm text-gray-600">
                        単勝 {participant.odds.win}倍
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'betting' && (
        <Card>
          <CardHeader>
            <CardTitle>ベッティング - 勝者を予想しよう！</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-amber-800">
                💰 あなたの保有ベットコイン: <span className="font-bold">{user.betCoins.toLocaleString()} BC</span>
              </p>
              <p className="text-sm text-amber-700 mt-2">
                最小ベット額: 100 BC | 単勝・複勝から選択できます
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topParticipants.map((participant, index) => (
                <Card key={participant.user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{participant.user.avatar}</div>
                      <h4 className="font-semibold text-lg mb-1">{participant.user.username}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {participant.user.age}歳 {participant.user.occupation}
                      </p>
                      <p className="text-emerald-600 font-bold mb-2">
                        {participant.currentStudyTime}時間 (現在{index + 1}位)
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>単勝オッズ</span>
                          <span className="font-bold text-red-600">{participant.odds.win}倍</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>複勝オッズ</span>
                          <span className="font-bold text-blue-600">{participant.odds.place}倍</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBet(participant)}
                        className="w-full"
                        disabled={user.betCoins < 100}
                      >
                        ベットする
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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