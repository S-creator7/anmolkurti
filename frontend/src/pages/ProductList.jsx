import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import FilterPanel from '../components/FilterPanel';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const { products, backendUrl } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    gender: [],
    occasion: [],
    type: [],
    category: [],
    subCategory: [],
    filterTags: []
  });

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    console.log('Filters updated:', filters);
    console.log('Selected category:', filters.category.length === 1 ? filters.category[0] : null);
    let filtered = products;

    // Apply filters one by one
    if (filters.gender.length > 0) {
      filtered = filtered.filter(p => filters.gender.includes(p.gender));
    }
    if (filters.occasion.length > 0) {
      filtered = filtered.filter(p => p.occasion.some(o => filters.occasion.includes(o)));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(p => p.type.some(t => filters.type.includes(t)));
    }
    if (filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category.includes(p.category));
    }
    if (filters.subCategory.length > 0) {
      filtered = filtered.filter(p => filters.subCategory.includes(p.subCategory));
    }
    if (filters.filterTags.length > 0) {
      filtered = filtered.filter(p => p.filterTags.some(tag => filters.filterTags.includes(tag)));
    }

    setFilteredProducts(filtered);
    console.log('Filtered products count:', filtered.length);
  }, [filters, products]);

  return (
    <div className="flex gap-6 p-4">
      <FilterPanel 
        backendUrl={backendUrl} 
        onFilterChange={setFilters} 
        selectedCategory={filters.category.length > 0 ? filters.category : []} 
        selectedFilters={filters}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1">
        {filteredProducts.length === 0 ? (
          <p>No products found matching the selected filters.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="border p-4 rounded">
              <Link to={`/product/${product._id}`}>
                <img src={product.image[0]} alt={product.name} className="w-full h-48 object-cover mb-2" />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">Price: Rs. {product.price}</p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
