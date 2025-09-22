import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import type { Player, ColorTag } from '../types';

const colorTagOptions: { value: ColorTag; label: string; color: string }[] = [
  { value: 'green', label: 'General Fish', color: '#4caf50' },
  { value: 'yellow', label: 'Solid Reg', color: '#ff9800' },
  { value: 'red', label: 'Excellent Reg', color: '#f44336' },
  { value: 'cyan', label: 'Passive Fish', color: '#00bcd4' },
  { value: 'magenta', label: 'Aggro Fish', color: '#e91e63' },
];

export default function NotesTab() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    colorTag: 'green' as ColorTag,
    totalHands: 0,
    vpip: 0,
    pfr: 0,
    note: '',
    exploits: '',
  });

  const handleOpen = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        colorTag: player.colorTag,
        totalHands: player.totalHands,
        vpip: player.vpip,
        pfr: player.pfr,
        note: player.note,
        exploits: player.exploits,
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        colorTag: 'green',
        totalHands: 0,
        vpip: 0,
        pfr: 0,
        note: '',
        exploits: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPlayer(null);
  };

  const handleSave = () => {
    const playerData: Player = {
      id: editingPlayer?.id || Date.now().toString(),
      name: formData.name,
      colorTag: formData.colorTag,
      totalHands: formData.totalHands,
      vpip: formData.vpip,
      pfr: formData.pfr,
      note: formData.note,
      exploits: formData.exploits,
    };

    if (editingPlayer) {
      dispatch({ type: 'UPDATE_PLAYER', payload: playerData });
    } else {
      dispatch({ type: 'ADD_PLAYER', payload: playerData });
    }

    handleClose();
  };

  const handleDelete = (playerId: string) => {
    // Note: You'd need to add a DELETE_PLAYER action to the reducer
    console.log('Delete player:', playerId);
  };

  const getColorTagInfo = (colorTag: ColorTag) => {
    return colorTagOptions.find(option => option.value === colorTag) || colorTagOptions[0];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Player Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Player
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Hands</TableCell>
                <TableCell>VPIP</TableCell>
                <TableCell>PFR</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.players.map((player) => {
                const tagInfo = getColorTagInfo(player.colorTag);
                return (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={tagInfo.label}
                        sx={{ backgroundColor: tagInfo.color, color: 'white' }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{player.totalHands}</TableCell>
                    <TableCell>{player.vpip}%</TableCell>
                    <TableCell>{player.pfr}%</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {player.note}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpen(player)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(player.id)} size="small">
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Player Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                sx={{ minWidth: 200, flex: 1 }}
              />
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Color Tag</InputLabel>
                <Select
                  value={formData.colorTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorTag: e.target.value as ColorTag }))}
                >
                  {colorTagOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: option.color,
                            borderRadius: '50%',
                          }}
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Total Hands"
                type="number"
                value={formData.totalHands}
                onChange={(e) => setFormData(prev => ({ ...prev, totalHands: parseInt(e.target.value) || 0 }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="VPIP (%)"
                type="number"
                value={formData.vpip}
                onChange={(e) => setFormData(prev => ({ ...prev, vpip: parseFloat(e.target.value) || 0 }))}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="PFR (%)"
                type="number"
                value={formData.pfr}
                onChange={(e) => setFormData(prev => ({ ...prev, pfr: parseFloat(e.target.value) || 0 }))}
                sx={{ minWidth: 150 }}
              />
            </Box>
            <TextField
              label="Note"
              multiline
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Exploits vs Them"
              multiline
              rows={3}
              value={formData.exploits}
              onChange={(e) => setFormData(prev => ({ ...prev, exploits: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingPlayer ? 'Update' : 'Add'} Player
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
