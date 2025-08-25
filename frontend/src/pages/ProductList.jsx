 import { useContext, useState, useEffect, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import FilterPanel from '../components/FilterPanel';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const ProductList = () => {
  const { backendUrl, search, setSearch } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    gender: [],
    occasion: [],
    type: [],
    category: [],
    subCategory: [],
    filterTags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortType, setSortType] = useState('relavent');
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const debounceRef = useRef(null);
  const limit = 12;

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

    console.log('Fetching products with params:', params);
    
    const response = await axios.get(`${backendUrl}/product/list`, { params });
    console.log('API Response:', response.data);
    if (response.data.success) {
      console.log('API Response:', {
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalProducts: response.data.totalProducts,
        productsCount: response.data.products.length
      });
        
        if (page === 1) {
          // First page - replace products
          setProducts(response.data.products);
        } else {
          // Subsequent pages - append products
          setProducts(prevProducts => [...prevProducts, ...response.data.products]);
        }
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalProducts(response.data.totalProducts || response.data.products.length);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (page === 1) {
          setLoading(false); // Reset loading state on error
          setProducts([]);
      }
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts(currentPage, filters, sortType, debouncedSearch);
  }, [currentPage, filters, sortType, debouncedSearch]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sortType]);

  // Use Intersection Observer for infinite scrolling with a bottom sentinel
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && !isFetchingRef.current && currentPage < totalPages) {
          isFetchingRef.current = true;
          // Increment page; fetchProducts will run via effect on currentPage change
          setCurrentPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.1
      }
    );

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, currentPage, totalPages]);

  // Reset fetching gate when loading completes
  useEffect(() => {
    if (!loading) {
      isFetchingRef.current = false;
    }
  }, [loading]);

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
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 gap-y-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-16">
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
            ) : (
              <>
                {products.map(product => (
                  <ProductItem
                    key={product._id}
                    id={product._id}
                    image={product.image}
                    name={product.name}
                    price={product.price}
                  />
                ))}
                
                {/* Loading indicator for infinite scroll */}
                {currentPage < totalPages && (
                  <>
                    <div className="col-span-full flex justify-center items-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hotpink-500"></div>
                        <p className="text-gray-600 text-sm">Loading more products...</p>
                      </div>
                    </div>
                    {/* Sentinel element to trigger loading next page */}
                    <div ref={sentinelRef} className="col-span-full h-px" />
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Pagination Controls - Commented out for infinite scrolling */}
        {/* {!loading && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            ...
          </div>
        )} */}

        {/* Fallback sentinel at the end if grid not rendered (e.g., while loading) */}
        <div ref={sentinelRef} className="h-px" />

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
