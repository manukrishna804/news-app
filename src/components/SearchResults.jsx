import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFuzzySearch } from '../hooks/useFuzzySearch';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log('SearchResults: Location state:', location.state);
  
  const [searchData, setSearchData] = useState(null);
  const { loading, error } = useFuzzySearch();

  useEffect(() => {
    if (location.state) {
      console.log('Setting search data:', location.state);
      setSearchData(location.state);
    } else {
      console.log('No location state, redirecting');
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!searchData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-600">Loading results...</h2>
        </div>
      </div>
    );
  }

  const { results, currentNewsTitle, enhancedArticle, isGeneratedAnalysis } = searchData;

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Legal Analysis & Related Articles</h2>
          {currentNewsTitle && (
            <p className="text-gray-600 mt-1">For: {currentNewsTitle}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to News
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini Analysis Section */}
        {enhancedArticle && (
          <div className="lg:col-span-2 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-200">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">
                Legal Analysis by AI
              </h3>
              <div className="prose max-w-none">
                {/* Format the Gemini response which is in enhancedArticle.enhanced */}
                <div className="whitespace-pre-wrap text-gray-700">
                  {enhancedArticle.enhanced}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Articles Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">
            {isGeneratedAnalysis 
              ? 'AI-Generated Legal Analysis' 
              : 'Related Legal Articles'}
          </h3>
          {results.map((article, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg shadow-sm ${
                article.isGenerated ? 'bg-purple-50' : 'hover:shadow-md transition-shadow'
              } ${article.isProcessed ? 'border-green-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                <div className="flex flex-col items-end">
                  {!article.isGenerated && (
                    <span className="text-sm text-gray-500">
                      Match: {((1 - article.matchScore) * 100).toFixed(1)}%
                    </span>
                  )}
                  {article.isProcessed && (
                    <span className="text-xs text-green-500">
                      {article.isGenerated ? 'AI Analysis' : 'Analyzed'}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 line-clamp-2">
                {article.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
