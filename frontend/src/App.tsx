// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';

import AuthScreen from './components/auth/AuthScreen';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import StudyTracker from './components/study/StudyTracker';
import RaceScreen from './components/race/RaceScreen';
import RankingScreen from './components/ranking/RankingScreen';
import ProfileScreen from './components/profile/ProfileScreen';

// ✅ 追加：toastify（コンテナはアプリ全体に1回だけ）
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RoutedAppContent() {
  const { isAuthenticated } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return <AuthScreen />;

  const pathToTab = (pathname: string): string => {
    if (pathname.startsWith('/study')) return 'study';
    if (pathname.startsWith('/race')) return 'race';
    if (pathname.startsWith('/ranking')) return 'ranking';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const tabToPath = (tab: string): string => {
    switch (tab) {
      case 'study': return '/study';
      case 'race': return '/race';
      case 'ranking': return '/ranking';
      case 'profile': return '/profile';
      case 'dashboard':
      default: return '/';
    }
  };

  const activeTab = pathToTab(location.pathname);
  const setActiveTab = (tab: string) => navigate(tabToPath(tab));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/study" element={<StudyTracker />} />
        <Route path="/race" element={<RaceScreen />} />
        <Route path="/ranking" element={<RankingScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
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
        {/* ✅ ここに一度だけ配置。どの画面からでも toast() を呼べる */}
        <ToastContainer
          position="top-center"
          theme="colored"
          autoClose={3200}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
        />
      </BrowserRouter>
    </AppProvider>
  );
}
