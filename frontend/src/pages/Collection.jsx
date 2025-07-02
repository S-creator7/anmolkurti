import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import ScrollToTop from "../components/scrollToTop";
import axios from 'axios';

const categories = ['Saree', 'Kurti', 'Suit', 'Shirt', 'Pants'];

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState(categories[0]); // Initialize with first category
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent');
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  const fetchFilters = async (category) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/filter/${category}`);
      if (response.data.success) {
        setFilters(response.data.filters);
        // Reset selected filters on category change
        setSelectedFilters({});
      }
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters(category);
  }, [category]);

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  };

  const toggleFilterValue = (filterName, value) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterName] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [filterName]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [filterName]: [...currentValues, value] };
      }
    });
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category) {
      productsCopy = productsCopy.filter(item => item.category === category);
    }

    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    // Apply dynamic filters
    Object.entries(selectedFilters).forEach(([filterName, values]) => {
      if (values.length > 0) {
        productsCopy = productsCopy.filter(product => {
          // Assuming product has a filters object with filterName keys and values as string or array
          const productFilterValue = product.filters && product.filters[filterName];
          if (!productFilterValue) return false;
          if (Array.isArray(productFilterValue)) {
            return productFilterValue.some(val => values.includes(val));
          } else {
            return values.includes(productFilterValue);
          }
        });
      }
    });

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }
  };

  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search,showSearch,products,selectedFilters]);

  useEffect(()=>{
    sortProduct();
  },[sortType]);

  return (
    <div>
      <ScrollToTop />
      <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

        {/* Filter Options */}
        <div className='min-w-60'>
          <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
            <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          </p>
          {/* Category Tabs */}
          <div className={`border border-gray-300 p-4 mb-4`}>
            <p className="font-semibold mb-2 text-sm">CATEGORIES</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              {categories.map(cat => (
                <label key={cat} className='flex gap-2 items-center cursor-pointer'>
                  <input
                    type="checkbox"
                    checked={category === cat}
                    onChange={() => {
                      if (category === cat) {
                        setCategory('');
                      } else {
                        setCategory(cat);
                      }
                      setSubCategory([]);
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          {/* Dynamic Filters */}
          <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
            {filters.length === 0 && <p>No filters available for this category.</p>}
            {filters.map(filter => (
              <div key={filter._id} className='mb-4'>
                <p className='mb-2 font-medium'>{filter.filterName}</p>
                <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                  {filter.filterValues.map(value => (
                    <label key={value} className='flex gap-2 items-center cursor-pointer'>
                      <input
                        type="checkbox"
                        checked={selectedFilters[filter.filterName]?.includes(value) || false}
                        onChange={() => toggleFilterValue(filter.filterName, value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* SubCategory Filter */}
          <div className={`border border-gray-300 p-4 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              <p className='flex gap-2'>
                <input className='w-3' type="checkbox" value={'Kurti Set'} onChange={toggleSubCategory}/> Kurti Set
              </p>
              <p className='flex gap-2'>
                <input className='w-3' type="checkbox" value={'Printed Kurti'} onChange={toggleSubCategory}/> Printed Kurti
              </p>
              <p className='flex gap-2'>
                <input className='w-3' type="checkbox" value={'Embroidered Kurti Set'} onChange={toggleSubCategory}/> Embroidered Kurti Set 
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className='flex-1'>

          <div className='flex justify-between text-base sm:text-2xl mb-4'>
              <Title text1={'ALL'} text2={'COLLECTIONS'} />
              {/* Product Sort */}
              <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
                <option value="relavent">Sort by: Relavent</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
          </div>

          {/* Map Products */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.length === 0 ? (
              <p className="text-center col-span-full text-gray-500 mt-10">No products found.</p>
            ) : (
              filterProducts.map((item, index) => (
                <div key={index} className="w-full aspect-square flex">
                  <ProductItem
                    name={item.name}
                    id={item._id}
                    price={item.price}
                    image={item.image}
                  />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
       <BestSeller/>
       <OurPolicy/>
       <NewsletterBox/>
     </div>
  )
}

export default Collection
