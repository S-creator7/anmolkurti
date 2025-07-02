// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const FilterPanel = ({ backendUrl, onFilterChange, selectedCategory }) => {
//   const [filters, setFilters] = useState({
//     gender: [],
//     occasion: [],
//     type: [],
//     category: [],
//     subCategory: [],
//     filterTags: []
//   });

//   const [subCategoryMap, setSubCategoryMap] = useState({});

//   const [selectedFilters, setSelectedFilters] = useState({
//     gender: [],
//     occasion: [],
//     type: [],
//     category: [],
//     subCategory: [],
//     filterTags: []
//   });

//   useEffect(() => {
//     const fetchFilters = async () => {
//       try {
//         const response = await axios.get(`${backendUrl}/api/filter/dynamic`);
//         console.log("Filter API response:", response.data);
//         if (response.data.success) {
//           // Normalize filter values to lowercase strings
//           const rawFilters = response.data.filters;
//           const normalizedFilters = {};
//           for (const key in rawFilters) {
//             if (key === 'subCategoryMap') {
//               // Normalize subCategoryMap keys to lowercase
//               const normalizedSubCategoryMap = {};
//               for (const cat in rawFilters.subCategoryMap) {
//                 normalizedSubCategoryMap[cat.toLowerCase()] = rawFilters.subCategoryMap[cat].map(subCat => subCat.toLowerCase());
//               }
//               normalizedFilters[key] = normalizedSubCategoryMap;
//             } else if (Array.isArray(rawFilters[key])) {
//               normalizedFilters[key] = rawFilters[key].map(val => val.toLowerCase());
//             } else {
//               normalizedFilters[key] = rawFilters[key];
//             }
//           }
//           setFilters(normalizedFilters);
//           if (normalizedFilters.subCategoryMap) {
//             setSubCategoryMap(normalizedFilters.subCategoryMap);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to fetch filters:', error);
//       }
//     };
//     fetchFilters();
//   }, [backendUrl]);

//   const handleCheckboxChange = (filterCategory, value) => {
//     setSelectedFilters(prev => {
//       const currentValues = prev[filterCategory];
//       let newValues;
//       if (currentValues.includes(value)) {
//         newValues = currentValues.filter(v => v !== value);
//       } else {
//         newValues = [...currentValues, value];
//       }
//       const updatedFilters = { ...prev, [filterCategory]: newValues };
//       onFilterChange(updatedFilters);
//       return updatedFilters;
//     });
//   };

//   const renderFilterSection = (title, filterCategory) => {
//     let valuesToRender = filters[filterCategory];

//     if (filterCategory === 'subCategory') {
//       if (selectedCategory) {
//         // Normalize selectedCategory to lowercase
//         const selectedCats = Array.isArray(selectedCategory) ? selectedCategory : [selectedCategory];
//         const normalizedSelectedCats = selectedCats.map(cat => cat.toLowerCase());

//         // Combine subcategories for all selected categories
//         let combinedSubCategories = [];
//         normalizedSelectedCats.forEach(cat => {
//           if (subCategoryMap[cat]) {
//             combinedSubCategories = combinedSubCategories.concat(subCategoryMap[cat]);
//           }
//         });

//         // Remove duplicates
//         valuesToRender = [...new Set(combinedSubCategories)];
//       } else {
//         // If no selectedCategory, show no subCategories
//         valuesToRender = [];
//       }
//     }

//     // For other filters, always show even if empty with placeholder
//     if (valuesToRender.length === 0) {
//       return (
//         <div className="mb-4">
//           <h3 className="font-semibold mb-2">{title}</h3>
//           <div className="p-2 border rounded text-sm text-gray-500">No filters available.</div>
//         </div>
//       );
//     }

