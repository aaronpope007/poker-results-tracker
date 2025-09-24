import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { differenceInMinutes } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Session } from '../types';

export default function SessionTab() {
  const { state, dispatch } = useApp();
  
  // Safety check to prevent crashes
  if (!state) {
    return <div>Loading...</div>;
  }
  const [session, setSession] = useState<Partial<Session>>({
    date: new Date(),
    startTime: undefined,
    endTime: undefined,
    handsStart: 0,
    limit: '',
    format: 'HU with ante',
    straddle: false,
    accountStart: 0,
    isActive: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer effect for live updates - only when session is active
  useEffect(() => {
    if (!state.currentSession?.isActive) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [state.currentSession?.isActive]);

  // Load default settings and previous session data
  useEffect(() => {
    // Load default settings from localStorage
    const defaultSettings = localStorage.getItem('poker-default-settings');
    if (defaultSettings) {
      try {
        const settings = JSON.parse(defaultSettings);
        setSession(prev => ({
          ...prev,
          limit: settings.limit || '',
          format: settings.format || 'HU with ante',
        }));
      } catch (error) {
        console.error('Error loading default settings:', error);
      }
    }

    // Load previous session data
    if (state.sessions.length > 0) {
      const lastSession = state.sessions[state.sessions.length - 1];
      if (lastSession.handsEnd) {
        setSession(prev => ({
          ...prev,
          handsStart: lastSession.handsEnd,
          accountStart: lastSession.accountEnd || 0,
        }));
      }
    }
  }, [state.sessions]);

  const handleStartSession = () => {
    const now = new Date();
    const newSession: Session = {
      id: Date.now().toString(),
      date: now,
      startTime: now,
      handsStart: session.handsStart || 0,
      limit: session.limit || '',
      format: session.format || 'HU with ante',
      straddle: session.straddle || false,
      accountStart: session.accountStart || 0,
      isActive: true,
    };
    
    dispatch({ type: 'ADD_SESSION', payload: newSession });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
    setIsEditing(true);
    
    // Initialize timer for the new session
    setCurrentTime(now);
    
    // Reset form for next session but keep current limit and format
    setSession(prev => ({
      date: new Date(),
      startTime: undefined,
      endTime: undefined,
      handsStart: 0,
      limit: prev.limit,
      format: prev.format,
      straddle: false,
      accountStart: 0,
      isActive: false,
    }));
  };

  const handleSaveDefaults = () => {
    const defaultSettings = {
      limit: session.limit,
      format: session.format,
    };
    localStorage.setItem('poker-default-settings', JSON.stringify(defaultSettings));
    alert('Default settings saved!');
  };

  const handleClearSession = () => {
    try {
      dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      setIsEditing(false);
      setCurrentTime(new Date());
      
      // Reset session form to default state
      setSession(prev => ({
        date: new Date(),
        startTime: undefined,
        endTime: undefined,
        handsStart: 0,
        limit: prev.limit || '',
        format: prev.format || 'HU with ante',
        straddle: false,
        accountStart: 0,
        isActive: false,
      }));
    } catch (error) {
      console.error('Error clearing session:', error);
      // Fallback: reload the page
      window.location.reload();
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('poker-tracker-data');
      localStorage.removeItem('poker-default-settings');
      window.location.reload();
    }
  };

  const handleEndSession = () => {
    if (!state.currentSession) return;
    
    const now = new Date();
    const updatedSession: Session = {
      ...state.currentSession,
      endTime: now,
      handsEnd: session.handsEnd,
      accountEnd: session.accountEnd,
      isActive: false,
    };
    
    dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
    setIsEditing(false);
    
    // Stop the timer when session ends
    setCurrentTime(now);
  };



  const getCurrentSessionDuration = useCallback(() => {
    if (!state.currentSession?.startTime || !state.currentSession?.isActive) return '0h 0m';
    try {
      const minutes = differenceInMinutes(currentTime, state.currentSession.startTime);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } catch (error) {
      console.error('Error calculating session duration:', error);
      return '0h 0m';
    }
  }, [state.currentSession?.startTime, state.currentSession?.isActive, currentTime]);

  const getTotalHands = () => {
    if (!session.handsEnd || !session.handsStart) return 0;
    return session.handsEnd - session.handsStart;
  };

  const getSessionNet = () => {
    if (!session.accountEnd || !session.accountStart) return 0;
    return session.accountEnd - session.accountStart;
  };

  const getHandsPerHour = () => {
    if (!session.startTime || !session.handsEnd) return 0;
    const endTime = session.endTime || new Date();
    const hours = differenceInMinutes(endTime, session.startTime) / 60;
    return hours > 0 ? Math.round(getTotalHands() / hours) : 0;
  };

  const getTotalNet = () => {
    return state.sessions.reduce((total, s) => {
      if (s.accountEnd && s.accountStart) {
        return total + (s.accountEnd - s.accountStart);
      }
      return total;
    }, 0);
  };

  const canEndSession = () => {
    return !!(session.handsStart && session.handsEnd && session.accountStart && session.accountEnd);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Poker Session Tracker
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Chip
          label={`Total Net: $${getTotalNet().toFixed(2)}`}
          color={getTotalNet() >= 0 ? 'success' : 'error'}
          sx={{ fontSize: '1.2rem', p: 2 }}
        />
      </Box>

      {/* Current Session Status */}
      {state.currentSession && state.currentSession.isActive && state.currentSession.startTime && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">
            Session Active - Started: {state.currentSession.startTime.toLocaleString()}
          </Typography>
          <Typography variant="body1">
            Duration: {getCurrentSessionDuration()}
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Hands Start"
                type="number"
                value={session.handsStart}
                onChange={(e) => setSession(prev => ({ ...prev, handsStart: parseInt(e.target.value) || 0 }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Hands End"
                type="number"
                value={session.handsEnd || ''}
                onChange={(e) => setSession(prev => ({ ...prev, handsEnd: parseInt(e.target.value) || undefined }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Total Hands"
                value={getTotalHands()}
                sx={{ minWidth: 150 }}
                disabled
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Limit</InputLabel>
                <Select
                  value={session.limit}
                  onChange={(e) => setSession(prev => ({ ...prev, limit: e.target.value }))}
                >
                  {state.stakes.map((stake) => (
                    <MenuItem key={stake.id} value={stake.name}>
                      {stake.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Format</InputLabel>
                <Select
                  value={session.format}
                  onChange={(e) => {
                    const format = e.target.value;
                    setSession(prev => ({ 
                      ...prev, 
                      format,
                      straddle: format === '8-max with ante'
                    }));
                  }}
                >
                  {state.formats.map((format) => (
                    <MenuItem key={format.id} value={format.name}>
                      {format.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={session.straddle}
                    onChange={(e) => setSession(prev => ({ ...prev, straddle: e.target.checked }))}
                  />
                }
                label="Straddle"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Account Start"
                type="number"
                value={session.accountStart}
                onChange={(e) => setSession(prev => ({ ...prev, accountStart: parseFloat(e.target.value) || 0 }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Account End"
                type="number"
                value={session.accountEnd || ''}
                onChange={(e) => setSession(prev => ({ ...prev, accountEnd: parseFloat(e.target.value) || undefined }))}
                sx={{ minWidth: 150 }}
              />
            </Box>

            {state.currentSession && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Hands Per Hour"
                  value={getHandsPerHour()}
                  sx={{ minWidth: 150 }}
                  disabled
                />
              </Box>
            )}

            {session.accountEnd && (
              <Typography
                variant="h6"
                color={getSessionNet() >= 0 ? 'success.main' : 'error.main'}
              >
                Session Net: ${getSessionNet().toFixed(2)}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {!isEditing ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartSession}
                  >
                    Start Session
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleSaveDefaults}
                    disabled={!session.limit || !session.format}
                  >
                    Save as Default
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleClearAllData}
                  >
                    Clear All Data
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={handleEndSession}
                    disabled={!canEndSession()}
                  >
                    End Session
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="medium"
                    onClick={handleClearSession}
                  >
                    Clear Session
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
}