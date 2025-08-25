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

      const response = await axios.get(`${backendUrl}/product/list`, { params });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalProducts(response.data.totalProducts || response.data.products.length);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotpink-500"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
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
              products.map(product => (
                <ProductItem
                  key={product._id}
                  id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      pageNumber === currentPage
                        ? 'bg-hotpink-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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
