import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Navbar from './components/Navbar';
import NewsBoard from './components/NewsBoard';
import ChatRoom from './components/ChatRoom';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import { NewsProvider } from './components/NewsContext';
import Home from './components/Home';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("general");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
      // Redirect to dashboard if logged in and on home or login page
      if (currentUser && (location.pathname === '/' || location.pathname === '/login')) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" text="Initializing..." />
      </div>
    );
  }

  // Show navbar only on dashboard routes
  const showNavbar = location.pathname.startsWith('/dashboard');

  return (
    <NewsProvider>
      <div className="min-h-screen bg-gray-100">
        {showNavbar && (
          <>
            <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-white border-b border-gray-700">
              <div className="font-bold text-lg">Ecosphere</div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300 hidden sm:block">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            <Navbar setCategory={setCategory} />
          </>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={user ? <NewsBoard category={category} /> : <Navigate to="/login" />} />
          <Route path="/dashboard/search" element={user ? <SearchResults /> : <Navigate to="/login" />} />
          <Route path="/dashboard/chat/:newsTitle" element={user ? <ChatRoom /> : <Navigate to="/login" />} />
          <Route path="/dashboard/chat" element={user ? <ChatRoom /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </NewsProvider>
  );
}

export default App;
