import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NewsBoard from './components/NewsBoard';
import ChatRoom from './components/ChatRoom';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import { NewsProvider } from './components/NewsContext';

function App() {
  const [, setUser] = useState(null);
  const [category, setCategory] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Temporarily bypass Firebase authentication for development
    setIsLoading(false);
    setError(null);
    
    // Uncomment this when Firebase is properly configured:
    /*
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          setError(null);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
    */
  }, [navigate]);

  const handleLogout = async () => {
    // Temporarily bypass Firebase logout for development
    navigate('/');
    
    // Uncomment this when Firebase is properly configured:
    /*
    try {
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
    }
    */
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <NewsProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-end p-4">
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        <Navbar setCategory={setCategory} />
        <Routes>
          <Route path="/" element={<NewsBoard category={category} />} />
          <Route path="/dashboard/*">
            <Route index element={<NewsBoard category={category} />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="chat/:newsTitle" element={<ChatRoom />} />
          </Route>
        </Routes>
      </div>
    </NewsProvider>
  );
}

export default App;
