import React, { useState } from 'react';
import { Coins, Trophy, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { getCurrentUser } from '../../utils/mockData';
import { supabase } from '../../supabaseClient';
import { getUserFromUserId } from '../../utils/getUserFromUserId';

export default function AuthScreen() {
  const [hasAccount, setHasAccount] = useState(true);
  const { login } = useAppContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    occupation: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(hasAccount) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setMessage('ユーザー情報の取得に失敗しました');
      setLoading(false);
      return;
    }
    setMessage('ログイン成功！');
    setLoading(false);
    const user = await getUserFromUserId(data.user.id);
    if (user) {
      login(user);
    } else {
      setMessage('ユーザー情報の取得に失敗しました');
      return;
    }
  }

  const handleSignUp = async () => {
    setLoading(true);
    const {data, error} = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setMessage('ユーザー情報の取得に失敗しました');
      setLoading(false);
      return;
    }
    // usersテーブルにも追加
    const { error: tableError } = await supabase.from('users').insert([{
      id: data.user.id,
      username: formData.username,
      age: formData.age ? parseInt(formData.age) : null,
      occupation: formData.occupation,
      }]);
    if (tableError) {
      setMessage(tableError.message);
      setLoading(false);
      return;
    }
    setMessage('登録成功！');
    setLoading(false);
    setHasAccount(true);
    const user = await getUserFromUserId(data.user.id);
    if (!user) {
      setMessage('ユーザー情報の取得に失敗しました');
      return;
    }
    login(user);
  };

  const handleDemoLogin = () => {
    const user = getCurrentUser();
    login(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="text-6xl font-bold text-emerald-600 mb-4">🎯 Study Derby</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            勉強時間で競馬をしよう！
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            勉強するほどベットコインを獲得。毎週のレースでギャンブルを楽しもう！
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">勉強記録</h3>
              <p className="text-gray-600">100分 = 100ベットコイン</p>
            </div>
            <div className="text-center">
              <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">週間レース</h3>
              <p className="text-gray-600">15人の競走馬でバトル</p>
            </div>
            <div className="text-center">
              <Coins className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">ベッティング</h3>
              <p className="text-gray-600">単勝・複勝で賭けよう</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {hasAccount ? 'ログイン' : 'アカウント作成'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <div className="mb-4 text-red-600 text-center">{message}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="your@email.com"
                  />
                </div>

                {!hasAccount && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ユーザー名
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="yamada_taro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          年齢
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="24"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          職業
                        </label>
                        <select
                          value={formData.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">選択してください</option>
                          <option value="大学生">大学生</option>
                          <option value="高校生">高校生</option>
                          <option value="会社員">会社員</option>
                          <option value="エンジニア">エンジニア</option>
                          <option value="教師">教師</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? '処理中...' : hasAccount ? 'ログイン' : 'アカウント作成'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                >
                  デモで始める
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setHasAccount(!hasAccount)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {hasAccount ? 'アカウントを作成' : 'ログインに戻る'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
