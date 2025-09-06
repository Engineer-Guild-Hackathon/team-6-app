import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Race, Bet, StudySession } from '../types';

interface AppState {
  user: User | null;
  currentRace: Race | null;
  userBets: Bet[];
  studySessions: StudySession[];
  users: User[];
  isAuthenticated: boolean;
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  placeBet: (bet: Omit<Bet, 'id'>) => void;
  setCurrentRace: (race: Race) => void;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_STUDY_SESSION'; payload: StudySession }
  | { type: 'PLACE_BET'; payload: Bet }
  | { type: 'SET_CURRENT_RACE'; payload: Race }
  | { type: 'SET_USERS'; payload: User[] };

const initialState: AppState = {
  user: null,
  currentRace: null,
  userBets: [],
  studySessions: [],
  users: [],
  isAuthenticated: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userBets: [],
        studySessions: [],
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'ADD_STUDY_SESSION':
      return {
        ...state,
        studySessions: [...state.studySessions, action.payload],
      };
    case 'PLACE_BET':
      return {
        ...state,
        userBets: [...state.userBets, action.payload],
      };
    case 'SET_CURRENT_RACE':
      return {
        ...state,
        currentRace: action.payload,
      };
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    if (state.user) {
      dispatch({ type: 'UPDATE_USER', payload: updates });
    }
  };

  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'ADD_STUDY_SESSION', payload: newSession });
    
    // Update user's bet coins and study time
    if (state.user) {
      updateUser({
        betCoins: state.user.betCoins + session.betCoinsEarned,
        totalStudyTime: state.user.totalStudyTime + session.duration,
        currentWeekStudyTime: state.user.currentWeekStudyTime + session.duration,
      });
    }
  };

  const placeBet = (bet: Omit<Bet, 'id'>) => {
    const newBet: Bet = {
      ...bet,
      id: Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'PLACE_BET', payload: newBet });
    
    // Deduct bet coins from user
    if (state.user) {
      updateUser({
        betCoins: state.user.betCoins - bet.amount,
      });
    }
  };

  const setCurrentRace = (race: Race) => {
    dispatch({ type: 'SET_CURRENT_RACE', payload: race });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        addStudySession,
        placeBet,
        setCurrentRace,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}