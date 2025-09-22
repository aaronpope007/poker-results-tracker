import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Session, Player, Stake, Format, TableRating } from '../types';

interface AppState {
  sessions: Session[];
  players: Player[];
  stakes: Stake[];
  formats: Format[];
  tableRatings: TableRating[];
  currentSession: Session | null;
  totalNet: number;
}

type AppAction =
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_CURRENT_SESSION'; payload: Session | null }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'ADD_STAKE'; payload: Stake }
  | { type: 'ADD_FORMAT'; payload: Format }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  sessions: [],
  players: [],
  stakes: [
    { id: '1', name: '.2/.5/1 (.2 ante)', format: '8-max' },
    { id: '2', name: '.5/1/2 (.5 ante)', format: '8-max' },
    { id: '3', name: '1/2/4 (1 ante)', format: '8-max' },
    { id: '4', name: '2/4 (1 ante)', format: 'HU' },
    { id: '5', name: '5/10 (2 ante)', format: 'HU' },
    { id: '6', name: '10/20 (2 ante)', format: 'HU' },
  ],
  formats: [
    { id: '1', name: 'HU with ante' },
    { id: '2', name: '8-max with ante' },
  ],
  tableRatings: [],
  currentSession: null,
  totalNet: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
      };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.payload] };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'ADD_STAKE':
      return { ...state, stakes: [...state.stakes, action.payload] };
    case 'ADD_FORMAT':
      return { ...state, formats: [...state.formats, action.payload] };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('poker-tracker-data');
    console.log('Loading data from localStorage:', savedData);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('Parsed data:', parsed);
        // Convert date strings back to Date objects
        if (parsed.sessions) {
          parsed.sessions = parsed.sessions.map((session: any) => ({
            ...session,
            date: new Date(session.date),
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
          }));
        }
        dispatch({ type: 'LOAD_DATA', payload: parsed });
        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      console.log('No saved data found in localStorage');
    }
  }, []);

  useEffect(() => {
    // Don't save on initial load to avoid overwriting with empty state
    if (state.sessions.length > 0 || state.players.length > 0) {
      localStorage.setItem('poker-tracker-data', JSON.stringify(state));
      console.log('Data saved to localStorage:', state);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
