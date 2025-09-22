import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInMinutes } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Session } from '../types';

export default function SessionTab() {
  const { state, dispatch } = useApp();
  const [session, setSession] = useState<Partial<Session>>({
    date: new Date(),
    startTime: new Date(),
    endTime: undefined,
    handsStart: 0,
    limit: '',
    format: 'HU with ante',
    straddle: false,
    accountStart: 0,
    isActive: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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
    const newSession: Session = {
      id: Date.now().toString(),
      date: session.date || new Date(),
      startTime: session.startTime || new Date(),
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
  };

  const handleEndSession = () => {
    if (!state.currentSession) return;
    
    const updatedSession: Session = {
      ...state.currentSession,
      endTime: session.endTime || new Date(),
      handsEnd: session.handsEnd,
      accountEnd: session.accountEnd,
      isActive: false,
    };
    
    dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
    setIsEditing(false);
  };

  const handleStartNewSession = () => {
    // Reset form to default values
    setSession({
      date: new Date(),
      startTime: new Date(),
      endTime: undefined,
      handsStart: 0,
      limit: '',
      format: 'HU with ante',
      straddle: false,
      accountStart: 0,
      isActive: true,
    });
    setIsEditing(false);
    
    // Clear current session if any
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
  };

  const getSessionDuration = () => {
    if (!session.startTime) return '0h 0m';
    const endTime = session.endTime || new Date();
    const minutes = differenceInMinutes(endTime, session.startTime);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 200 }}>
                <DateTimePicker
                  label="Start Time"
                  value={session.startTime}
                  onChange={(time) => setSession(prev => ({ ...prev, startTime: time || new Date() }))}
                  slotProps={{ textField: { fullWidth: true } }}
                  minutesStep={1}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <DateTimePicker
                  label="End Time"
                  value={session.endTime}
                  onChange={(time) => setSession(prev => ({ ...prev, endTime: time || undefined }))}
                  slotProps={{ textField: { fullWidth: true } }}
                  disabled={!isEditing}
                  minutesStep={1}
                />
              </Box>
            </Box>

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
                  label="Session Duration"
                  value={getSessionDuration()}
                  sx={{ minWidth: 150 }}
                  disabled
                />
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

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {!isEditing ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartSession}
                    disabled={!session.limit}
                  >
                    Start Session
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleStartNewSession}
                  >
                    Start New Session
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleEndSession}
                  disabled={!session.handsEnd || !session.accountEnd}
                >
                  End Session
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}