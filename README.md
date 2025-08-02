# Ecosphere - News Analysis Platform

A modern news analysis platform that combines real-time news with AI-powered legal analysis and interactive chat features.

## Features

- 🔐 **Secure Authentication** - Firebase-based user authentication
- 📰 **Real-time News** - Latest news from multiple categories
- 🤖 **AI Legal Analysis** - Google Gemini-powered legal insights
- 💬 **Interactive Chat** - Real-time discussion rooms for news topics
- 🔍 **Smart Search** - Fuzzy search with legal article matching
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: Google Gemini AI
- **News API**: NewsAPI.org
- **Search**: Fuse.js for fuzzy search

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- News API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echosphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env` and fill in your API keys:
   ```bash
   cp env.example .env
   ```

   Required environment variables:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # News API
   VITE_API_KEY=your_news_api_key

   # Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Project Structure

```
echosphere/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.jsx      # Navigation component
│   │   ├── NewsBoard.jsx   # News display
│   │   ├── ChatRoom.jsx    # Chat functionality
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── firebaseConfig.js   # Firebase configuration
│   └── main.jsx           # App entry point
├── public/
│   ├── csv/               # Legal articles data
│   └── images/            # Static images
└── components/            # Landing page components
```

## API Setup

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your configuration from Project Settings

### News API Setup
1. Sign up at [NewsAPI.org](https://newsapi.org)
2. Get your API key
3. Add to environment variables

### Google Gemini Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to environment variables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
