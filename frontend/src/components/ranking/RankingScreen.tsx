import { useEffect, useState } from 'react';
import { Coins, Trophy, Crown, Medal, Award, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { getUsersByBetCoins, getUsersByStudyTime } from '../../utils/getRankings';

export default function RankingScreen() {
  const { user } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'coins' | 'study'>('coins');
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 初回ロード
  useEffect(() => {
    fetchRankings();
  }, [selectedTab]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data =
        selectedTab === 'coins'
          ? await getUsersByBetCoins()
          : await getUsersByStudyTime();
      setSortedUsers(data || []);
    } catch (err) {
      console.error('ランキング取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-500" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</div>;
    }
  };

  const getRankBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'border-2 border-blue-400 bg-blue-50';
    }
    switch (rank) {
      case 1:
        return 'border-2 border-yellow-300 bg-yellow-50';
      case 2:
        return 'border-2 border-gray-300 bg-gray-50';
      case 3:
        return 'border-2 border-orange-300 bg-orange-50';
      default:
        return 'border border-gray-200 bg-white';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className='flex items-center justify-between'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 ランキング</h1>
          <p className="text-gray-600">最強の{selectedTab === 'coins' ? 'ギャンプラー' : '勉強家'}は誰だ？</p>
        </div>
        <button
          onClick={fetchRankings}
          disabled={loading}
          className="flex items-center px-4 py-2 rounded-lg border  hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedTab('coins')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
            selectedTab === 'coins'
              ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Coins className="h-5 w-5" />
          <span>ベットコイン</span>
        </button>
        <button
          onClick={() => setSelectedTab('study')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
            selectedTab === 'study'
              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          <span>総勉強時間</span>
        </button>
      </div>

      {/* User's Current Rank */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>あなたの順位</CardTitle>
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
              <div className="flex items-center space-x-2 mb-1">
                {getRankIcon(sortedUsers.findIndex(u => u?.id === user.id) + 1)}
                <span className="text-3xl font-bold text-blue-600">
                  {sortedUsers.findIndex(u => u?.id === user.id) + 1}位
                </span>
              </div>
              <p className="text-gray-600">
                {selectedTab === 'coins' 
                  ? `${user.betCoins.toLocaleString()} BC`
                  : `${Math.floor(user.totalStudyTime / 60)}時間${user.totalStudyTime % 60}分`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTab === 'coins' ? 'ベットコインランキング' : '総勉強時間ランキング'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedUsers.slice(0, 20).map((rankUser, index) => {
              if (!rankUser) return null;
              
              const rank = index + 1;
              const isCurrentUser = rankUser.id === user.id;
              
              return (
                <div
                  key={rankUser.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${getRankBackground(rank, isCurrentUser)}`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(rank)}
                    <div className="text-2xl">{rankUser.avatar}</div>
                    <div>
                      <h4 className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                        {rankUser.username} {isCurrentUser && '(あなた)'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {rankUser.age}歳 {rankUser.occupation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedTab === 'coins' ? (
                      <div>
                        <p className="text-xl font-bold text-amber-600">
                          {rankUser.betCoins.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">ベットコイン</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-bold text-emerald-600">
                          {Math.floor(rankUser.totalStudyTime / 60)}時間{rankUser.totalStudyTime % 60}分
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">総参加者数</p>
            <p className="text-2xl font-bold text-gray-900">{sortedUsers.length}人</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">総ベットコイン</p>
            <p className="text-2xl font-bold text-gray-900">
              {sortedUsers.reduce((sum, u) => sum + (u?.betCoins || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">総勉強時間</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(sortedUsers.reduce((sum, u) => sum + (u?.totalStudyTime || 0), 0) / 60)}時間
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}