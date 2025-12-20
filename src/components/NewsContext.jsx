import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [newsData, setNewsData] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  const updateNewsData = useCallback((data) => {
    setNewsData(data);
  }, []);

  const selectNews = useCallback((news) => {
    setSelectedNews(news);
  }, []);

  return (
    <NewsContext.Provider value={{
      newsData,
      selectedNews,
      updateNewsData,
      selectNews
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

NewsProvider.propTypes = {
  children: PropTypes.node.isRequired
};