import { useEffect, useState } from 'react';
import { User, Coins, Clock, Edit2, Save, X, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { getStudySubjectsFromUserId } from '../../utils/getStudySubjectsFromUserId';
import { getAllSubjects } from '../../utils/getAllSubjects';
import { toast } from 'react-toastify';

export default function ProfileScreen() {
  const { user, updateUser, studySessions, updateUserSubjects } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    age: user?.age || 24,
    occupation: user?.occupation || '',
    selectedSubjects: selectedSubjects.join(', ') || '',
    avatar: user?.avatar || '🎯',
    currentWeekStudyGoal: user?.currentWeekStudyGoal ?? 0,
  });

  // ===== 月送り用 =====
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const gotoToday = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    setViewMonth((m) => {
      const nm = m + 1;
      if (nm > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return nm;
    });
  };
  const prevMonth = () => {
    setViewMonth((m) => {
      const pm = m - 1;
      if (pm < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return pm;
    });
  };

  // 週目標（分）→ 時/分の文字列
  const [goalHoursStr, setGoalHoursStr] = useState(
    String(Math.floor((user?.currentWeekStudyGoal ?? 0) / 60))
  );
  const [goalMinutesStr, setGoalMinutesStr] = useState(
    String((user?.currentWeekStudyGoal ?? 0) % 60)
  );

  // editData や user が変わったら同期
  useEffect(() => {
    const total = editData.currentWeekStudyGoal ?? user?.currentWeekStudyGoal ?? 0;
    setGoalHoursStr(String(Math.floor(total / 60)));
    setGoalMinutesStr(String(total % 60));
  }, [editData.currentWeekStudyGoal, user]);

  // 全科目
  useEffect(() => {
    getAllSubjects().then(setAllSubjects);
  }, []);

  // ユーザー科目
  useEffect(() => {
    if (!user) return;
    const fetchSubjects = async () => {
      const subjectsWithId = await getStudySubjectsFromUserId(user.id);
      setSelectedSubjects(subjectsWithId.map((sub) => sub.name));
    };
    fetchSubjects();
  }, [user]);

  // user 変更で editData 再同期
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        age: user.age,
        occupation: user.occupation,
        selectedSubjects: selectedSubjects.join(', '),
        avatar: user.avatar || '🎯',
        currentWeekStudyGoal: user.currentWeekStudyGoal ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  if (!user) return null;

  const handleSave = async () => {
    setIsEditing(false);
    await updateUser({ ...editData, currentWeekStudyGoal: editData.currentWeekStudyGoal });
    const ok = await updateUserSubjects(selectedSubjects);
    if (!ok) {
      toast.warn('科目の更新に失敗しました.デモでは変更できません', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      const refreshedSubjects = await getStudySubjectsFromUserId(user.id);
      setSelectedSubjects(refreshedSubjects.map((sub) => sub.name));
      return;
    }
    const refreshedSubjects = await getStudySubjectsFromUserId(user.id);
    setSelectedSubjects(refreshedSubjects.map((sub) => sub.name));
  };

  const handleCancel = async () => {
    if (!user) return;
    const formerSubjects = await getStudySubjectsFromUserId(user.id);
    setEditData({
      username: user.username,
      age: user.age,
      occupation: user.occupation,
      selectedSubjects: formerSubjects.join(', '),
      avatar: user.avatar,
      currentWeekStudyGoal: user.currentWeekStudyGoal ?? 0,
    });
    setIsEditing(false);
  };

  // ====== 今月のカレンダー用データ（週開始：月曜） ======
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // 0:月, 1:火, ... 6:日

  const toKey = (d: Date | string) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  // ビュー月の各日の合計勉強時間(分)
  const studyByDay: Record<string, number> = {};
  studySessions.forEach((s: { date: string | Date; duration: number }) => {
    const k = toKey(s.date);
    const dt = new Date(k);
    if (dt.getFullYear() === viewYear && dt.getMonth() === viewMonth) {
      studyByDay[k] = (studyByDay[k] || 0) + s.duration;
    }
  });

  const totalCells = startOffset + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);
  const cells: Array<{ day?: number; key: string; studied: boolean; minutes: number; isToday: boolean }> = [];
  for (let i = 0; i < weeks * 7; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ key: `empty-${i}`, studied: false, minutes: 0, isToday: false });
    } else {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const minutes = studyByDay[dateKey] || 0;
      const isToday =
        viewYear === today.getFullYear() &&
        viewMonth === today.getMonth() &&
        dayNum === today.getDate();
      cells.push({ day: dayNum, key: dateKey, studied: minutes > 0, minutes, isToday });
    }
  }

  const avatars = ['🧑‍💼', '👩‍🎓', '👨‍💻', '👸', '👨‍🏫', '🎯', '📚', '💪', '🌟', '🚀'];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 プロフィール</h1>
        <p className="text-gray-600">あなたの情報と統計を確認・編集できます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 基本情報（左2列） */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-auto" />
                  <span>基本情報</span>
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-auto mr-2" />
                    編集
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-auto mr-2" />
                      保存
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="w-auto mr-2" />
                      キャンセル
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* アバター選択（編集時のみ） */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">アバター</label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setEditData((prev) => ({ ...prev, avatar }))}
                          className={`text-3xl p-2 rounded-lg border-2 hover:bg-gray-50 ${editData.avatar === avatar ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                            }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 会員証風カード */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-xl p-4 shadow-inner flex items-center justify-center border border-gray-300">
                      <div className="text-6xl">{editData.avatar}</div>
                    </div>

                    <div className="flex-1">
                      {!isEditing ? (
                        <>
                          <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                          <p className="text-gray-600">{user.age}歳 {user.occupation}</p>
                          <p className="text-gray-700">
                            今週の目標：{Math.floor((user.currentWeekStudyGoal ?? 0) / 60)}時間
                            {(user.currentWeekStudyGoal ?? 0) % 60}分
                          </p>
                        </>
                      ) : (
                        <div className="space-y-4">
                          {/* 名前 */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <label className="w-16 text-base font-bold text-gray-700">名前：</label>
                            <input
                              type="text"
                              value={editData.username}
                              onChange={(e) => setEditData((prev) => ({ ...prev, username: e.target.value }))}
                              className="w-full flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="ユーザー名"
                            />
                          </div>

                          {/* 年齢 */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <label className="w-16 text-base font-bold text-gray-700">年齢：</label>
                            <input
                              type="number"
                              min={0}
                              max={120}
                              value={editData.age}
                              onChange={(e) => setEditData((prev) => ({ ...prev, age: Number(e.target.value) }))}
                              className="w-full flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="年齢"
                            />
                          </div>

                          {/* 職業 */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <label className="w-16 text-base font-bold text-gray-700">職業：</label>
                            <select
                              value={editData.occupation}
                              onChange={(e) => setEditData((prev) => ({ ...prev, occupation: e.target.value }))}
                              className="w-full flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                </div>

                {/* 今週の目標（編集時のみ） */}
                {isEditing && (
                  <div className="mt-6 flex items-center flex-wrap gap-3 justify-center">
                    <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">今週の目標：</span>
                    {/* 時間 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={goalHoursStr}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
                          setGoalHoursStr(v);
                          const h = parseInt(v || '0', 10);
                          const m = parseInt(goalMinutesStr || '0', 10);
                          setEditData((prev) => ({ ...prev, currentWeekStudyGoal: h * 60 + m }));
                        }}
                        onBlur={() => { if (goalHoursStr === '') setGoalHoursStr('0'); }}
                        className="w-20 h-10 text-center px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">時間</span>
                    </div>
                    {/* 分 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={goalMinutesStr}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
                          const n = Math.min(59, Math.max(0, parseInt(v || '0', 10)));
                          v = String(n);
                          setGoalMinutesStr(v);
                          const h = parseInt(goalHoursStr || '0', 10);
                          setEditData((prev) => ({ ...prev, currentWeekStudyGoal: h * 60 + n }));
                        }}
                        onBlur={() => { if (goalMinutesStr === '') setGoalMinutesStr('0'); }}
                        className="w-20 h-10 text-center px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">分</span>
                    </div>
                  </div>
                )}

                {/* 勉強科目 */}
                <div className="pt-6">
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span className="text-lg font-semibold leading-none tracking-tight text-gray-900">勉強科目</span>
                  </div>
                  <div className="mt-3">
                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((subject, index) => (
                          <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allSubjects.map((subject) => (
                          <label
                            key={subject}
                            className={`cursor-pointer px-3 py-1 border rounded-lg ${selectedSubjects.includes(subject) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 border-gray-300'
                              }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                            />
                            {subject}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 統計情報（右2列） */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>統計情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* 保有ベットコイン */}
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-amber-700">保有ベットコイン</p>
                  <p className="text-2xl font-bold text-amber-800">{user.betCoins.toLocaleString()}</p>
                </div>

                {/* 総勉強時間 */}
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <Clock className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-emerald-700">総勉強時間</p>
                  <p className="text-2xl font-bold text-emerald-800">{Math.floor(user.totalStudyTime / 60)}時間</p>
                </div>

                {/* 今週の勉強時間 */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">今週の勉強時間</p>
                  <p className="text-2xl font-bold text-blue-800">{Math.floor(user.currentWeekStudyTime / 60)}時間</p>
                </div>

                {/* 今月のベット額 */}
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <Coins className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm text-pink-700">今月のベット額</p>
                  <p className="text-2xl font-bold text-pink-800">{(user.currentMonthBet ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 今月の勉強カレンダー（全幅） */}
        <div className="lg:col-span-4 ">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className='text-lg md:text-xl'>今月の勉強カレンダー（{viewYear}年 {viewMonth + 1}月）</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth} aria-label="前の月へ">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className='text-sm md:text-lg w-20 md:w-24' onClick={gotoToday}>今日へ</Button>
                  <Button variant="outline" size="sm" onClick={nextMonth} aria-label="次の月へ">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 曜日ヘッダー（月→日） */}
              <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-3 md:mb-4">
                {['月', '火', '水', '木', '金', '土', '日'].map((w) => (
                  <div key={w} className="py-2">{w}</div>
                ))}
              </div>

              {/* 日付セル（横長＋縦拡大） */}
              <div className="grid grid-cols-7 gap-2 md:gap-3 lg:gap-4">
                {cells.map((c, idx) => {
                  if (!c.day) {
                    return <div key={c.key ?? `empty-${idx}`} className="h-28 md:h-32 lg:h-40 rounded-lg border border-transparent" />;
                  }
                  const studied = c.studied;
                  const minutes = c.minutes;
                  const hoursText = minutes > 0 ? `${(minutes / 60).toFixed(1)}h` : '';

                  return (
                    <div
                      key={c.key}
                      className={`h-28 md:h-32 lg:h-40 rounded-lg border p-2 md:p-3 flex flex-col justify-between ${studied ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-gray-200'
                        } ${c.isToday ? 'ring-2 ring-emerald-500' : ''}`}
                      title={studied ? `${(minutes / 60).toFixed(2)} 時間` : '勉強なし'}
                    >
                      <div className="text-sm md:text-base font-semibold text-gray-800">{c.day}</div>
                      {studied && <div className="text-xs md:text-sm font-medium text-emerald-800 self-end">{hoursText}</div>}
                    </div>
                  );
                })}
              </div>

              {/* 凡例 */}
              <div className="mt-4 md:mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
                  <span>勉強した日</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-emerald-500" />
                  <span>今日</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
