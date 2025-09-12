import { useState, useEffect} from 'react';
import { Clock, Play, Pause, Square, Plus, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { toast } from 'react-toastify';
import { getStudySubjectsFromUserId } from '../../utils/getStudySubjectsFromUserId';
import { StudySession, SubjectWithId } from '../../types';
import { getStudySessionsFromUserId } from '../../utils/getStudySessionsFromUserId';

export default function StudyTracker() {
  const { user, studySessions, addStudySession } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  // userが選択している科目リスト
  const [userSubjects, setUserSubjects] = useState<SubjectWithId[]>([]);
  // 選択中の科目
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithId | null>(null);
  // ユーザーの過去の勉強記録
  const [pastSessions, setPastSessions] = useState<StudySession[]>([]);
  useEffect(() => {
    if (!user) return;

    async function fetchSubjects() {
      const subjects = await getStudySubjectsFromUserId(user!.id);
      setUserSubjects(subjects);
    }
    async function fetchPastSessions() {
      const sessions = await getStudySessionsFromUserId(user!.id);
      setPastSessions(sessions);
    }
    fetchSubjects();
    fetchPastSessions();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    if (!userSubjects.length) {
      // CHANGED: alert -> toast.warn
      toast.warn('勉強科目を選択してください！', {
        position: 'top-center',
        autoClose: 3000, //アラートが閉じるまでの時間
        theme: 'colored',
      });
      return;
    }
    if(!selectedSubject) {
      toast.warn('勉強科目を選択してください！', {
        position: 'top-center',
        autoClose: 3000, //アラートが閉じるまでの時間
        theme: 'colored',
      });
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (time > 0) {
      const minutes = Math.floor(time / 60);
      const betCoinsEarned = minutes; // 1分ごとに1ベットコイン
      const duration = minutes; // 時間は分単位で保存
      addStudySession({
        userId: user?.id || '',
        subjectId: selectedSubject?.id || '',
        duration,
        date: new Date().toISOString(),
        betCoinsEarned: betCoinsEarned,
      });

      // CHANGED: alert -> toast.success
      toast.info(
        `お疲れ様でした！\n${Math.floor(duration/60)}時間${duration%60}分勉強して${betCoinsEarned}ベットコインを獲得しました！`,
        {
          position: 'top-center',
          autoClose: 3500,
          theme: 'colored',
          // icon を少しリッチに
          icon: <span>🏁</span>,
        }
      );
    } else {
      // NEW: 0秒で終了した時の案内
      toast.error('タイマーが0秒です。記録は追加されません。', {
        position: 'top-center',
        autoClose: 2000,
      });
    }

    setIsRunning(false);
    setTime(0);
    setSelectedSubject(null);
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && user) {
      setSelectedSubject({ id: newSubject, name: newSubject });
      setNewSubject('');
      setShowNewSubjectInput(false);
      // OPTIONAL: 追加トースト
      toast.success('科目を追加しました', { autoClose: 1500 });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">勉強記録</h1>
        <p className="text-gray-600">時間を計測してベットコインを稼ごう！</p>
      </div>

      {/* Timer Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">
            <Clock className="h-6 w-6 inline-block mr-2" />
            勉強タイマー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-mono font-bold text-emerald-600 mb-6">
              {formatTime(time)}
            </div>

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勉強科目を選択
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                <select
                  value={selectedSubject?.id || ''}
                  onChange={(e) => setSelectedSubject(userSubjects.find(sub => sub.id === e.target.value) || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={isRunning}
                >
                  <option value="">科目を選択</option>
                    {userSubjects.length > 0 ? (
                    userSubjects.map((sub, index) => (
                      <option key={index} value={sub.id}>
                      {sub.name}
                      </option>
                    ))
                    ) : (
                    <option disabled>科目がありません</option>
                    )}
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowNewSubjectInput(true)}
                  disabled={isRunning}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showNewSubjectInput && (
                <div className="flex justify-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="新しい科目名"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button onClick={handleAddSubject} size="sm">追加</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewSubjectInput(false)} 
                    size="sm"
                  >
                    キャンセル
                  </Button>
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  開始
                </Button>
              ) : (
                <Button onClick={handlePause} variant="secondary" size="lg" className="px-8">
                  <Pause className="h-5 w-5 mr-2" />
                  一時停止
                </Button>
              )}
              <Button onClick={handleStop} variant="outline" size="lg" className="px-8">
                <Square className="h-5 w-5 mr-2" />
                終了
              </Button>
            </div>

            {time > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-800">
                  💰 現在の獲得予定: <span className="font-bold">
                    {Math.floor((time / 60))} ベットコイン
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study History */}
      <Card>
        <CardHeader>
          <CardTitle>最近の勉強記録</CardTitle>
        </CardHeader>
        <CardContent>
          {studySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              まだ勉強記録がありません。
              <br />
              タイマーを使って勉強を始めましょう！
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.slice(0,5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Trophy className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.subjectName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Math.floor(session.duration / 60)}時間{session.duration % 60}分
                    </p>
                    <p className="text-sm text-amber-600">
                      +{session.betCoinsEarned} BC
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}