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

            // Filter and clean data - use actual column names
            const cleanedData = results.data
              .filter(item =>
                (item.article_id && item.article_id.trim() !== '') ||
                (item.title && item.title.trim() !== '')
              )
              .map(item => ({
                ...item,
                // CRITICAL FIX: Map CSV columns to generic keys for Fuse and UI
                title: item.article_id || item.title || 'Untitled',
                content: item.article_desc || item.content || 'No description',
                articleNumber: extractArticleNumber(item.article_id || item.title),
                category: categorizeArticle(item.article_id, item.article_desc)
              }))
              .filter(item => item.content && item.content.trim() !== '')
              .slice(0, 1000); // Use first 1000 articles for better performance

            console.log('🧹 Filtered data count:', cleanedData.length);
            setArticles(cleanedData);

            if (cleanedData.length === 0) {
              setError('No valid articles found in CSV');
              return;
            }

            setDebugInfo(`Creating search index for ${cleanedData.length} articles...`);

            // Initialize Fuse instance with correct keys
            const fuseInstance = new Fuse(cleanedData, {
              keys: [
                { name: 'title', weight: 0.3 },     // Search in Article ID (e.g. Article 21)
                { name: 'content', weight: 0.7 }    // Search in Description (e.g. Protection of life...)
              ],
              includeScore: true,
              threshold: 0.5, // 0.0 = perfect match, 1.0 = match anything. 0.5 is balanced.
              distance: 1000, // Search far into the text
              minMatchCharLength: 3,
              ignoreLocation: true,
              useExtendedSearch: true
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
      // Get parameters from URL
      const urlParams = new URLSearchParams(location.search);
      const title = urlParams.get('title');
      const content = urlParams.get('content');

      if (!title) {
        navigate('/dashboard');
        return;
      }

      if (!fuse) {
        setDebugInfo('Waiting for database to load...');
        return;
      }

      setLoading(true);
      setError(null);
      setDebugInfo('Analyzing legal database...');

      try {
        // Collect search terms
        const searchTerms = new Set();

        // 1. Add key terms from the text (Constitutional words)
        const keyTerms = extractKeyTerms(title, content);
        keyTerms.forEach(term => searchTerms.add(term));

        // 2. Add some fallback general terms if no specific key terms found
        if (searchTerms.size === 0) {
          // Basic split of title into words, ignoring small words
          title.split(' ').forEach(word => {
            if (word.length > 4) searchTerms.add(word);
          });
        }

        console.log('🔍 Search terms:', Array.from(searchTerms));

        // Perform searches
        let allResults = [];

        // Strategy A: Direct Fuse Search on the full title
        const resultsTitle = fuse.search(title);
        allResults.push(...resultsTitle);

        // Strategy B: Search for each key term individually
        for (const term of searchTerms) {
          const results = fuse.search(term);
          allResults.push(...results);
        }

        // Deduplicate and sort
        const uniqueItems = new Map();
        allResults.forEach(res => {
          // Use article_id as unique key
          const key = res.item.article_id || res.item.title;
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, res);
          } else {
            // Keep the one with better score (lower is better)
            if (res.score < uniqueItems.get(key).score) {
              uniqueItems.set(key, res);
            }
          }
        });

        const sortedResults = Array.from(uniqueItems.values())
          .sort((a, b) => a.score - b.score)
          .slice(0, 15) // Top 15 results
          .map(result => ({
            title: result.item.title, // Now guaranteed to exist from our loadCSVData map
            content: result.item.content,
            articleNumber: result.item.articleNumber,
            category: result.item.category,
            matchScore: result.score
          }));

        console.log('🔍 Final sorted results:', sortedResults.length);

        // If no results, try a super broad search for "Constitution" just to show SOMETHING
        if (sortedResults.length === 0) {
          console.log('⚠️ No results found, showing general backup');
          const backupResults = fuse.search("Constitution")
            .slice(0, 5)
            .map(result => ({
              title: result.item.title,
              content: result.item.content,
              articleNumber: result.item.articleNumber,
              category: result.item.category,
              matchScore: 0.9
            }));
          sortedResults.push(...backupResults);
        }

        // Group results
        const groupedResults = sortedResults.reduce((groups, article) => {
          const category = article.category || 'Other';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(article);
          return groups;
        }, {});

        // Use AI Summary or fallback
        const enhancedData = {
          enhanced: `Analysis for "${title}":\n\nFound ${sortedResults.length} relevant articles. The most relevant category appears to be ${Object.keys(groupedResults)[0] || 'General'}.`,
          newsTitle: title
        };

        setSearchData({
          results: sortedResults,
          groupedResults: groupedResults,
          currentNewsTitle: title,
          enhancedArticle: enhancedData,
          isGeneratedAnalysis: false
        });
      } catch (err) {
        console.error('❌ Search error:', err);
        setError(`Search analysis failed: ${err.message}`);
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

      {
        currentNewsTitle && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate(`/dashboard/chat/${encodeURIComponent(currentNewsTitle)}`)}
              className="bg-[#075E54] hover:bg-[#054c44] text-white px-6 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              <span>💬</span>
              Discuss this Topic
            </button>
          </div>
        )
      }

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
    </div >
  );
};

export default SearchResults;
