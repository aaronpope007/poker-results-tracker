# 🃏 Poker Results Tracker

A comprehensive Single Page Application (SPA) built with React, Material-UI, and TypeScript for poker players to track their sessions, analyze performance, manage player notes, and rate tables.

## ✨ Features

### 🎯 Session Tracking
- **Real-time session management** with start/stop functionality
- **Date and time tracking** with calendar widgets
- **Hand counting** with automatic calculation of total hands
- **Stake and format selection** (HU with ante, 8-max with ante)
- **Straddle tracking** (auto-enabled for 8-max, disabled for HU)
- **Account balance tracking** with automatic session net calculation
- **Session duration** and hands per hour calculations
- **Total net tracking** displayed prominently at the top

### 📊 Reporting & Analytics
- **Advanced filtering** by stake, format, and straddle
- **Comprehensive statistics**:
  - Total sessions and net profit/loss
  - Average net per session
  - Total hands played and hours logged
  - Hands per hour calculation
- **Session history table** with color-coded profit/loss
- **Export-ready data** for further analysis

### 👥 Player Notes Management
- **Color-coded player tagging system**:
  - 🟢 **Green**: General Fish
  - 🟡 **Yellow**: Solid Reg (may have leaks)
  - 🔴 **Red**: Excellent Reg
  - 🔵 **Cyan**: Passive Fish
  - 🟣 **Magenta**: Aggro Fish
- **Player statistics tracking**: Total hands, VPIP, PFR
- **Detailed notes and exploits** for each player
- **Full CRUD operations** (Create, Read, Update, Delete)

### 🎲 Table Selection & Rating
- **Table rating system** (1-5 stars) with visual indicators
- **Player selection** from your notes database
- **Table notes and observations**
- **Color-coded rating display** (Excellent/Good/Average/Poor)

### 🎨 User Experience
- **Dark/Light theme toggle** with persistence
- **Responsive design** that works on all devices
- **Real-time updates** and calculations
- **Data persistence** using localStorage
- **Modern Material-UI interface**

## 🚀 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the project directory
   cd poker-restults-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in your terminal)
   - The app will automatically reload when you make changes

### Build for Production

```bash
# Build the project for production
npm run build

# Preview the production build locally
npm run preview
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.1
- **UI Library**: Material-UI (MUI) v5
- **Language**: TypeScript
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Data Persistence**: localStorage

## 📱 Usage Guide

### Starting a Session
1. Navigate to the "Session Tracking" tab
2. Select your stake and format
3. Enter starting hands and account balance
4. Click "Start Session"
5. Update hands and balance as you play
6. Click "End Session" when finished

### Adding Player Notes
1. Go to the "Player Notes" tab
2. Click "Add Player"
3. Enter player name and select color tag
4. Add statistics (hands, VPIP, PFR)
5. Write notes and exploits
6. Save the player

### Viewing Reports
1. Switch to the "Reports" tab
2. Use filters to narrow down sessions
3. View summary statistics
4. Browse detailed session history

### Rating Tables
1. Open the "Table Selection" tab
2. Click "Rate Table"
3. Enter table name and rating
4. Select players from your notes
5. Add table observations

## 🎨 Theme Customization

The app includes a built-in theme toggle:
- **Dark Theme** (default): Easy on the eyes for long sessions
- **Light Theme**: Clean, bright interface
- **Toggle**: Click the sun/moon icon in the top-right corner
- **Persistence**: Your theme preference is automatically saved

## 💾 Data Storage

All data is stored locally in your browser using localStorage:
- **Sessions**: Complete session history
- **Players**: All player notes and statistics
- **Table Ratings**: Table observations and ratings
- **Settings**: Theme preferences and custom stakes/formats

## 🔧 Customization

### Adding New Stakes
The app comes with predefined stakes, but you can add custom ones by modifying the initial state in `src/context/AppContext.tsx`.

### Adding New Formats
Similar to stakes, you can add new game formats in the same context file.

### Modifying Color Tags
Player color tags can be customized in `src/components/NotesTab.tsx`.

## 📁 Project Structure

```
poker-restults-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── SessionTab.tsx   # Main session tracking
│   │   ├── ReportsTab.tsx   # Analytics and reporting
│   │   ├── NotesTab.tsx     # Player notes management
│   │   └── TableSelectionTab.tsx # Table rating
│   ├── context/
│   │   └── AppContext.tsx   # State management
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests for improvements

## 📄 License

This project is for personal use. Feel free to modify and adapt it for your own poker tracking needs.

## 🎯 Future Enhancements

Potential features for future versions:
- **Database integration** (Firebase, Supabase)
- **Data export** (CSV, PDF reports)
- **Advanced analytics** (graphs, trends)
- **Multi-player support** (team tracking)
- **Mobile app** (React Native)
- **AI-powered insights** (player analysis)

---

**Happy tracking and good luck at the tables! 🍀**