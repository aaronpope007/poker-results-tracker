import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Tabs, Tab, Box, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AppProvider } from './context/AppContext';
import SessionTab from './components/SessionTab';
import ReportsTab from './components/ReportsTab';
import NotesTab from './components/NotesTab';
import TableSelectionTab from './components/TableSelectionTab';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved theme preference, default to dark
    const saved = localStorage.getItem('poker-tracker-theme');
    return saved ? saved === 'dark' : true;
  });

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('poker-tracker-theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Poker Results Tracker
              </Typography>
              <IconButton color="inherit" onClick={toggleTheme}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="poker tracker tabs">
              <Tab label="Session Tracking" />
              <Tab label="Reports" />
              <Tab label="Player Notes" />
              <Tab label="Table Selection" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <SessionTab />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <ReportsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <NotesTab />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <TableSelectionTab />
          </TabPanel>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;