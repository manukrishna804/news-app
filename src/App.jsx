import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NewsBoard from './components/NewsBoard';
import ChatRoom from './components/ChatRoom';
import SearchResults from './components/SearchResults';
import { NewsProvider } from './components/NewsContext';

function App() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("general");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (user === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
