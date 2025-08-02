import { useEffect, useState } from "react";
import Newsitem from "./Newsitem";
import LoadingSpinner from "./LoadingSpinner";
import { useNews } from './NewsContext';
import { validateApiKey, handleApiError } from '../utils/apiUtils';
import PropTypes from 'prop-types';

export const NewsBoard = ({category}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateNewsData } = useNews();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = import.meta.env.VITE_API_KEY;
        
        // Temporarily use a mock API key for development
        const mockApiKey = 'demo_key_for_development';
        const finalApiKey = apiKey && apiKey !== 'your_news_api_key_here' ? apiKey : mockApiKey;
        
        validateApiKey(finalApiKey, 'News');

        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${finalApiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
          } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
          } else {
            throw new Error(`Failed to fetch news: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
          throw new Error(data.message || 'News API error');
        }
        
        setArticles(data.articles || []);
        updateNewsData(data.articles || []); // Store in context
        setError(null);
              } catch (err) {
          console.error('Error fetching news:', err);
          setError(handleApiError(err, 'Failed to fetch news'));
          setArticles([]);
        } finally {
          setLoading(false);
        }
    };

    fetchNews();
  }, [category, updateNewsData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="large" text="Loading news..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl text-red-600 mb-4">Error Loading News</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Latest <span className="text-red-500">{category.toUpperCase()}</span> News
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles && articles.length > 0 ? (
          articles.map((news, index) => (
            <div key={index}>
              <Newsitem 
                title={news.title} 
                description={news.description} 
                src={news.urlToImage} 
                url={news.url}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">No articles found</div>
        )}
      </div>
    </div>
  );
};

NewsBoard.propTypes = {
  category: PropTypes.string.isRequired
};

export default NewsBoard;