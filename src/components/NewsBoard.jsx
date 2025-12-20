import { useEffect, useState } from "react";
import Newsitem from "./Newsitem";
import LoadingSpinner from "./LoadingSpinner";
import { useNews } from './NewsContext';
import { validateApiKey, handleApiError } from '../utils/apiUtils';
import PropTypes from 'prop-types';
import sampleNews from '../data/sampleNews.json';

export const NewsBoard = ({ category }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateNewsData } = useNews();

  useEffect(() => {
    const fetchNews = async () => {
      const CACHE_KEY = `news_cache_${category}`;
      const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

      const getCachedData = () => {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              return { data, isValid: true };
            }
            return { data, isValid: false };
          }
        } catch (e) {
          console.error('Cache parse error', e);
        }
        return null;
      };

      const cachedResult = getCachedData();

      // If we have valid cached data, use it immediately
      if (cachedResult && cachedResult.isValid) {
        console.log(`Using cached news for ${category}`);
        setArticles(cachedResult.data);
        updateNewsData(cachedResult.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Using NewsData.io API for Indian news
        const newsdataApiKey = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_53401fdabd844adda42f7fad7f197ae6'; // Fallback to old key if env missing
        // Map React categories to NewsData.io categories
        const categoryMap = {
          general: '', // NewsData.io returns all if category is empty
          business: 'business',
          technology: 'technology',
          sports: 'sports',
          entertainment: 'entertainment',
          health: 'health',
          science: 'science',
          world: 'world',
          nation: 'national',
        };
        const newsdataCategory = categoryMap[category] || '';
        let url = `https://newsdata.io/api/1/news?country=in&language=en&apikey=${newsdataApiKey}`;
        if (newsdataCategory) {
          url += `&category=${newsdataCategory}`;
        }
        console.log('Fetching news from server:', url);
        const response = await fetch(url);

        if (!response.ok) {
          // If rate limited (429) or other error, try to fallback to stale cache
          // Force cache clear if we suspect it's broken
          if (response.status === 429) {
            console.warn("429 Error - API Limit Reached");
          }

          if (cachedResult && cachedResult.data && cachedResult.data.length > 0) {
            console.warn(`API Error ${response.status}. Falling back to stale cache.`);
            setArticles(cachedResult.data);
            updateNewsData(cachedResult.data);
            setError(null);
            return;
          }
          throw new Error(`Failed to fetch news: ${response.status}`);
        }

        const data = await response.json();
        console.log('NewsData.io API response:', data);

        if (!data.results) {
          throw new Error('No articles found in NewsData.io API response');
        }

        const newsResults = data.results || [];
        setArticles(newsResults);
        updateNewsData(newsResults); // Store in context

        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: newsResults
        }));

        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);

        // Final fallback attempt
        if (cachedResult && cachedResult.data) {
          console.warn('Network error. Falling back to stale cache.', err);
          setArticles(cachedResult.data);
          updateNewsData(cachedResult.data);
          setError(null);
        } else {
          // If no cache, use sample data
          console.warn('No cache available. Using sample data.');
          setArticles(sampleNews);
          updateNewsData(sampleNews);
          setError(null);
          // Optional: You could set a specific state to show a "Offline Mode" banner
        }
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

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-600"
        >
          Reset / Clear Cache
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles && articles.length > 0 ? (
          articles.map((news, index) => (
            <div key={index}>
              <Newsitem
                title={news.title}
                description={news.description}
                src={news.image_url}
                url={news.link}
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