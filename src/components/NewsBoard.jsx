import { useEffect, useState } from "react";
import Newsitem from "./Newsitem";
import LoadingSpinner from "./LoadingSpinner";
import { useNews } from './NewsContext';
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
        setArticles(cachedResult.data);
        updateNewsData(cachedResult.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const newsdataApiKey = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_53401fdabd844adda42f7fad7f197ae6';
        const categoryMap = {
          general: '',
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

        const response = await fetch(url);

        if (!response.ok) {
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

        if (!data.results) {
          throw new Error('No articles found in response');
        }

        const newsResults = data.results || [];
        setArticles(newsResults);
        updateNewsData(newsResults);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: newsResults
        }));

        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);

        if (cachedResult && cachedResult.data) {
          setArticles(cachedResult.data);
          updateNewsData(cachedResult.data);
          setError(null);
        } else {
          console.warn('Using sample data.');
          setArticles(sampleNews);
          updateNewsData(sampleNews);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, updateNewsData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text={`Curating ${category} news...`} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-8">
        <div className="text-red-500 mb-4 bg-red-100 p-4 rounded-full">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Could Not Load News</h2>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            Top Headlines
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 capitalize">
              {category === 'general' ? 'Latest Stories' : category}
            </span>
          </h2>
        </div>

        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="mt-4 md:mt-0 text-sm text-gray-500 hover:text-blue-600 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {articles.map((news, index) => (
          <Newsitem
            key={news.article_id || index}
            title={news.title}
            description={news.description}
            src={news.image_url}
            url={news.link}
            source={news.source_id}
            date={news.pubDate}
          />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles found in this category right now.</p>
        </div>
      )}
    </div>
  );
};

NewsBoard.propTypes = {
  category: PropTypes.string.isRequired
};

export default NewsBoard;