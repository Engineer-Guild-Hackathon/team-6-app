import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthScreen from './components/auth/AuthScreen';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import StudyTracker from './components/study/StudyTracker';
import RaceScreen from './components/race/RaceScreen';
import RankingScreen from './components/ranking/RankingScreen';
import ProfileScreen from './components/profile/ProfileScreen';

function RoutedAppContent() {
  const { isAuthenticated } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return <AuthScreen />;

  // パス <-> タブ名 の相互変換（Navbar を無改修で使うため）
  const pathToTab = (pathname: string): string => {
    if (pathname.startsWith('/study')) return 'study';
    if (pathname.startsWith('/race')) return 'race';
    if (pathname.startsWith('/ranking')) return 'ranking';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'dashboard'; // '/'
  };

  const tabToPath = (tab: string): string => {
    switch (tab) {
      case 'study':
        return '/study';
      case 'race':
        return '/race';
      case 'ranking':
        return '/ranking';
      case 'profile':
        return '/profile';
      case 'dashboard':
      default:
        return '/';
    }
  };

  const activeTab = pathToTab(location.pathname);
  const setActiveTab = (tab: string) => {
    navigate(tabToPath(tab));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ここが画面の出し分け（URLで制御） */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/study" element={<StudyTracker />} />
        <Route path="/race" element={<RaceScreen />} />
        <Route path="/ranking" element={<RankingScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />

        {/* レース詳細（順位表クリックでここへ遷移） */}
        <Route path="/races/:raceId" element={<RaceScreen />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RoutedAppContent />
        <ToastContainer position="top-center" theme="colored" />
      </BrowserRouter>
    </AppProvider>
  );
}
