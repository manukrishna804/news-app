import { useEffect, useState } from "react";
import Newsitem from "./Newsitem";
import { useNews } from './NewsContext';

export const NewsBoard = ({category}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateNewsData } = useNews();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${import.meta.env.VITE_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setArticles(data.articles);
        updateNewsData(data.articles); // Store in context
        setError(null);
      } catch (err) {
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, updateNewsData]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
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

export default NewsBoard;