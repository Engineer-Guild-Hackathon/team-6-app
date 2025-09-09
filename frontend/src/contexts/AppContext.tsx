import { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Race, Bet, StudySession } from '../types';
import { supabase } from '../supabaseClient';

interface AppState {
  user: User | null;
  currentRace: Race | null;
  userBets: Bet[];
  studySessions: StudySession[];
  users: User[];
  isAuthenticated: boolean;
  subjects?: string[]; // 教科のリスト
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserSubjects: (subjects: string[]) => Promise<boolean>;
  addStudySession: (session: Omit<StudySession, 'id' | 'subjectName'>) => void;
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
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'UPDATE_USER_SUBJECTS'; payload: string[] };

const initialState: AppState = {
  user: null,
  currentRace: null,
  userBets: [],
  studySessions: [],
  users: [],
  isAuthenticated: false,
  subjects: [],
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
    case 'UPDATE_USER_SUBJECTS':
      return {
        ...state,
        subjects: action.payload,
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

  const updateUser = async (updates: Partial<User>) => {
    // ユーザー情報を更新
    // Supabase への更新処理はここで行う
    if(!state.user) return;

    const {data, error} = await supabase
      .from('users')
      .update({
        username: updates.username,
        age: updates.age,
        occupation: updates.occupation,
        bet_coins: updates.betCoins,
        total_study_time: updates.totalStudyTime,
        current_week_study_time: updates.currentWeekStudyTime,
        avatar: updates.avatar,
      })
      .eq('id', state.user.id)
      .select()
      .single();
    
    if(error) {
      console.error('Error updating user:', error.message);
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: data });
    
  };

  const updateUserSubjects = async (subjects: string[]): Promise<boolean>=> {
    // ユーザーが勉強している科目を更新
    if (!state.user) return false;

    const userId = state.user.id;

    // 既存の user_subjects を削除してから新しい科目を挿入するRPC
    const {error} = await supabase.rpc('replace_user_subjects', {
      uid: userId, 
      subject_names: subjects
    });

    if(error) {
      console.error('Error updating user subjects via RPC:', error.message);
      return false;
    }

    // ローカル state を更新
    dispatch({ type: 'UPDATE_USER_SUBJECTS', payload: subjects });
    return true;
  };

  const addStudySession = async (session: Omit<StudySession, 'id'>) => {
    if(!state.user) return;
    const newSession: StudySession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'ADD_STUDY_SESSION', payload: newSession });
    
    // Supabaseに保存
    const { error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: state.user.id,
        subject_id: session.subjectId,
        duration: session.duration,
        date: session.date,
        bet_coins_earned: session.betCoinsEarned,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding study session:', error.message);
      // 必要であればローカル state から削除するなどのフォールバック
      return;
    }
    // ユーザーのベットコインと勉強時間を更新
    await updateUser({
      betCoins: state.user.betCoins + session.betCoinsEarned,
      totalStudyTime: state.user.totalStudyTime + session.duration,
      currentWeekStudyTime: state.user.currentWeekStudyTime + session.duration,
    });
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
        updateUserSubjects,
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