# Ecosphere 🌍

> **Where News Meets Intelligence.**
> A next-generation news analysis platform combining real-time global reporting with AI-powered insights and community discussion.

![Project Status](https://img.shields.io/badge/Status-Active_Development-success)
![License](https://img.shields.io/badge/License-MIT-blue)

Ecosphere goes beyond simple news aggregation. It integrates **Google Gemini AI** to provide legal and contextual analysis of current events, allowing users to understand not just *what* happened, but *why* it matters. Complete with real-time, secure chat rooms for every story.

---

## ✨ Key Features

### 📰 Intelligent News Feed
- **Real-time Aggregation**: Fetches breaking news from global sources via NewsAPI.
- **Smart Categorization**: seamless switching between Politics, Technology, Health, and Sports.

### 🤖 AI-Powered Analysis (Gemini)
- **Legal Insights**: Automatically analyzes news articles for legal implications.
- **Fact Contextualization**: Uses GenAI to provide background context often missing from headlines.

### 💬 Secure, Real-Time Community
- **Topic-Based Chat Rooms**: Every news article spawns its own dedicated discussion room.
- **Robust Security**: Fully authenticated environments using Firebase Auth.
- **Diagnostics**: Built-in connection health and permission monitoring for seamless UX.

### 🔍 Advanced Search
- **Fuzzy Search logic**: Powered by `Fuse.js` to find relevant articles even with typos.
- **Archive Access**: Search through historical data and legal CSV archives.

---

## 🛠️ Tech Stack

**Frontend**
- ![React](https://img.shields.io/badge/-React_18-61DAFB?logo=react&logoColor=black) **React**: Core UI library.
- ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) **Vite**: Ultra-fast build tool.
- ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Tailwind CSS**: Modern styling engine.

**Backend & Services**
- ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=black) **Firebase**: Auth, Firestore Database, and Hosting.
- ![Gemini](https://img.shields.io/badge/-Google_Gemini-8E75B2?logo=google&logoColor=white) **Google Gemini API**: Artificial Intelligence engine.
- **NewsAPI**: External data provider.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Firebase Project (Free tier works)
- API Keys for: NewsAPI, Google Gemini.

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/manukrishna804/news-app.git
    cd echosphere
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    # Firebase
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_domain
    VITE_FIREBASE_PROJECT_ID=your_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
    VITE_FIREBASE_APP_ID=your_app_id
    
    # APIs
    VITE_API_KEY=your_newsapi_key
    VITE_GEMINI_API_KEY=your_gemini_key
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:5173`

---

## 🛡️ Troubleshooting

### Chat Room "Access Denied"
If you see a red "Access Denied" error in the chat:
1.  Go to your **Firebase Console** -> **Firestore** -> **Rules**.
2.  Ensure your rules allow authenticated users to read/write:
    ```javascript
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    ```

---

## 📂 Project Structure

```
echosphere/
├── src/
│   ├── components/         # Core React Components (ChatRoom, NewsBoard, etc.)
│   ├── hooks/              # Custom debugging & logic hooks
│   ├── data/               # Static datasets
│   └── App.jsx             # Main Routing & Layout
├── public/
│   └── csv/                # Dataset for AI legal training/context
└── firebaseConfig.js       # App initialization
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
