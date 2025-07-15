import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation, useNavigate } from 'react-router-dom';

const ANIMATION_DURATION = 300; // ms

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch, products } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showPopularSearches, setShowPopularSearches] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5)); // Keep only 5 recent searches
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Control visibility based on location
  useEffect(() => {
    if (location.pathname.includes('collection')) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  // Handle popular searches visibility with animation
  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (search && search.length > 0) {
      // Start fade-out animation
      setIsAnimatingOut(true);
      setIsAnimatingIn(false);
      animationTimeoutRef.current = setTimeout(() => {
        setShowPopularSearches(false);
        setIsAnimatingOut(false);
      }, 300); // Duration matches CSS transition
    } else {
      // Start fade-in animation when search is cleared
      if (!showPopularSearches) {
        setShowPopularSearches(true);
        setIsAnimatingIn(true);
        setIsAnimatingOut(false);
        // Remove animating in state after animation completes
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimatingIn(false);
        }, 300);
      }
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [search, showPopularSearches]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  // Generate search suggestions based on products
  const generateSuggestions = useCallback((query) => {
    if (!query || query.length < 2) return [];

    const lowercaseQuery = query.toLowerCase();
    const suggestions = new Set();

    products.forEach(product => {
      // Search in product name
      if (product.name?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(product.name);
      }

      // Search in category
      if (product.category?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(product.category);
      }

      // Search in subcategory
      if (product.subCategory?.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(product.subCategory);
      }

      // Search in filter tags
      if (product.filterTags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))) {
        product.filterTags.forEach(tag => {
          if (tag.toLowerCase().includes(lowercaseQuery)) {
            suggestions.add(tag);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
  }, [products]);

  const currentSuggestions = generateSuggestions(search);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedSuggestionIndex(-1);
    setShowSuggestions(value.length > 0);
  };

  // Handle search submission
  const handleSearchSubmit = (searchTerm = search) => {
    if (!searchTerm.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Hide suggestions
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Navigate to collection if not already there
    if (!location.pathname.includes('collection')) {
      navigate('/collection');
    }

    // Blur input to hide mobile keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Handle search bar closing with animation
  const handleCloseSearch = () => {
    setIsClosing(true);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setShowSearch(false);
      setIsClosing(false);
    }, ANIMATION_DURATION);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...currentSuggestions,
      ...(search && currentSuggestions.length === 0 ? recentSearches : [])
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = allSuggestions[selectedSuggestionIndex];
          setSearch(selectedSuggestion);
          handleSearchSubmit(selectedSuggestion);
        } else {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        if (inputRef.current) {
          inputRef.current.blur();
        }
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    handleSearchSubmit(suggestion);
  };

  // Handle focus events
  const handleInputFocus = () => {
    if (search.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }, 200);
  };

  // Clear search
  const clearSearch = () => {
    setSearch('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Only render if open or closing (so animation can play)
  if (!showSearch && !isClosing) return null;

  return (
    <div className={`relative py-8 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
      {/* Glass Background */}
      <div className='absolute inset-0 bg-gradient-to-r from-hotpink-50/30 via-white/40 to-hotpink-50/30 backdrop-blur-sm rounded-3xl'></div>
      {/* Main Search Container */}
      <div className='relative z-10 max-w-4xl mx-auto px-6'>
        <div className='relative'>
          {/* Search Input Container */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-r from-hotpink-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
            <div className='relative bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden'>
              {/* Search Icon */}
              <div className='absolute left-6 top-1/2 transform -translate-y-1/2 text-hotpink-400 z-10'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>
              {/* Input Field */}
              <input 
                ref={inputRef}
                value={search} 
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className='w-full h-16 pl-16 pr-20 bg-transparent text-gray-800 placeholder-gray-400 text-lg font-medium outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none' 
                type="text" 
                placeholder='Search for kurties, colors, occasions...'
                autoComplete="off"
              />
              {/* Clear/Close Buttons */}
              <div className='absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
                <button 
                  onClick={search ? clearSearch : handleCloseSearch}
                  className='p-2 text-gray-400 hover:text-hotpink-500 hover:bg-hotpink-50 rounded-xl transition-all duration-300 group'
                  title={search ? "Clear search" : "Close search"}
                >
                  <svg className='w-6 h-6 group-hover:rotate-90 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className='absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden z-50 max-h-80 overflow-y-auto animate-fade-in'
              >
                {currentSuggestions.length > 0 ? (
                  <div className='py-2'>
                    <div className='px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100'>
                      Suggestions
                    </div>
                    {currentSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-hotpink-50 hover:text-hotpink-600 transition-colors duration-200 flex items-center gap-3 search-suggestion ${
                          index === selectedSuggestionIndex ? 'bg-hotpink-50 text-hotpink-600' : ''
                        }`}
                      >
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                        <span className='font-medium'>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                ) : search && recentSearches.length > 0 ? (
                  <div className='py-2'>
                    <div className='px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100 flex items-center justify-between'>
                      <span>Recent Searches</span>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recentSearches');
                        }}
                        className='text-xs text-hotpink-500 hover:text-hotpink-600 transition-colors duration-200'
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((recentSearch, index) => (
                      <button
                        key={recentSearch}
                        onClick={() => handleSuggestionClick(recentSearch)}
                        className={`w-full text-left px-4 py-3 text-gray-700 hover:bg-hotpink-50 hover:text-hotpink-600 transition-colors duration-200 flex items-center gap-3 search-suggestion ${
                          index + currentSuggestions.length === selectedSuggestionIndex ? 'bg-hotpink-50 text-hotpink-600' : ''
                        }`}
                      >
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>{recentSearch}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          {/* Popular suggestions with smooth animations */}
          {showPopularSearches && (
            <div className={`mt-6 text-center transition-all duration-300 ease-in-out ${
              isAnimatingOut 
                ? 'opacity-0 transform translate-y-[-10px] max-h-0 overflow-hidden' 
                : isAnimatingIn
                ? 'opacity-100 transform translate-y-0 max-h-96 animate-fade-in'
                : 'opacity-100 transform translate-y-0 max-h-96'
            }`}>
              <p className='text-sm text-gray-500 mb-4 font-medium'>Popular searches</p>
              <div className='flex flex-wrap justify-center gap-3'>
                {['Festive', 'Cotton', 'Silk', 'Casual', 'Traditional', 'Wedding'].map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => handleSuggestionClick(tag)}
                    className={`group relative px-4 py-2 bg-white/60 backdrop-blur-sm text-sm text-gray-600 rounded-full border border-white/30 hover:border-hotpink-200 hover:text-hotpink-600 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-medium ${
                      isAnimatingOut 
                        ? 'animate-fade-out-stagger' 
                        : isAnimatingIn 
                        ? 'animate-fade-in-stagger' 
                        : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className='relative z-10'>{tag}</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-hotpink-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
