import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import Papa from 'papaparse';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useFuzzySearch = () => {
  const [articles, setArticles] = useState([]);
  const [fuse, setFuse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enhancedArticle, setEnhancedArticle] = useState(null);
  const [selectedNewsTitle, setSelectedNewsTitle] = useState(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        console.log('Loading CSV data...');
        const response = await fetch('/csv/Final_IC.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('CSV parsing complete, total rows:', results.data.length);
            
            // Filter and limit data for better performance
            const cleanedData = results.data
              .filter(item => 
                item.title && item.title.trim() !== '' && 
                item.content && item.content.trim() !== ''
              )
              .slice(0, 500); // Limit to first 500 articles for performance
            
            console.log('Filtered data count:', cleanedData.length);
            setArticles(cleanedData);
            
            // Initialize Fuse instance with optimized settings
            const fuseInstance = new Fuse(cleanedData, {
              keys: ['title', 'content'],
              includeScore: true,
              threshold: 0.6, // Increased threshold for better matches
              distance: 100, // Reduced distance for faster search
              minMatchCharLength: 2,
              useExtendedSearch: false, // Disabled for better performance
              ignoreLocation: true
            });
            
            setFuse(fuseInstance);
            console.log('Fuse instance created successfully');
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Error parsing CSV: ' + error.message);
          }
        });
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError('Error loading CSV: ' + err.message);
      }
    };

    loadCSVData();
  }, []);

  const searchArticles = async (query) => {
    console.log('Starting search for:', query);
    
    if (!fuse || !query) {
      const error = 'Search not ready or query is empty';
      console.error(error, { fuse: !!fuse, query });
      setError(error);
      return { results: [], enhancedData: null };
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      const error = 'Gemini API key is not configured';
      console.error(error);
      setError(error);
      return { results: [], enhancedData: null };
    }

    setError(null);
    setSelectedNewsTitle(query);
    setLoading(true);
    
    try {
      console.log('Performing fuzzy search...');
      const results = fuse.search(query);
      console.log('Fuzzy search results:', results.length);
      
      // Take only top 3 results for better performance
      const filteredResults = results
        .filter(result => result.score < 0.8)
        .slice(0, 3)
        .map(result => ({
          ...result.item,
          matchScore: result.score
        }));
      
      console.log('Filtered results:', filteredResults.length);

      // If no relevant articles found, provide a simple fallback
      if (filteredResults.length === 0) {
        console.log('No matches found, providing fallback');
        const fallbackData = {
          title: "No Direct Constitutional Match Found",
          content: "This news article doesn't have a direct match in our constitutional database. However, you can still discuss the legal implications in the chat room.",
          matchScore: 1,
          isGenerated: true,
          enhanced: "No specific constitutional articles found for this news topic. Consider discussing the broader legal implications in the chat room."
        };

        setEnhancedArticle(fallbackData);
        return { results: [fallbackData], enhancedData: fallbackData };
      }

      // Process the best match with Gemini (only if we have results)
      console.log('Processing best match with Gemini');
      const bestMatch = filteredResults[0];
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Analyze this news article in relation to "${query}" and provide brief legal insights:
        Article Content: ${bestMatch.content}
        
        Please provide a brief analysis (2-3 paragraphs) covering:
        1. Key legal points and implications
        2. How this relates to the current news: "${query}"
        
        Keep the response concise and focused on Indian legal context.`;

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        const enhancedData = {
          original: bestMatch,
          enhanced: text,
          newsTitle: query
        };
        console.log('Setting enhanced article data');
        setEnhancedArticle(enhancedData);

        const processedResults = filteredResults.map((r, i) => ({
          ...r,
          isProcessed: i === 0,
          enhanced: i === 0 ? text : null
        }));

        return { results: processedResults, enhancedData };
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fallback without Gemini analysis
        const processedResults = filteredResults.map((r, i) => ({
          ...r,
          isProcessed: i === 0,
          enhanced: null
        }));
        
        return { results: processedResults, enhancedData: null };
      }
    } catch (err) {
      console.error('Error in searchArticles:', err);
      setError(`Search error: ${err.message}`);
      return { results: [], enhancedData: null };
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithGemini = async (article) => {
    if (!article) return;
    
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Analyze this legal article and provide insights:
      Article Content: ${article.content}
      
      Please provide:
      1. Key legal points and implications
      2. Relevant sections from Indian law (IPC, Constitution, or other relevant acts)
      3. Similar legal precedents or cases
      
      Format the response in clear sections with bullet points.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedData = {
        original: article,
        enhanced: response.text(),
        newsTitle: selectedNewsTitle
      };
      setEnhancedArticle(enhancedData);
    } catch (err) {
      console.error('Error enhancing with Gemini:', err);
      setError('Error enhancing with Gemini: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchArticles,
    enhanceWithGemini,
    enhancedArticle,
    loading,
    error,
    selectedNewsTitle
  };
};
