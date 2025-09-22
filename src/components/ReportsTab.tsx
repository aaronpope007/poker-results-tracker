import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Session } from '../types';

export default function ReportsTab() {
  const { state, dispatch } = useApp();
  const [filters, setFilters] = useState(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('poker-tracker-filters');
    return saved ? JSON.parse(saved) : {
      stake: '',
      format: '',
      straddle: '',
    };
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    handsStart: 0,
    handsEnd: 0,
    limit: '',
    format: '',
    straddle: false,
    accountStart: 0,
    accountEnd: 0,
  });

  const filteredSessions = useMemo(() => {
    return state.sessions.filter(session => {
      if (filters.stake && !session.limit.includes(filters.stake)) return false;
      if (filters.format && session.format !== filters.format) return false;
      if (filters.straddle !== '') {
        const straddleFilter = filters.straddle === 'true';
        if (session.straddle !== straddleFilter) return false;
      }
      return true;
    });
  }, [state.sessions, filters]);

  const getSessionStats = () => {
    const completedSessions = filteredSessions.filter(s => s.accountEnd && s.accountStart);
    const totalSessions = completedSessions.length;
    const totalNet = completedSessions.reduce((sum, s) => sum + (s.accountEnd! - s.accountStart!), 0);
    const totalHands = completedSessions.reduce((sum, s) => sum + (s.handsEnd! - s.handsStart), 0);
    const totalHours = completedSessions.reduce((sum, s) => {
      if (s.endTime && s.startTime) {
        return sum + (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    return {
      totalSessions,
      totalNet,
      totalHands,
      totalHours,
      avgNetPerSession: totalSessions > 0 ? totalNet / totalSessions : 0,
      handsPerHour: totalHours > 0 ? totalHands / totalHours : 0,
    };
  };

  const stats = getSessionStats();

  const clearFilters = () => {
    const newFilters = { stake: '', format: '', straddle: '' };
    setFilters(newFilters);
    localStorage.setItem('poker-tracker-filters', JSON.stringify(newFilters));
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    localStorage.setItem('poker-tracker-filters', JSON.stringify(newFilters));
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setEditFormData({
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime || new Date(),
      handsStart: session.handsStart,
      handsEnd: session.handsEnd || 0,
      limit: session.limit,
      format: session.format,
      straddle: session.straddle,
      accountStart: session.accountStart,
      accountEnd: session.accountEnd || 0,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      dispatch({ type: 'DELETE_SESSION', payload: sessionId });
    }
  };

  const handleSaveEdit = () => {
    if (!editingSession) return;
    
    const updatedSession: Session = {
      ...editingSession,
      date: editFormData.date,
      startTime: editFormData.startTime,
      endTime: editFormData.endTime,
      handsStart: editFormData.handsStart,
      handsEnd: editFormData.handsEnd,
      limit: editFormData.limit,
      format: editFormData.format,
      straddle: editFormData.straddle,
      accountStart: editFormData.accountStart,
      accountEnd: editFormData.accountEnd,
    };
    
    dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
    setEditDialogOpen(false);
    setEditingSession(null);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingSession(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Session Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Stake</InputLabel>
            <Select
              value={filters.stake}
              onChange={(e) => updateFilters({ ...filters, stake: e.target.value })}
            >
              <MenuItem value="">All Stakes</MenuItem>
              {Array.from(new Set(state.sessions.map(s => s.limit))).map(stake => (
                <MenuItem key={stake} value={stake}>{stake}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={filters.format}
              onChange={(e) => updateFilters({ ...filters, format: e.target.value })}
            >
              <MenuItem value="">All Formats</MenuItem>
              {Array.from(new Set(state.sessions.map(s => s.format))).map(format => (
                <MenuItem key={format} value={format}>{format}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Straddle</InputLabel>
            <Select
              value={filters.straddle}
              onChange={(e) => updateFilters({ ...filters, straddle: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={clearFilters} variant="outlined">
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
            <Typography variant="h6">{stats.totalSessions}</Typography>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Total Net</Typography>
            <Typography 
              variant="h6" 
              color={stats.totalNet >= 0 ? 'success.main' : 'error.main'}
            >
              ${stats.totalNet.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Avg Net/Session</Typography>
            <Typography 
              variant="h6" 
              color={stats.avgNetPerSession >= 0 ? 'success.main' : 'error.main'}
            >
              ${stats.avgNetPerSession.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Total Hands</Typography>
            <Typography variant="h6">{stats.totalHands}</Typography>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Total Hours</Typography>
            <Typography variant="h6">{stats.totalHours.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">Hands/Hour</Typography>
            <Typography variant="h6">{stats.handsPerHour.toFixed(1)}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Stake</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Straddle</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Hands</TableCell>
                <TableCell>Net</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSessions.map((session) => {
                const duration = session.endTime && session.startTime 
                  ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60) * 10) / 10}h`
                  : 'Active';
                const hands = session.handsEnd && session.handsStart 
                  ? session.handsEnd - session.handsStart 
                  : '-';
                const net = session.accountEnd && session.accountStart 
                  ? session.accountEnd - session.accountStart 
                  : '-';

                return (
                  <TableRow key={session.id}>
                    <TableCell>{format(session.date, 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{session.limit}</TableCell>
                    <TableCell>{session.format}</TableCell>
                    <TableCell>
                      <Chip 
                        label={session.straddle ? 'Yes' : 'No'} 
                        color={session.straddle ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell>{hands}</TableCell>
                    <TableCell>
                      {typeof net === 'number' ? (
                        <Typography 
                          color={net >= 0 ? 'success.main' : 'error.main'}
                        >
                          ${net.toFixed(2)}
                        </Typography>
                      ) : (
                        net
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEditSession(session)} 
                        size="small"
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteSession(session.id)} 
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Session Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Date"
                type="date"
                value={editFormData.date.toISOString().split('T')[0]}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  date: new Date(e.target.value) 
                }))}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={editFormData.startTime.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(editFormData.startTime);
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setEditFormData(prev => ({ ...prev, startTime: newTime }));
                }}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={editFormData.endTime.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(editFormData.endTime);
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setEditFormData(prev => ({ ...prev, endTime: newTime }));
                }}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Hands Start"
                type="number"
                value={editFormData.handsStart}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  handsStart: parseInt(e.target.value) || 0 
                }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Hands End"
                type="number"
                value={editFormData.handsEnd}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  handsEnd: parseInt(e.target.value) || 0 
                }))}
                sx={{ minWidth: 150 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Limit</InputLabel>
                <Select
                  value={editFormData.limit}
                  onChange={(e) => setEditFormData(prev => ({ 
                    ...prev, 
                    limit: e.target.value 
                  }))}
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
                  value={editFormData.format}
                  onChange={(e) => setEditFormData(prev => ({ 
                    ...prev, 
                    format: e.target.value 
                  }))}
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
                    checked={editFormData.straddle}
                    onChange={(e) => setEditFormData(prev => ({ 
                      ...prev, 
                      straddle: e.target.checked 
                    }))}
                  />
                }
                label="Straddle"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Account Start"
                type="number"
                value={editFormData.accountStart}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  accountStart: parseFloat(e.target.value) || 0 
                }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Account End"
                type="number"
                value={editFormData.accountEnd}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  accountEnd: parseFloat(e.target.value) || 0 
                }))}
                sx={{ minWidth: 150 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
