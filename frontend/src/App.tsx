import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import AuthScreen from './components/auth/AuthScreen';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import StudyTracker from './components/study/StudyTracker';
import RaceScreen from './components/race/RaceScreen';
import RankingScreen from './components/ranking/RankingScreen';
import ProfileScreen from './components/profile/ProfileScreen';

function AppContent() {
  const { isAuthenticated } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'study':
        return <StudyTracker />;
      case 'race':
        return <RaceScreen />;
      case 'ranking':
        return <RankingScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;