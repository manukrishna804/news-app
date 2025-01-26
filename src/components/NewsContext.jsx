import React, { createContext, useContext, useState } from 'react';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [newsData, setNewsData] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  const updateNewsData = (data) => {
    setNewsData(data);
  };

  const selectNews = (news) => {
    setSelectedNews(news);
  };

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