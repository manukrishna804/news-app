import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import "./index.css";

// Import ChatRoom component
import ChatRoom from "./components/ChatRoom";
// Import SearchResults component
import SearchResults from "./components/SearchResults";
// Import fuzzy search hook
import { useFuzzySearch } from "./hooks/useFuzzySearch";

// Simple Home Component
function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem' 
        }}>
          Ecosphere
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          Amplifying Voices, Defining News
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Login Here
        </button>
      </div>
    </div>
  );
}

// Login Component with Real Firebase Authentication
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = '/dashboard';
    } catch (error) {
      const errorMap = {
        "auth/email-already-in-use": "Email already registered",
        "auth/invalid-email": "Invalid email format",
        "auth/user-not-found": "Invalid email or password",
        "auth/wrong-password": "Invalid email or password",
        "auth/too-many-requests": "Too many attempts. Try later",
        "auth/weak-password": "Password is too weak. Please choose a stronger password"
      };
      setError(errorMap[error.code] || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isRegistering ? "Create Account" : "Login"}
        </h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '0.25rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem'
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem'
            }}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? "Processing..." : (isRegistering ? "Sign Up" : "Login")}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegistering ? "Login Instead" : "Create Account"}
          </button>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/" style={{ color: '#3b82f6' }}>Back to Home</a>
        </p>
      </div>
    </div>
  );
}

// Enhanced Dashboard Component with News, Chat, and Constitution Integration
function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [newsCategory, setNewsCategory] = useState('general');
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('news'); // 'news' or 'chat'
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Get current user
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe();
  }, []);

  // Fetch news articles
  const fetchNews = async (category) => {
    setLoading(true);
    setError("");
    
    try {
      const apiKey = import.meta.env.VITE_API_KEY || '5e89abebd44c414184e950deaf6f2c4e';
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch news');
      }
      
      setNewsArticles(data.articles || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
      setNewsArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load news when category changes
  React.useEffect(() => {
    fetchNews(newsCategory);
  }, [newsCategory]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle article click for chat
  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setActiveTab('chat');
  };

  // Handle constitution search
  const handleConstitutionSearch = (article) => {
    // Navigate to search results with article data
    window.location.href = `/search?title=${encodeURIComponent(article.title)}&content=${encodeURIComponent(article.description || '')}`;
  };

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6' 
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
          Ecosphere Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser && (
            <span style={{ color: '#6b7280' }}>
              Welcome, {currentUser.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setActiveTab('news')}
            style={{
              backgroundColor: activeTab === 'news' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'news' ? 'white' : '#374151',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            📰 News
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              backgroundColor: activeTab === 'chat' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'chat' ? 'white' : '#374151',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            💬 Chat
          </button>
        </div>

        {/* Category Navigation (only show for news tab) */}
        {activeTab === 'news' && (
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            flexWrap: 'wrap' 
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setNewsCategory(category.id)}
                style={{
                  backgroundColor: newsCategory === category.id ? '#3b82f6' : '#f3f4f6',
                  color: newsCategory === category.id ? 'white' : '#374151',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ padding: '2rem' }}>
        {activeTab === 'news' ? (
          // News Content
          loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                Loading {newsCategory} news...
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>
              <button
                onClick={() => fetchNews(newsCategory)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {newsArticles.map((article, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onClick={() => handleArticleClick(article)}
                >
                  {article.urlToImage && (
                    <img 
                      src={article.urlToImage} 
                      alt={article.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: '#1f2937'
                    }}>
                      {article.title}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {article.description}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#9ca3af' 
                      }}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(article.url, '_blank');
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Read More
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArticleClick(article);
                          }}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConstitutionSearch(article);
                          }}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          📜 Constitution
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Chat Content
          <div style={{ height: 'calc(100vh - 300px)' }}>
            {selectedArticle ? (
              <ChatRoom newsTitle={selectedArticle.title || 'General Chat'} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                  Welcome to Chat!
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Click on any news article and then click the "💬 Chat" button to start discussing that article with other users.
                </p>
                <button
                  onClick={() => setActiveTab('news')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Browse News
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
