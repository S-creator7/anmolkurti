import { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import FilterPanel from '../components/FilterPanel';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const ProductList = () => {
  const { backendUrl, search, setSearch } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // Restore to the previously active product if available, else use saved scroll
  useEffect(() => {
    const restore = () => {
      const activeId = sessionStorage.getItem('collectionActiveProductId');
      if (activeId) {
        const el = document.querySelector(`[data-product-id="${activeId}"]`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          try { sessionStorage.removeItem('collectionActiveProductId'); } catch {}
          try { sessionStorage.removeItem('collectionScrollPosition'); } catch {}
          return;
        }
      }

      let scrollPosition = 0;
      if (location.state && location.state.scrollPosition) {
        scrollPosition = location.state.scrollPosition;
      } else {
        const savedPosition = sessionStorage.getItem('collectionScrollPosition');
        if (savedPosition) {
          scrollPosition = parseInt(savedPosition, 10);
        }
      }
      if (scrollPosition > 0) {
        const timeoutId = setTimeout(() => {
          window.scrollTo({ top: scrollPosition, left: 0, behavior: 'instant' });
          try { sessionStorage.removeItem('collectionScrollPosition'); } catch {}
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    };
    const mountTimeoutId = setTimeout(restore, 10);
    return () => clearTimeout(mountTimeoutId);
  }, [location.pathname]);

  // Remove previous scroll position save logic
  const [filters, setFilters] = useState({
    gender: [],
    occasion: [],
    type: [],
    category: [],
    subCategory: [],
    filterTags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [initializedFromSession, setInitializedFromSession] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [sortType, setSortType] = useState('relavent');
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const debounceRef = useRef(null);
  const limit = 12;
  const isRestoringRef = useRef(false);
  const didRunInitialResetRef = useRef(false);
  const skipNextFetchRef = useRef(false);

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

  const fetchProducts = async (page, filters, sort, searchTerm = '') => {
    console.log(` Fetching page ${page}, loading: ${loading}`);
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };

      // Add search parameter
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add filters to params if they have values
      Object.keys(filters).forEach(key => {
        if (filters[key].length > 0) {
          params[key] = filters[key].join(',');
        }
      });

      if (sort && sort !== 'relavent') {
        params.sort = sort;
      }

      console.log('API params:', params);
      
      const response = await axios.get(`${backendUrl}/product/list`, { params });
      console.log('API Response:', {
        success: response.data.success,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalProducts: response.data.totalProducts,
        productsCount: response.data.products?.length || 0
      });
      
      if (response.data.success) {
        console.log(` Received ${response.data.products?.length || 0} products for page ${page}`);
        
        if (page === 1) {
          // First page - replace products
          setProducts(response.data.products || []);
        } else {
          // Subsequent pages - append products
          const newItems = response.data.products || [];
          setProducts(prevProducts => {
            if (prevProducts.length === 0) return newItems;
            const seen = new Set(prevProducts.map(p => p._id));
            const filtered = newItems.filter(p => !seen.has(p._id));
            return [...prevProducts, ...filtered];
          });
        }
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || page);
        setTotalProducts(response.data.totalProducts || (response.data.products?.length || 0));
      } else {
        console.error(' API returned success: false', response.data);
      }
    } catch (error) {
      console.error(' Failed to fetch products:', error.response?.data || error.message);
      if (page === 1) {
        setProducts([]);
      }
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
      console.log(` Fetch completed for page ${page}, loading set to false`);
    }
  };

  // On first mount, restore up to saved page and then mark initialized
  useEffect(() => {
    if (initializedFromSession) return;
    const restore = async () => {
      const savedPageStr = sessionStorage.getItem('collectionCurrentPage');
      const savedPage = savedPageStr ? parseInt(savedPageStr, 10) : 1;
      if (!Number.isNaN(savedPage) && savedPage > 1) {
        isRestoringRef.current = true;
        for (let p = 1; p <= savedPage; p += 1) {
          // eslint-disable-next-line no-await-in-loop
          await fetchProducts(p, filters, sortType, debouncedSearch);
        }
        // Prevent immediate effect from re-fetching the same page
        skipNextFetchRef.current = true;
        setCurrentPage(savedPage);
        try { sessionStorage.removeItem('collectionCurrentPage'); } catch {}
        isRestoringRef.current = false;
      }
      setInitializedFromSession(true);
    };
    restore();
  }, [initializedFromSession, filters, sortType, debouncedSearch]);

  // Fetch products when dependencies change
  useEffect(() => {
    if (!initializedFromSession) return;
    if (isRestoringRef.current) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchProducts(currentPage, filters, sortType, debouncedSearch);
  }, [currentPage, filters, sortType, debouncedSearch, initializedFromSession]);

  // Reset to first page when search or filters change (skip on first mount)
  useEffect(() => {
    if (!initializedFromSession) return;
    if (!didRunInitialResetRef.current) {
      didRunInitialResetRef.current = true;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, filters, sortType, initializedFromSession]);

  // Use Intersection Observer for infinite scrolling with a bottom sentinel
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Keep latest values in refs so observer callback uses fresh state
  const loadingRef = useRef(loading);
  const currentPageRef = useRef(currentPage);
  const totalPagesRef = useRef(totalPages);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  // Create observer - recreated when dependencies change
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      console.log(' Sentinel element not found');
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    console.log(' Creating new Intersection Observer');
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
          console.log(' Intersection Observer triggered:', {
            isIntersecting: entry.isIntersecting,
            loading: loadingRef.current,
            isFetching: isFetchingRef.current,
            currentPage: currentPageRef.current,
            totalPages: totalPagesRef.current,
            canLoadMore: currentPageRef.current < totalPagesRef.current
          });

        if (
          entry.isIntersecting &&
          !loadingRef.current &&
          !isFetchingRef.current &&
          currentPageRef.current < totalPagesRef.current
        ) {
          console.log('Loading next page...');
          isFetchingRef.current = true;
          setCurrentPage((prev) => {
            console.log(` Current page updated to: ${prev + 1}`);
            return prev + 1;
          });
        }
      },
      {
        root: null,
        rootMargin: '200px', // Reduced margin for better timing
        threshold: 0.01, // Lower threshold for better detection
      }
    );

    observer.observe(el);
    observerRef.current = observer;
    console.log(' Observer created and observing sentinel');

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log('🧹 Observer disconnected');
      }
    };
  }, [filters, sortType, debouncedSearch]); // Recreate observer when key filters change

  // Reset fetching gate when loading completes
  useEffect(() => {
    if (!loading) {
      console.log(' Resetting isFetching flag');
      isFetchingRef.current = false;
      // After products are present, try to center on active product if not done yet
      const activeId = sessionStorage.getItem('collectionActiveProductId');
      if (activeId) {
        const el = document.querySelector(`[data-product-id="${activeId}"]`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          try { sessionStorage.removeItem('collectionActiveProductId'); } catch {}
          try { sessionStorage.removeItem('collectionScrollPosition'); } catch {}
        }
      }
    }
  }, [loading, products.length]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
  };

  const getResultsText = () => {
    if (loading) return 'Searching...';
    
    const searchText = debouncedSearch ? ` for "${debouncedSearch}"` : '';
    const activeFiltersCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);
    const filtersText = activeFiltersCount > 0 ? ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied)` : '';
    
    if (products.length === 0) {
      return `No products found${searchText}${filtersText}`;
    }
    
    return `${totalProducts} product${totalProducts > 1 ? 's' : ''} found${searchText}${filtersText}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {getResultsText()}
        </h2>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="bg-hotpink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filter Panel - Hidden on mobile by default, shown when toggled */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:w-64 xl:w-80`}>
        <FilterPanel 
          backendUrl={backendUrl} 
          onFilterChange={handleFilterChange} 
          selectedCategory={filters.category.length > 0 ? filters.category : []} 
          selectedFilters={filters}
        />
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              {getResultsText()}
            </h2>
            
            {/* Search result controls */}
            {(debouncedSearch || Object.values(filters).some(f => f.length > 0)) && (
              <div className="flex flex-wrap items-center gap-2">
                {debouncedSearch && (
                  <div className="flex items-center gap-2 bg-hotpink-100 text-hotpink-700 px-3 py-1 rounded-full text-sm">
                    <span>Search: "{debouncedSearch}"</span>
                    <button
                      onClick={clearSearch}
                      className="hover:bg-hotpink-200 rounded-full p-1 transition-colors"
                      title="Clear search"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {Object.entries(filters).map(([key, values]) => 
                  values.map(value => (
                    <div key={`${key}-${value}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      <span className="capitalize">{key}: {value}</span>
                      <button
                        onClick={() => {
                          const newFilters = { ...filters };
                          newFilters[key] = newFilters[key].filter(v => v !== value);
                          handleFilterChange(newFilters);
                        }}
                        className="hover:bg-gray-200 rounded-full p-1 transition-colors"
                        title={`Remove ${key} filter`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <select 
            value={sortType} 
            onChange={handleSortChange} 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-hotpink-500 bg-white shadow-sm min-w-[200px] text-sm sm:text-base"
            disabled={loading}
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
            <option value="newest">Sort by: Newest</option>
            <option value="bestseller">Sort by: Best Seller</option>
          </select>
        </div>

        {/* Loading State - show skeletons only during initial load (no products yet) */}
        {loading && products.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 gap-y-6 py-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-64 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 gap-y-6">
            {products.map(product => (
              <ProductItem
                key={product._id}
                id={product._id}
                image={product.image}
                name={product.name}
                price={product.price}
                currentPage={currentPage}
              />
            ))}

            {/* Loading indicator for infinite scroll while fetching next page */}
            {loading && currentPage < totalPages && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-hotpink-200 border-t-hotpink-500"></div>
                  <p className="text-gray-600 text-sm font-medium">Loading more products...</p>
                  <p className="text-gray-400 text-xs">Scroll down to load more</p>
                </div>
              </div>
            )}

            {/* End of results message */}
            {!loading && currentPage >= totalPages && totalPages > 1 && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="text-center">
                  <p className="text-gray-600 font-medium">🎉 You've reached the end!</p>
                  <p className="text-gray-400 text-sm mt-1">All {totalProducts} products loaded</p>
                </div>
              </div>
            )}

            {/* Manual load more button (fallback if intersection observer fails) */}
            {!loading && currentPage < totalPages && (
              <div className="col-span-full flex justify-center items-center py-6">
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="bg-hotpink-500 hover:bg-hotpink-600 text-white px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                  <span>Load More Products</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            )}

            {/* Sentinel element to trigger loading next page */}
            <div 
              ref={sentinelRef} 
              className="col-span-full h-20" 
              style={{ overflowAnchor: 'none' }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Pagination Controls - Commented out for infinite scrolling */}
        {/* {!loading && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            ...
          </div>
        )} */}

        {/* Empty state when no products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No products found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearch 
                ? 'Try searching for different keywords or check your spelling.' 
                : 'Try adjusting your filters to see more products.'
              }
            </p>
            {(debouncedSearch || Object.values(filters).some(f => f.length > 0)) && (
              <button
                onClick={() => {
                  setSearch('');
                  handleFilterChange({
                    gender: [],
                    occasion: [],
                    type: [],
                    category: [],
                    subCategory: [],
                    filterTags: []
                  });
                }}
                className="bg-hotpink-500 hover:bg-hotpink-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results info */}
        {!loading && products.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} 
            {totalProducts > 0 && ` (${totalProducts} total products)`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
