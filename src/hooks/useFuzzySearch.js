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
        const response = await fetch('/csv/Final_IC.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const cleanedData = results.data.filter(item => 
              item.title && item.title.trim() !== '' && 
              item.content && item.content.trim() !== ''
            );
            setArticles(cleanedData);
            
            // Initialize Fuse instance with optimized settings
            const fuseInstance = new Fuse(cleanedData, {
              keys: ['title', 'content'],
              includeScore: true,
              threshold: 0.4,
              distance: 200,
              minMatchCharLength: 3,
              useExtendedSearch: true,
              ignoreLocation: true
            });
            
            setFuse(fuseInstance);
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
      
      const filteredResults = results
        .filter(result => result.score < 0.7)
        .map(result => ({
          ...result.item,
          matchScore: result.score
        }));
      console.log('Filtered results:', filteredResults.length);

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // If no relevant articles found, ask Gemini for general legal analysis
      if (filteredResults.length === 0) {
        console.log('No matches found, using Gemini fallback');
        const fallbackPrompt = `Analyze this news title: "${query}" from a legal perspective.

        Please provide:
        1. Potential legal implications and concerns
        2. Relevant sections from Indian law (IPC, Constitution, or other relevant acts)
        3. Similar legal precedents or cases that might be relevant
        4. Recommendations for legal compliance or risk mitigation

        Focus on Indian legal context and cite specific sections of law where applicable.
        Format the response in clear sections with bullet points.`;

        console.log('Sending fallback prompt to Gemini...');
        const result = await model.generateContent(fallbackPrompt);
        console.log('Received Gemini response');
        const response = await result.response;
        const text = response.text();
        console.log('Processed Gemini response');
        
        if (!text) {
          throw new Error('Empty response from Gemini');
        }
        
        const fallbackData = {
          title: "AI-Generated Legal Analysis",
          content: "Generated legal analysis based on Indian law and constitution",
          matchScore: 1,
          isGenerated: true,
          enhanced: text
        };

        setEnhancedArticle(fallbackData);
        return { results: [fallbackData], enhancedData: fallbackData };
      }

      // Process the best match with Gemini
      console.log('Processing best match with Gemini');
      const bestMatch = filteredResults[0];
      
      const prompt = `Analyze this news article in relation to "${query}" and provide insights:
      Article Content: ${bestMatch.content}
      
      Please provide:
      1. Key legal points and implications
      2. Relevant sections from Indian law (IPC, Constitution, or other relevant acts)
      3. Similar legal precedents or cases
      4. How this relates to the current news: "${query}"
      
      Focus on Indian legal context and cite specific sections of law where applicable.
      Format the response in clear sections with bullet points.`;

      console.log('Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      console.log('Received Gemini response');
      const response = await result.response;
      const text = response.text();
      console.log('Processed Gemini response');

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
    } catch (err) {
      console.error('Error in searchArticles:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        query,
        hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY
      });
      setError(`Error: ${err.message}`);
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
