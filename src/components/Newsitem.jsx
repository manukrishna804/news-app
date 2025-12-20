import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useNews } from './NewsContext';

const Newsitem = ({ title, description, src, url, source, date }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleLawsArticlesClick = (e) => {
    e.preventDefault();
    if (!title) return;
    const searchParams = new URLSearchParams();
    searchParams.set('title', title);
    if (description) {
      searchParams.set('content', description);
    }
    navigate(`/dashboard/search?${searchParams.toString()}`);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 ring-1 ring-gray-100 hover:ring-blue-100">
      {/* Image Container */}
      <div className="relative overflow-hidden h-52">
        <img
          src={!imgError ? src : 'https://placehold.co/600x400/e2e8f0/64748b?text=News'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={title}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge if available (mock) */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-gray-800 shadow-sm">
            NEWS
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
            {source ? source : 'Unknown Source'}
          </span>
          <span>
            {date ? new Date(date).toLocaleDateString() : 'Just now'}
          </span>
        </div>

        <h5 className="text-lg font-bold mb-3 text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {title ? title : 'No title available'}
        </h5>

        <p className="text-gray-600 mb-6 text-sm flex-1 line-clamp-3 leading-relaxed">
          {description
            ? description
            : "Click to read more about this breaking news story and explore full analysis."}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-sm hover:shadow"
          >
            Read
          </a>

          <button
            onClick={() => navigate(`/dashboard/chat/${encodeURIComponent(title)}`)}
            className="flex items-center justify-center p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Join Discussion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
          </button>

          <button
            onClick={handleLawsArticlesClick}
            className="flex items-center justify-center p-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            title="AI Legal Analysis"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
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
  url: PropTypes.string,
  source: PropTypes.string,
  date: PropTypes.string
};

export default Newsitem;