//     return (
//       <div className="mb-4">
//         <h3 className="font-semibold mb-2">{title}</h3>
//         <div className="flex flex-wrap gap-2">
//           {valuesToRender.map(value => (
//             <label key={value} className="inline-flex items-center gap-1 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={selectedFilters[filterCategory].includes(value)}
//                 onChange={() => handleCheckboxChange(filterCategory, value)}
//               />
//               <span>{value}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 border rounded max-w-xs">
//       {renderFilterSection('Gender', 'gender')}
//       {renderFilterSection('Occasion', 'occasion')}
//       {renderFilterSection('Type', 'type')}
//       {renderFilterSection('Category', 'category')}
//       {renderFilterSection('Subcategory', 'subCategory')}
//       {renderFilterSection('Tags', 'filterTags')}
//     </div>
//   );
// };

// export default FilterPanel;


// import React, { useState, useEffect, useContext } from 'react';
// import { ShopContext } from '../context/ShopContext';

// const FilterPanel = ({ onFilterChange, selectedFilters }) => {
//   const { fetchDynamicFilters } = useContext(ShopContext);
//   const [filterOptions, setFilterOptions] = useState(null);
  
//   useEffect(() => {
//     const loadFilters = async () => {
//       const category = selectedFilters.category[0] || null;
//       const filters = await fetchDynamicFilters(category);
//       setFilterOptions(filters);
//     };
    
//     loadFilters();
//   }, [selectedFilters.category]);

//   const handleFilterChange = (filterType, value) => {
//     const newFilters = { ...selectedFilters };
    
//     // Toggle filter selection
//     if (newFilters[filterType].includes(value)) {
//       newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
//     } else {
//       newFilters[filterType].push(value);
//     }
    
//     onFilterChange(newFilters);
//   };

//   if (!filterOptions) return <div>Loading filters...</div>;

//   return (
//     <div className="w-64 space-y-6">
//       {/* Category Filter */}
//       <div>
//         <h3 className="font-semibold mb-2">Categories</h3>
//         {filterOptions.category.map(cat => (
//           <div key={cat} className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={selectedFilters.category.includes(cat)}
//               onChange={() => handleFilterChange('category', cat)}
//               className="mr-2"
//             />
//             <span className="capitalize">{cat}</span>
//           </div>
//         ))}
//       </div>

//       {/* Subcategory Filter */}
//       {selectedFilters.category.length > 0 && (
//         <div>
//           <h3 className="font-semibold mb-2">Subcategories</h3>
//           {filterOptions.subCategoryMap[selectedFilters.category[0]]?.map(subCat => (
//             <div key={subCat} className="flex items-center mb-1">
//               <input
//                 type="checkbox"
//                 checked={selectedFilters.subCategory.includes(subCat)}
//                 onChange={() => handleFilterChange('subCategory', subCat)}
//                 className="mr-2"
//               />
//               <span className="capitalize">{subCat}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Occasion Filter */}
//       <div>
//         <h3 className="font-semibold mb-2">Occasion</h3>
//         {filterOptions.occasion.map(occ => (
//           <div key={occ} className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={selectedFilters.occasion.includes(occ)}
//               onChange={() => handleFilterChange('occasion', occ)}
//               className="mr-2"
//             />
//             <span className="capitalize">{occ}</span>
//           </div>
//         ))}
//       </div>

//       {/* Type Filter */}
//       <div>
//         <h3 className="font-semibold mb-2">Type</h3>
//         {filterOptions.type.map(t => (
//           <div key={t} className="flex items-center mb-1">
//             <input
//               type="checkbox"
//               checked={selectedFilters.type.includes(t)}
//               onChange={() => handleFilterChange('type', t)}
//               className="mr-2"
//             />
//             <span className="capitalize">{t}</span>
//           </div>
//         ))}
//       </div>

