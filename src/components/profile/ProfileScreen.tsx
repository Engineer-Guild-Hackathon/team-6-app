import React, { useState } from 'react';
import { User, Coins, Clock, Trophy, Edit2, Save, X } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

export default function ProfileScreen() {
  const { user, updateUser, studySessions } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    age: user?.age || 24,
    occupation: user?.occupation || '',
    studySubjects: user?.studySubjects.join(', ') || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      ...editData,
      studySubjects: editData.studySubjects.split(',').map(s => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      username: user.username,
      age: user.age,
      occupation: user.occupation,
      studySubjects: user.studySubjects.join(', '),
    });
    setIsEditing(false);
  };

  const weeklyData = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStudyTime = studySessions
      .filter(session => new Date(session.date).toDateString() === date.toDateString())
      .reduce((total, session) => total + session.duration, 0);
    return {
      day: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
      hours: dayStudyTime,
    };
  });

  const avatars = ['🧑‍💼', '👩‍🎓', '👨‍💻', '👸', '👨‍🏫', '🎯', '📚', '💪', '🌟', '🚀'];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 プロフィール</h1>
        <p className="text-gray-600">あなたの情報と統計を確認・編集できます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>基本情報</span>
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      保存
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      キャンセル
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar Selection */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アバター
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => updateUser({ avatar })}
                          className={`text-3xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                            user.avatar === avatar 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{user.avatar}</div>
                  <div>
                    {!isEditing ? (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                        <p className="text-gray-600">{user.age}歳 {user.occupation}</p>
                        <p className="text-sm text-gray-500">
                          {user.grade} | 参加日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="ユーザー名"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={editData.age}
                            onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="年齢"
                          />
                          <select
                            value={editData.occupation}
                            onChange={(e) => setEditData(prev => ({ ...prev, occupation: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">職業を選択</option>
                            <option value="大学生">大学生</option>
                            <option value="高校生">高校生</option>
                            <option value="会社員">会社員</option>
                            <option value="エンジニア">エンジニア</option>
                            <option value="教師">教師</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勉強科目
                  </label>
                  {!isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {user.studySubjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editData.studySubjects}
                      onChange={(e) => setEditData(prev => ({ ...prev, studySubjects: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="TOEIC, 簿記, プログラミング（カンマ区切り）"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>今週の勉強記録</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 text-sm font-medium text-gray-700">{day.day}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((day.hours / 8) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">
                      {Math.floor(day.hours * 100) / 100}h
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Current Stats */}
          <Card>
            <CardHeader>
              <CardTitle>統計情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-700">保有ベットコイン</p>
                <p className="text-2xl font-bold text-amber-800">
                  {user.betCoins.toLocaleString()}
                </p>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Clock className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-emerald-700">総勉強時間</p>
                <p className="text-2xl font-bold text-emerald-800">
                  {user.totalStudyTime}時間
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">今週の勉強時間</p>
                <p className="text-2xl font-bold text-blue-800">
                  {user.currentWeekStudyTime}時間
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>最近の実績</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-sm font-semibold">初回ベット達成</p>
                    <p className="text-xs text-gray-600">初めてベットをしました</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <div className="text-2xl">📚</div>
                  <div>
                    <p className="text-sm font-semibold">継続学習者</p>
                    <p className="text-xs text-gray-600">5日連続で勉強しました</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <p className="text-sm font-semibold">長時間学習</p>
                    <p className="text-xs text-gray-600">一日5時間以上勉強しました</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}