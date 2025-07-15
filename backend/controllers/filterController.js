import filterModel from "../models/filterModel.js";
import productModel from "../models/productModel.js";

// Add a new filter
const addFilter = async (req, res) => {
  try {
    const { name, displayName, description, type, filterType, values, applicableCategories, sortOrder } = req.body;
    
    if (!name || !displayName || !values || !Array.isArray(values) || values.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid input. Name, displayName, and values are required." });
    }

    // Check if filter already exists
    const existingFilter = await filterModel.findOne({ name });
    if (existingFilter) {
      return res.status(400).json({ success: false, message: "Filter with this name already exists" });
    }

    // Validate filter values format
    const formattedValues = values.map(val => {
      if (typeof val === 'string') {
        return { value: val, displayName: val, isActive: true };
      } else if (typeof val === 'object' && val.value && val.displayName) {
        return { ...val, isActive: val.isActive !== false };
      } else {
        throw new Error('Invalid value format');
      }
    });

    const newFilter = new filterModel({ 
      name,
      displayName,
      description,
      type: type || 'global',
      filterType: filterType || 'multi-select',
      values: formattedValues,
      applicableCategories: applicableCategories || [],
      sortOrder: sortOrder || 0,
      updatedAt: new Date()
    });
    
    await newFilter.save();

    res.json({ success: true, message: "Filter added successfully", filter: newFilter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all filters
const getAllFilters = async (req, res) => {
  try {
    const filters = await filterModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, filters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get filters for a specific category
const getFiltersForCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Get global filters and category-specific filters
    const filters = await filterModel.find({
      isActive: true,
      $or: [
        { type: 'global' },
        { type: 'category-specific', applicableCategories: category }
      ]
    }).sort({ sortOrder: 1, name: 1 });

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
    const { displayName, description, values, applicableCategories, sortOrder, isActive } = req.body;
    
    const filter = await filterModel.findById(id);
    if (!filter) {
      return res.status(404).json({ success: false, message: "Filter not found" });
    }

    if (displayName) filter.displayName = displayName;
    if (description !== undefined) filter.description = description;
    if (applicableCategories) filter.applicableCategories = applicableCategories;
    if (sortOrder !== undefined) filter.sortOrder = sortOrder;
    if (isActive !== undefined) filter.isActive = isActive;
    
    if (values && Array.isArray(values)) {
      const formattedValues = values.map(val => {
        if (typeof val === 'string') {
          return { value: val, displayName: val, isActive: true };
        } else if (typeof val === 'object' && val.value && val.displayName) {
          return { ...val, isActive: val.isActive !== false };
        } else {
          throw new Error('Invalid value format');
        }
      });
      filter.values = formattedValues;
    }

    filter.updatedAt = new Date();
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

// Get dynamic filters from actual product data
const getDynamicFilters = async (req, res) => {
  try {
    const { gender, category, subCategory } = req.query;

    // Build match object for filtering products
    const match = {};
    if (gender) match.gender = { $in: gender.split(',') };
    if (category) match.category = { $in: category.split(',') };
    if (subCategory) match.subCategory = { $in: subCategory.split(',') };

    // Get distinct values from products
    const [
      genders,
      categories,
      subCategories,
      occasions,
      types,
      filterTags,
    ] = await Promise.all([
      productModel.distinct("gender", match),
      productModel.distinct("category", match),
      productModel.distinct("subCategory", match),
      productModel.distinct("occasion", match),
      productModel.distinct("type", match),
      productModel.distinct("filterTags", match),
    ]);

    // Get size information by aggregating all products
    const sizesResult = await productModel.aggregate([
      { $match: match },
      { $unwind: "$sizes" },
      { $group: { _id: null, sizes: { $addToSet: "$sizes" } } }
    ]);
    const sizes = sizesResult.length > 0 ? sizesResult[0].sizes : [];

    // Get price ranges
    const priceResult = await productModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    const priceRange = priceResult.length > 0 ? priceResult[0] : { minPrice: 0, maxPrice: 10000 };

    // Clean and format the data
    const cleanArray = (arr) => {
      return [...new Set(arr.filter(item => item && item.toString().trim() !== ''))];
    };

    res.json({
      success: true,
      filters: {
        gender: cleanArray(genders),
        category: cleanArray(categories),
        subCategory: cleanArray(subCategories),
        occasion: cleanArray(occasions.flat()),
        type: cleanArray(types.flat()),
        filterTags: cleanArray(filterTags.flat()),
        sizes: cleanArray(sizes),
        priceRange
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initialize default filters
const initializeDefaultFilters = async (req, res) => {
  try {
    const defaultFilters = [
      {
        name: 'gender',
        displayName: 'Gender',
        description: 'Product gender classification',
        type: 'global',
        filterType: 'single-select',
        values: [
          { value: 'Women', displayName: 'Women' },
          { value: 'Men', displayName: 'Men' },
          { value: 'Children', displayName: 'Children' }
        ],
        sortOrder: 1
      },
      {
        name: 'color',
        displayName: 'Color',
        description: 'Product colors',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'Red', displayName: 'Red', colorCode: '#FF0000' },
          { value: 'Blue', displayName: 'Blue', colorCode: '#0000FF' },
          { value: 'Green', displayName: 'Green', colorCode: '#008000' },
          { value: 'Yellow', displayName: 'Yellow', colorCode: '#FFFF00' },
          { value: 'Pink', displayName: 'Pink', colorCode: '#FFC0CB' },
          { value: 'Purple', displayName: 'Purple', colorCode: '#800080' },
          { value: 'Black', displayName: 'Black', colorCode: '#000000' },
          { value: 'White', displayName: 'White', colorCode: '#FFFFFF' },
          { value: 'Orange', displayName: 'Orange', colorCode: '#FFA500' },
          { value: 'Brown', displayName: 'Brown', colorCode: '#A52A2A' }
        ],
        sortOrder: 2
      },
      {
        name: 'size',
        displayName: 'Size',
        description: 'Product sizes',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'XS', displayName: 'Extra Small' },
          { value: 'S', displayName: 'Small' },
          { value: 'M', displayName: 'Medium' },
          { value: 'L', displayName: 'Large' },
          { value: 'XL', displayName: 'Extra Large' },
          { value: 'XXL', displayName: '2XL' },
          { value: '3XL', displayName: '3XL' },
          { value: 'Free Size', displayName: 'Free Size' }
        ],
        sortOrder: 3
      },
      {
        name: 'occasion',
        displayName: 'Occasion',
        description: 'Suitable occasions for the product',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'Casual', displayName: 'Casual' },
          { value: 'Party', displayName: 'Party' },
          { value: 'Wedding', displayName: 'Wedding' },
          { value: 'Office', displayName: 'Office' },
          { value: 'Festival', displayName: 'Festival' },
          { value: 'Beach', displayName: 'Beach' },
          { value: 'Travel', displayName: 'Travel' }
        ],
        sortOrder: 4
      },
      {
        name: 'type',
        displayName: 'Type',
        description: 'Product type/style',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'Plain', displayName: 'Plain' },
          { value: 'Printed', displayName: 'Printed' },
          { value: 'Embroidered', displayName: 'Embroidered' },
          { value: 'Designer', displayName: 'Designer' },
          { value: 'Embellished', displayName: 'Embellished' }
        ],
        sortOrder: 5
      },
      {
        name: 'material',
        displayName: 'Material',
        description: 'Product material/fabric',
        type: 'global',
        filterType: 'multi-select',
        values: [
          { value: 'Cotton', displayName: 'Cotton' },
          { value: 'Silk', displayName: 'Silk' },
          { value: 'Polyester', displayName: 'Polyester' },
          { value: 'Georgette', displayName: 'Georgette' },
          { value: 'Chiffon', displayName: 'Chiffon' },
          { value: 'Rayon', displayName: 'Rayon' },
          { value: 'Linen', displayName: 'Linen' },
          { value: 'Denim', displayName: 'Denim' }
        ],
        sortOrder: 6
      }
    ];

    for (const filterData of defaultFilters) {
      const existingFilter = await filterModel.findOne({ name: filterData.name });
      if (!existingFilter) {
        await filterModel.create(filterData);
        console.log(`✅ Filter ${filterData.displayName} created`);
      }
    }

    res.json({ success: true, message: "Default filters initialized successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  addFilter, 
  getAllFilters, 
  getFiltersForCategory, 
  updateFilter, 
  deleteFilter, 
  getDynamicFilters,
  initializeDefaultFilters 
};
