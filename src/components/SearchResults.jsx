import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import Papa from 'papaparse';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [fuse, setFuse] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Function to extract article number from article_id
  const extractArticleNumber = (articleId) => {
    const match = articleId.match(/Article (\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  // Function to categorize articles by type
  const categorizeArticle = (articleId, articleDesc) => {
    const articleNum = extractArticleNumber(articleId);
    if (!articleNum) return 'Other';
    
    if (articleNum >= 12 && articleNum <= 35) return 'Fundamental Rights';
    if (articleNum >= 36 && articleNum <= 51) return 'Directive Principles';
    if (articleNum >= 52 && articleNum <= 151) return 'Union Government';
    if (articleNum >= 152 && articleNum <= 237) return 'State Government';
    if (articleNum >= 238 && articleNum <= 300) return 'Union Territories';
    if (articleNum >= 301 && articleNum <= 307) return 'Trade & Commerce';
    if (articleNum >= 308 && articleNum <= 323) return 'Services';
    if (articleNum >= 324 && articleNum <= 329) return 'Elections';
    if (articleNum >= 330 && articleNum <= 342) return 'Special Provisions';
    if (articleNum >= 343 && articleNum <= 351) return 'Official Language';
    if (articleNum >= 352 && articleNum <= 360) return 'Emergency Provisions';
    if (articleNum >= 361 && articleNum <= 367) return 'Miscellaneous';
    if (articleNum >= 368) return 'Constitutional Amendments';
    
    return 'Other';
  };

  // Load CSV data on component mount
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        console.log('🔍 Starting CSV load...');
        setDebugInfo('Loading CSV file...');
        
        const response = await fetch('/csv/Final_IC.csv');
        console.log('📄 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('📄 CSV text length:', csvText.length);
        
        setDebugInfo('Parsing CSV data...');
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('✅ CSV parsing complete');
            console.log('📊 Total rows:', results.data.length);
            console.log('📊 Sample row:', results.data[0]);
            
            setDebugInfo(`Parsed ${results.data.length} rows`);
            
            // Filter and clean data - use actual column names
            const cleanedData = results.data
              .filter(item => 
                item.article_id && item.article_id.trim() !== '' && 
                item.article_desc && item.article_desc.trim() !== ''
              )
              .map(item => ({
                ...item,
                articleNumber: extractArticleNumber(item.article_id),
                category: categorizeArticle(item.article_id, item.article_desc)
              }))
              .slice(0, 1000); // Use first 1000 articles for better performance
            
            console.log('🧹 Filtered data count:', cleanedData.length);
            console.log('🧹 Sample cleaned item:', cleanedData[0]);
            setArticles(cleanedData);
            
            if (cleanedData.length === 0) {
              setError('No valid articles found in CSV');
              return;
            }
            
            setDebugInfo(`Creating search index for ${cleanedData.length} articles...`);
            
            // Initialize Fuse instance with correct column names and better search
            const fuseInstance = new Fuse(cleanedData, {
              keys: [
                { name: 'article_id', weight: 0.4 },
                { name: 'article_desc', weight: 0.6 }
              ],
              includeScore: true,
              threshold: 0.6, // More lenient threshold
              distance: 300,
              minMatchCharLength: 2,
              ignoreLocation: true,
              useExtendedSearch: false
            });
            
            setFuse(fuseInstance);
            console.log('✅ Fuse instance created successfully');
            setDebugInfo('Search index ready!');
          },
          error: (error) => {
            console.error('❌ Error parsing CSV:', error);
            setError('Error parsing CSV: ' + error.message);
            setDebugInfo('CSV parsing failed');
          }
        });
      } catch (err) {
        console.error('❌ Error loading CSV:', err);
        setError('Error loading CSV: ' + err.message);
        setDebugInfo('CSV loading failed');
      }
    };

    loadCSVData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      console.log('🔍 SearchResults: Location search:', location.search);
      
      // Get parameters from URL
      const urlParams = new URLSearchParams(location.search);
      const title = urlParams.get('title');
      const content = urlParams.get('content');

      console.log('🔍 Extracted params:', { title, content });

      if (!title) {
        console.log('❌ No title parameter, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }

      if (!fuse) {
        console.log('⏳ Fuse not ready yet, waiting...');
        setDebugInfo('Waiting for search index...');
        return;
      }

      console.log('🔍 Performing search for:', title);
      setLoading(true);
      setError(null);
      setDebugInfo('Searching constitutional articles...');

      try {
        // Create multiple search queries for better results
        const searchQueries = [];
        
        // Main query
        const mainQuery = content ? `${title} ${content}` : title;
        searchQueries.push(mainQuery);
        
        // Extract key terms for additional searches
        const keyTerms = extractKeyTerms(title, content);
        searchQueries.push(...keyTerms);
        
        console.log('🔍 Search queries:', searchQueries);
        
        // Perform multiple searches and combine results
        let allResults = [];
        for (const query of searchQueries) {
          const results = fuse.search(query);
          allResults.push(...results);
        }
        
        // Remove duplicates and sort by score
        const uniqueResults = allResults
          .filter((result, index, self) => 
            index === self.findIndex(r => r.item.article_id === result.item.article_id)
          )
          .sort((a, b) => a.score - b.score);
        
        console.log('🔍 Combined results:', uniqueResults.length);
        console.log('🔍 First few results:', uniqueResults.slice(0, 3));
        
        // Filter and limit results - more lenient filtering
        const filteredResults = uniqueResults
          .filter(result => result.score < 0.8) // More lenient score threshold
          .slice(0, 20) // Show top 20 results
          .map(result => ({
            title: result.item.article_id,
            content: result.item.article_desc,
            articleNumber: result.item.articleNumber,
            category: result.item.category,
            matchScore: result.score
          }));
        
        console.log('🔍 Filtered results:', filteredResults.length);
        console.log('🔍 Sample filtered result:', filteredResults[0]);

        // Group results by category
        const groupedResults = filteredResults.reduce((groups, article) => {
          const category = article.category;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(article);
          return groups;
        }, {});

        // Create enhanced analysis
        const enhancedData = {
          original: filteredResults[0] || null,
          enhanced: `Legal Analysis for: "${title}"

This news article has been analyzed against the Indian Constitution database. Found ${filteredResults.length} related constitutional articles across ${Object.keys(groupedResults).length} categories.

Key Constitutional Categories Found:
${Object.keys(groupedResults).map(cat => `• ${cat}: ${groupedResults[cat].length} articles`).join('\n')}

The analysis shows how current events relate to constitutional principles and legal frameworks.`,
          newsTitle: title
        };
        
        console.log('✅ Search results created');
        setDebugInfo(`Found ${filteredResults.length} related articles in ${Object.keys(groupedResults).length} categories`);
        
        setSearchData({
          results: filteredResults,
          groupedResults: groupedResults,
          currentNewsTitle: title,
          enhancedArticle: enhancedData,
          isGeneratedAnalysis: false
        });
      } catch (err) {
        console.error('❌ Search error:', err);
        setError(`Search failed: ${err.message}`);
        setDebugInfo('Search failed');
        setSearchData({
          results: [],
          groupedResults: {},
          currentNewsTitle: title,
          enhancedArticle: null,
          isGeneratedAnalysis: false
        });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [location.search, navigate, fuse]);

  // Function to extract key terms from news title and content
  const extractKeyTerms = (title, content) => {
    const text = `${title} ${content || ''}`.toLowerCase();
    const keyTerms = [];
    
    // Common constitutional terms
    const constitutionalTerms = [
      'right', 'freedom', 'equality', 'liberty', 'justice', 'law', 'government',
      'citizen', 'state', 'parliament', 'president', 'court', 'judiciary',
      'election', 'vote', 'democracy', 'constitution', 'amendment',
      'fundamental', 'directive', 'principle', 'duty', 'responsibility'
    ];
    
    constitutionalTerms.forEach(term => {
      if (text.includes(term)) {
        keyTerms.push(term);
      }
    });
    
    return keyTerms.slice(0, 5); // Limit to 5 key terms
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-600 mb-2">Analyzing news and finding related constitutional articles...</h2>
          <p className="text-sm text-gray-500">Searching through {articles.length} constitutional articles</p>
          {debugInfo && (
            <p className="text-xs text-blue-500 mt-2">Debug: {debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (!searchData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-600">Loading constitutional database...</h2>
          <p className="text-sm text-gray-500">Please wait while we load the legal articles</p>
          {debugInfo && (
            <p className="text-xs text-blue-500 mt-2">Debug: {debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  const { results, groupedResults, currentNewsTitle, enhancedArticle, isGeneratedAnalysis } = searchData;

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
          <p className="text-sm text-gray-500 mt-1">
            Found {results.length} related constitutional articles from {articles.length} total articles
          </p>
          {debugInfo && (
            <p className="text-xs text-blue-500 mt-1">Debug: {debugInfo}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to News
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini Analysis Section */}
        {enhancedArticle && enhancedArticle.enhanced && (
          <div className="lg:col-span-2 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-200">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">
                Legal Analysis
              </h3>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {enhancedArticle.enhanced}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Articles Section - Grouped by Category */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">
            {isGeneratedAnalysis 
              ? 'AI-Generated Legal Analysis' 
              : 'Related Constitutional Articles'}
          </h3>
          {Object.keys(groupedResults).length > 0 ? (
            Object.entries(groupedResults).map(([category, articles]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-lg font-medium text-purple-700 border-b border-purple-200 pb-2">
                  {category} ({articles.length} articles)
                </h4>
                <div className="space-y-3">
                  {articles.map((article, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold mb-2 text-blue-600">
                            {article.title}
                          </h5>
                          {article.articleNumber && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                              Article {article.articleNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-gray-500">
                            Match: {((1 - article.matchScore) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-3 text-sm">
                        {article.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">📜</div>
              <p className="text-gray-600">No related constitutional articles found.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try a different news article or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
