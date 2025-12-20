import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useNews } from './NewsContext';

const Newsitem = ({ title, description, src, url }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const { selectNews } = useNews();

  const handleLawsArticlesClick = (e) => {
    e.preventDefault();
    if (!title) return;

    // Navigate to the Search Results page with the news title and description
    // This allows the Search Results page to handle the heavy lifting (CSV loading, Search, AI)
    // ensuring the main feed stays fast and responsive.
    const searchParams = new URLSearchParams();
    searchParams.set('title', title);
    if (description) {
      searchParams.set('content', description);
    }

    navigate(`/dashboard/search?${searchParams.toString()}`);
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
            className="inline-block px-4 py-2 rounded transition-colors bg-purple-500 hover:bg-purple-600 text-white"
          >
            <span className="flex items-center">
              Laws/Articles
            </span>
          </button>
        </div>




      </div>
    </div>
  );
};

Newsitem.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  src: PropTypes.string,
  url: PropTypes.string
};

export default Newsitem;