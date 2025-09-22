import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import type { TableRating } from '../types';

export default function TableSelectionTab() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableRating | null>(null);
  const [formData, setFormData] = useState({
    tableName: '',
    rating: 0,
    notes: '',
    selectedPlayers: [] as string[],
  });

  const handleOpen = (table?: TableRating) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableName: table.tableName,
        rating: table.rating,
        notes: table.notes,
        selectedPlayers: table.players.map(p => p.id),
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableName: '',
        rating: 0,
        notes: '',
        selectedPlayers: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTable(null);
  };

  const handleSave = () => {
    const selectedPlayerObjects = state.players.filter(p => 
      formData.selectedPlayers.includes(p.id)
    );

    const tableData: TableRating = {
      id: editingTable?.id || Date.now().toString(),
      tableName: formData.tableName,
      players: selectedPlayerObjects,
      rating: formData.rating,
      notes: formData.notes,
    };

    // Note: You'd need to add ADD_TABLE_RATING and UPDATE_TABLE_RATING actions
    console.log('Save table rating:', tableData);
    handleClose();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4) return 'Excellent Table';
    if (rating >= 3) return 'Good Table';
    if (rating >= 2) return 'Average Table';
    return 'Poor Table';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Table Selection & Rating
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Rate Table
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {state.tableRatings.map((table) => (
          <Card key={table.id} sx={{ minWidth: 300, flex: '1 1 300px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{table.tableName}</Typography>
                <Chip
                  label={getRatingLabel(table.rating)}
                  color={getRatingColor(table.rating) as any}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={table.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({table.rating}/5)
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Players: {table.players.length}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {table.players.map((player) => (
                  <Chip
                    key={player.id}
                    label={player.name}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {table.notes && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {table.notes}
                </Typography>
              )}

              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpen(table)}
              >
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTable ? 'Edit Table Rating' : 'Rate New Table'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Table Name"
              value={formData.tableName}
              onChange={(e) => setFormData(prev => ({ ...prev, tableName: e.target.value }))}
              fullWidth
            />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Table Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={formData.rating}
                  onChange={(_, value) => setFormData(prev => ({ ...prev, rating: value || 0 }))}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {getRatingLabel(formData.rating)}
                </Typography>
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Select Players at Table</InputLabel>
              <Select
                multiple
                value={formData.selectedPlayers}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  selectedPlayers: e.target.value as string[] 
                }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const player = state.players.find(p => p.id === value);
                      return (
                        <Chip key={value} label={player?.name || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {state.players.map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: player.colorTag === 'green' ? '#4caf50' :
                                         player.colorTag === 'yellow' ? '#ff9800' :
                                         player.colorTag === 'red' ? '#f44336' :
                                         player.colorTag === 'cyan' ? '#00bcd4' : '#e91e63',
                          borderRadius: '50%',
                        }}
                      />
                      {player.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Table Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              placeholder="Notes about table dynamics, player behavior, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTable ? 'Update' : 'Save'} Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
