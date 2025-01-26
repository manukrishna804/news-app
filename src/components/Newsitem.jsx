import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import { useNews } from './NewsContext';

const Newsitem = ({ title, description, src, url }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const { searchArticles } = useFuzzySearch();
  const { selectNews } = useNews();

  const handleLawsArticlesClick = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      console.log('Laws/Articles clicked for:', title);
      setIsLoading(true);
      const { results, enhancedData } = await searchArticles(title);
      console.log('Search completed with results:', results);
     
      // Store the selected news in context
      selectNews({
        title,
        description,
        url,
        searchResults: results
      });

      // Get the analysis result
      const analysis = enhancedData?.enhanced || results[0]?.enhanced;
      if (analysis) {
        setAnalysisResult(analysis);
        setShowAnalysis(true);
      } else {
        console.error('No analysis found in results');
        setError('Failed to get legal analysis');
      }
    } catch (err) {
      console.error('Error in Laws/Articles click:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden m-4">
      <img 
        src={!imgError ? src : 'https://placehold.co/360x200/png?text=News'}
        className="w-full h-48 object-cover"
        alt={title}
        onError={() => setImgError(true)}
      />
      <div className="p-4">
        <h5 className="text-xl font-semibold mb-2 text-gray-800">
          {title ? title.slice(0, 50) + (title.length > 50 ? '...' : '') : 'No title available'}
        </h5>
        <p className="text-gray-600 mb-4">
          {description 
            ? description.slice(0, 90) + (description.length > 90 ? '...' : '')
            : "News current event. It is information about something that has just happened."}
        </p>
        <div className="flex flex-wrap gap-2">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Read More
          </a>
          <button 
            onClick={() => navigate(`/dashboard/chat/${encodeURIComponent(title)}`)}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          > 
            Discuss
          </button>
          <button 
            onClick={handleLawsArticlesClick}
            className={`inline-block px-4 py-2 rounded transition-colors ${
              isLoading 
                ? 'bg-purple-300 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
            disabled={isLoading}
          >
            <span className="flex items-center">
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Processing...' : 'Laws/Articles'}
            </span>
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Analysis Result Section */}
        {showAnalysis && analysisResult && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-purple-700">Legal Analysis</h4>
              <button 
                onClick={() => setShowAnalysis(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 text-sm">
                {analysisResult}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsitem;