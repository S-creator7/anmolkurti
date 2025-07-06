import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import FilterPanel from '../components/FilterPanel';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = () => {
  const { backendUrl } = useContext(ShopContext);
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
  const limit = 10;

  const fetchProducts = async (page, filters, sort) => {
    try {
      const params = {
        page,
        limit,
      };

      // Add filters to params if they have values
      Object.keys(filters).forEach(key => {
        if (filters[key].length > 0) {
          params[key] = filters[key].join(',');
        }
      });

      if (sort && sort !== 'relavent') {
        params.sort = sort;
      }

      const response = await axios.get(`${backendUrl}/api/product/list`, { params });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, filters, sortType);
  }, [currentPage, filters, sortType]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  return (
    <div className="flex gap-6 p-4">
      <FilterPanel 
        backendUrl={backendUrl} 
        onFilterChange={handleFilterChange} 
        selectedCategory={filters.category.length > 0 ? filters.category : []} 
        selectedFilters={filters}
      />
      <div className="flex flex-col flex-1">
        <div className="flex justify-end mb-4">
          <select value={sortType} onChange={handleSortChange} className="border border-gray-300 rounded px-3 py-1">
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p>No products found matching the selected filters.</p>
          ) : (
            products.map(product => (
              <div key={product._id} className="border p-4 rounded flex flex-col">
                <Link to={`/product/${product._id}`}>
                  <img src={product.image[0]} alt={product.name} className="w-full h-48 object-cover mb-2" />
                  <h3 className="font-semibold text-center">{product.name}</h3>
                  <p className="text-gray-600 text-center">Price: Rs. {product.price}</p>
                </Link>
              {/* Removed Add to Cart button as per user request */}
              {/* <button
                  onClick={() => addToCart(product._id, product.hasSize ? product.sizes[0] : null)}
                  className="mt-auto bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                >
                  Add to Cart
                </button> */}
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
