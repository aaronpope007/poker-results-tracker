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
    startTime: new Date(),
    endTime: new Date(),
    handsStart: 0,
    limit: '',
    format: 'HU with ante',
    straddle: false,
    accountStart: 0,
    isActive: false,
  });

  // Load default settings
  useEffect(() => {
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
  }, []);

  const handleSubmitSession = () => {
    if (!session.handsStart || !session.handsEnd || !session.accountStart || !session.accountEnd) {
      alert('Please fill in all required fields (Hands Start, Hands End, Account Start, Account End)');
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      date: session.startTime || new Date(),
      startTime: session.startTime || new Date(),
      endTime: session.endTime || new Date(),
      handsStart: session.handsStart,
      handsEnd: session.handsEnd,
      limit: session.limit || '',
      format: session.format || 'HU with ante',
      straddle: session.straddle || false,
      accountStart: session.accountStart,
      accountEnd: session.accountEnd,
      isActive: false,
    };
    
    dispatch({ type: 'ADD_SESSION', payload: newSession });
    
    // Clear the session form but keep limit and format
    setSession(prev => ({
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      handsStart: 0,
      limit: prev.limit,
      format: prev.format,
      straddle: false,
      accountStart: 0,
      isActive: false,
    }));
    
    alert('Session submitted successfully!');
  };

  const handleSaveDefaults = () => {
    const defaultSettings = {
      limit: session.limit,
      format: session.format,
    };
    localStorage.setItem('poker-default-settings', JSON.stringify(defaultSettings));
    alert('Default settings saved!');
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('poker-tracker-data');
      localStorage.removeItem('poker-default-settings');
      window.location.reload();
    }
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
    if (!session.startTime || !session.endTime || !session.handsEnd) return 0;
    const hours = differenceInMinutes(session.endTime, session.startTime) / 60;
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

  const canSubmitSession = () => {
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


      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Date"
                type="date"
                value={session.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                onChange={(e) => setSession(prev => ({ ...prev, date: new Date(e.target.value) }))}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={session.startTime?.toTimeString().slice(0, 5) || new Date().toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(session.startTime || new Date());
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setSession(prev => ({ ...prev, startTime: newTime }));
                }}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={session.endTime?.toTimeString().slice(0, 5) || new Date().toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(session.endTime || new Date());
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setSession(prev => ({ ...prev, endTime: newTime }));
                }}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
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

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Hands Per Hour"
                value={getHandsPerHour()}
                sx={{ minWidth: 150 }}
                disabled
              />
            </Box>

            {session.accountEnd && (
              <Typography
                variant="h6"
                color={getSessionNet() >= 0 ? 'success.main' : 'error.main'}
              >
                Session Net: ${getSessionNet().toFixed(2)}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmitSession}
                disabled={!canSubmitSession()}
              >
                Submit Session
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
            </Box>
          </Box>
        </Paper>
      </Box>
    );
}