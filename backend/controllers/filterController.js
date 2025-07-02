import filterModel from "../models/filterModel.js";

// Add a new filter
const addFilter = async (req, res) => {
  try {
    const { category, filterName, filterValues } = req.body;
    if (!category || !filterName || !filterValues || !Array.isArray(filterValues)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const existingFilter = await filterModel.findOne({ category, filterName });
    if (existingFilter) {
      return res.status(400).json({ success: false, message: "Filter already exists for this category" });
    }

    const newFilter = new filterModel({ category, filterName, filterValues });
    await newFilter.save();

    res.json({ success: true, message: "Filter added successfully", filter: newFilter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get filters by category
const getFiltersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const filters = await filterModel.find({ category });
    res.json({ success: true, filters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all filters
const getAllFilters = async (req, res) => {
  try {
    const filters = await filterModel.find({});
    res.json({ success: true, filters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a filter
const updateFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const { filterValues } = req.body;
    if (!filterValues || !Array.isArray(filterValues)) {
      return res.status(400).json({ success: false, message: "Invalid filter values" });
    }

    const filter = await filterModel.findById(id);
    if (!filter) {
      return res.status(404).json({ success: false, message: "Filter not found" });
    }

    filter.filterValues = filterValues;
    await filter.save();

    res.json({ success: true, message: "Filter updated successfully", filter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a filter
const deleteFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = await filterModel.findByIdAndDelete(id);
    if (!filter) {
      return res.status(404).json({ success: false, message: "Filter not found" });
    }
    res.json({ success: true, message: "Filter deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

import productModel from "../models/productModel.js";
const getDynamicFilters = async (req, res) => {
  try {
    const { category } = req.query; // Add category parameter

    // Build match object if category is specified
    const match = category ? { category } : {};
    
    const [
      genders,
      categories,
      occasions,
      types,
      filterTags,
    ] = await Promise.all([
      productModel.distinct("gender", match),
      productModel.distinct("category", match),
      productModel.distinct("occasion", match),
      productModel.distinct("type", match),
      productModel.distinct("filterTags", match),
    ]);

    // For each category, get distinct subCategories
    const subCategoryMap = {};
    for (const cat of categories) {
      const subCats = await productModel.distinct("subCategory", { category: cat });
      subCategoryMap[cat.toLowerCase().trim()] = subCats.map(subCat => subCat.toLowerCase().trim());
    }

    // Flatten and normalize arrays
 const flattenAndNormalize = (arr) => {
  return [...new Set(
    arr.flat().filter(v => v && v.trim() !== '').map(v => v.toLowerCase().trim())
  )];
};
    res.json({
      success: true,
      filters: {
        gender: genders.map(g => g.toLowerCase().trim()),
        category: categories.map(c => c.toLowerCase().trim()),
        subCategoryMap,
        occasion: flattenAndNormalize(occasions),
        type: flattenAndNormalize(types),
        filterTags: flattenAndNormalize(filterTags),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// const getDynamicFilters = async (req, res) => {
//   try {
//     const [
//       genders,
//       categories,
//       occasions,
//       types,
//       filterTags,
//     ] = await Promise.all([
//       productModel.distinct("gender"),
//       productModel.distinct("category"),
//       productModel.distinct("occasion"),
//       productModel.distinct("type"),
//       productModel.distinct("filterTags"),
//     ]);

//     // For each category, get distinct subCategories
//     const subCategoryMap = {};
//     for (const category of categories) {
//       const subCats = await productModel.distinct("subCategory", { category });
//       subCategoryMap[category] = subCats;
//     }

//     // Flatten arrays for occasion, type, filterTags since they are arrays in products
//     const flattenArray = (arr) => {
//       return arr.reduce((acc, val) => acc.concat(val), []);
//     };

//     const uniqueOccasions = [...new Set(flattenArray(occasions))].filter(Boolean);
//     const uniqueTypes = [...new Set(flattenArray(types))].filter(Boolean);
//     const uniqueFilterTags = [...new Set(flattenArray(filterTags))].filter(Boolean);

//     res.json({
//       success: true,
//       filters: {
//         gender: genders,
//         category: categories,
//         subCategoryMap: subCategoryMap,
//         occasion: uniqueOccasions,
//         type: uniqueTypes,
//         filterTags: uniqueFilterTags,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export { addFilter, getFiltersByCategory, getAllFilters, getDynamicFilters, updateFilter, deleteFilter };
