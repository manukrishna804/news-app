import React from 'react';
import PropTypes from 'prop-types';

const ConfigChecker = ({ children }) => {
  const [isConfigured, setIsConfigured] = React.useState(true);
  const [missingConfigs] = React.useState([]);

  React.useEffect(() => {
    // Temporarily bypass configuration check for development
    setIsConfigured(true);
    
    // Uncomment the following code when you have your API keys ready:
    /*
    const requiredConfigs = [
      { key: 'VITE_FIREBASE_API_KEY', name: 'Firebase API Key' },
      { key: 'VITE_FIREBASE_AUTH_DOMAIN', name: 'Firebase Auth Domain' },
      { key: 'VITE_FIREBASE_PROJECT_ID', name: 'Firebase Project ID' },
      { key: 'VITE_API_KEY', name: 'News API Key' },
      { key: 'VITE_GEMINI_API_KEY', name: 'Google Gemini API Key' }
    ];

    const missing = requiredConfigs.filter(config => {
      const value = import.meta.env[config.key];
      return !value || value === 'your_api_key_here' || value.includes('your_');
    });

    if (missing.length > 0) {
      setIsConfigured(false);
      setMissingConfigs(missing);
    }
    */
  }, []);

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuration Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please configure the following environment variables:
            </p>
            <div className="text-left bg-gray-50 p-4 rounded mb-4">
              <ul className="text-sm text-gray-700 space-y-1">
                {missingConfigs.map((config, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-red-500 mr-2">•</span>
                    {config.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-gray-500">
              <p>Copy <code className="bg-gray-100 px-1 rounded">env.example</code> to <code className="bg-gray-100 px-1 rounded">.env</code> and fill in your API keys.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

ConfigChecker.propTypes = {
  children: PropTypes.node.isRequired
};

export default ConfigChecker; 