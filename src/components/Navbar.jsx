import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Latest', value: 'general' },
    { name: 'Business', value: 'business' },
    { name: 'Tech', value: 'technology' },
    { name: 'Sports', value: 'sports' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'Health', value: 'health' },
    { name: 'Science', value: 'science' }
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setCategory(category);
    setIsOpen(false);
    navigate('/dashboard'); // Ensure we go to dashboard when clicking a category
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100'
        : 'bg-white border-b border-gray-100'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-blue-500/30 transition-all">
                E
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                Ecosphere
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.value
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white border-t border-gray-100 shadow-xl">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`block px-3 py-3 rounded-lg text-base font-medium w-full text-left transition-colors ${activeCategory === cat.value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  setCategory: PropTypes.func.isRequired
};

export default Navbar;