//       {/* Filter Tags */}
//       <div>
//         <h3 className="font-semibold mb-2">Tags</h3>
//         <div className="flex flex-wrap gap-2">
//           {filterOptions.filterTags.map(tag => (
//             <button
//               key={tag}
//               type="button"
//               onClick={() => handleFilterChange('filterTags', tag)}
//               className={`px-2 py-1 text-sm rounded ${
//                 selectedFilters.filterTags.includes(tag)
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-gray-200'
//               }`}
//             >
//               {tag}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterPanel;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterPanel = ({ backendUrl, onFilterChange, selectedCategory, selectedFilters }) => {
  const [dynamicFilters, setDynamicFilters] = useState({
    gender: [],
    category: [],
    subCategoryMap: {},
    occasion: [],
    type: [],
    filterTags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDynamicFilters();
  }, []);

  const fetchDynamicFilters = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/filter/dynamic`);
      if (response.data.success) {
        setDynamicFilters(response.data.filters);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dynamic filters:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value, isChecked) => {
    const newFilters = { ...selectedFilters };
    
    if (isChecked) {
      if (!newFilters[filterType].includes(value)) {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
    } else {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    }

    // If category changes, clear subcategory selections
    if (filterType === 'category') {
      newFilters.subCategory = [];
    }

    onFilterChange(newFilters);
  };

  const getAvailableSubCategories = () => {
    if (selectedFilters.category.length === 0) return [];
    
    let allSubCategories = [];
    selectedFilters.category.forEach(category => {
      const subCats = dynamicFilters.subCategoryMap[category] || [];
      allSubCategories = [...allSubCategories, ...subCats];
    });
    
    return [...new Set(allSubCategories)]; // Remove duplicates
  };

  if (loading) {
    return <div className="w-64 p-4">Loading filters...</div>;
  }

  return (
    <div className="w-64 p-4 border-r bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      {/* Clear All Filters */}
      <button
        onClick={() => onFilterChange({
          gender: [],
          occasion: [],
          type: [],
          category: [],
          subCategory: [],
          filterTags: []
        })}
        className="mb-4 text-sm text-blue-600 hover:text-blue-800"
      >
        Clear All Filters
      </button>

      {/* Gender Filter */}
      {dynamicFilters.gender.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Gender</h4>
          {dynamicFilters.gender.map(gender => (
            <label key={gender} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.gender.includes(gender.toLowerCase())}
                onChange={(e) => handleFilterChange('gender', gender.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{gender}</span>
            </label>
          ))}
        </div>
      )}

      {/* Category Filter */}
      {dynamicFilters.category.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Category</h4>
          {dynamicFilters.category.map(category => (
            <label key={category} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.category.includes(category.toLowerCase())}
                onChange={(e) => handleFilterChange('category', category.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      )}

      {/* Sub Category Filter - Only show when categories are selected */}
      {selectedFilters.category.length > 0 && getAvailableSubCategories().length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Sub Category</h4>
          {getAvailableSubCategories().map(subCategory => (
            <label key={subCategory} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.subCategory.includes(subCategory.toLowerCase())}
                onChange={(e) => handleFilterChange('subCategory', subCategory.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{subCategory}</span>
            </label>
          ))}
        </div>
      )}

      {/* Occasion Filter */}
      {dynamicFilters.occasion.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Occasion</h4>
          {dynamicFilters.occasion.map(occasion => (
            <label key={occasion} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.occasion.includes(occasion.toLowerCase())}
                onChange={(e) => handleFilterChange('occasion', occasion.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{occasion}</span>
            </label>
          ))}
        </div>
      )}

      {/* Type Filter */}
      {dynamicFilters.type.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Type</h4>
          {dynamicFilters.type.map(type => (
            <label key={type} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.type.includes(type.toLowerCase())}
                onChange={(e) => handleFilterChange('type', type.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      )}

      {/* Dynamic Filter Tags */}
      {dynamicFilters.filterTags.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Tags</h4>
          {dynamicFilters.filterTags.map(tag => (
            <label key={tag} className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.filterTags.includes(tag.toLowerCase())}
                onChange={(e) => handleFilterChange('filterTags', tag.toLowerCase(), e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">{tag}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;