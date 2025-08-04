import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js"

// Enhanced image upload with compression and validation
const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'image',
      transformation: [
        { fetch_format: "auto", quality: "auto:good" }, // Better compression
        { width: 1200, height: 1200, crop: "limit" },   // Optimized size
        { gravity: "auto", crop: "fill" }                // Smart cropping
      ],
      ...options
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Validate image file
const validateImageFile = (file) => {
  if (!file) return false;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('Image size too large. Maximum size is 5MB.');
  }
  
  return true;
};

// function for add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, gender, category, subCategory, occasion, type, filterTags, sizes, bestseller, stock, hasSize, filters } = req.body

    // Validate required fields
    if (!name || !description || !price || !gender || !category) {
      return res.json({ success: false, message: "All required fields must be filled" });
    }

    // Safely handle file uploads with validation
    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

    // Validate all images
    for (const image of images) {
      validateImageFile(image);
    }

    let imagesUrl = []
    if (images.length > 0) {
      try {
        imagesUrl = await Promise.all(
          images.map(async (item, index) => {
            console.log(`Uploading image ${index + 1}...`);
            return await uploadImageToCloudinary(item, {
              public_id: `anmol_kurtis/${Date.now()}_${index + 1}`,
              folder: 'products'
            });
          })
        )
        console.log('All images uploaded successfully');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.json({ success: false, message: uploadError.message });
      }
    }

    // Validate at least one image is uploaded
    if (imagesUrl.length === 0) {
      return res.json({ success: false, message: "At least one product image is required" });
    }

    const stockObj = stock ? JSON.parse(stock) : {};
    const filtersObj = filters ? JSON.parse(filters) : {};
    const occasionArr = occasion ? JSON.parse(occasion) : [];
    const typeArr = type ? JSON.parse(type) : [];
    const filterTagsArr = filterTags ? JSON.parse(filterTags) : [];

    let normalizedStock = stockObj;
    let parsedSizes = JSON.parse(sizes);

    if (hasSize === "false" || hasSize === false) {
      // For no size products, normalize stock to number if stockObj has value key
      if (typeof stockObj === 'object' && stockObj !== null && 'value' in stockObj) {
        normalizedStock = Number(stockObj.value);
      }
      parsedSizes = [];
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      gender,
      category,
      price: Number(price),
      subCategory: subCategory?.trim() || '',
      occasion: occasionArr,
      type: typeArr,
      filterTags: filterTagsArr,
      bestseller: bestseller === "true" ? true : false,
      hasSize: hasSize === "true" || hasSize === true,
      sizes: parsedSizes,
      stock: normalizedStock,
      image: imagesUrl,
      date: Date.now(),
      stockAlerts: [], // Initialize alerts array
      filters: filtersObj
    }

    console.log('Creating product with data:', productData);

    const product = new productModel(productData);
    await product.save()

    res.json({ success: true, message: "Product Added Successfully" })

  } catch (error) {
    console.log('Product creation error:', error)
    res.json({ success: false, message: error.message })
  }
}

export const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      gender,
      category,
      subCategory,
      occasion,
      type,
      filterTags,
      bestseller,
      stock,
      hasSize,
      sizes,
      filters
    } = req.body;

    if (!name || !price || !category || !gender) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const occasionArr = typeof occasion === "string" ? JSON.parse(occasion) : occasion || [];
    const typeArr = typeof type === "string" ? JSON.parse(type) : type || [];
    const filterTagsArr = typeof filterTags === "string" ? JSON.parse(filterTags) : filterTags || [];
    const sizesArr = typeof sizes === "string" ? JSON.parse(sizes) : sizes || [];
    const filtersObj = typeof filters === "string" ? JSON.parse(filters) : filters || {};
    const stockParsed = typeof stock === "string" ? JSON.parse(stock) : stock || {};

    let normalizedStock = stockParsed;
    if (hasSize === "false" || hasSize === false) {
      if (typeof stockParsed === 'object' && stockParsed !== null && 'value' in stockParsed) {
        normalizedStock = Number(stockParsed.value);
      }
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || '',
      gender,
      category,
      subCategory: subCategory?.trim() || '',
      price: Number(price),
      occasion: occasionArr,
      type: typeArr,
      filterTags: filterTagsArr,
      bestseller: bestseller === "true" || bestseller === true,
      hasSize: hasSize === "true" || hasSize === true,
      sizes: sizesArr,
      stock: normalizedStock,
      filters: filtersObj
    };

    const updated = await productModel.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: updated });

  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};


//add stock alert subscription
const addStockAlert = async (req, res) => {
  try {
    const { productId, email } = req.body;
    
    // Validate inputs
    if (!productId || !email) {
      return res.json({ success: false, message: "Product ID and email are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: "Please provide a valid email address" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Check if product is already in stock
    let isInStock = false;
    if (product.hasSize) {
      // Check if any size has stock
      for (const size of product.sizes) {
        const sizeStock = product.stock.get ? product.stock.get(size) : product.stock[size];
        if ((sizeStock || 0) > 0) {
          isInStock = true;
          break;
        }
      }
    } else {
      // Check stock for products without sizes
      const totalStock = typeof product.stock === 'number' ? product.stock : 0;
      isInStock = totalStock > 0;
    }

    if (isInStock) {
      return res.json({ success: false, message: "Product is already in stock" });
    }

    // Add email if not already subscribed
    if (!product.stockAlerts.includes(email)) {
      product.stockAlerts.push(email);
      await product.save();
      res.json({ success: true, message: "You'll be notified when back in stock" });
    } else {
      res.json({ success: true, message: "You're already subscribed to stock alerts for this product" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// ✅ New function to validate stock for multiple items
const validateStock = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Items array is required" });
    }

    const stockIssues = [];
    const validatedItems = [];

    for (const item of items) {
      const { _id, quantity, size } = item;
      
      if (!_id || !quantity || quantity <= 0) {
        stockIssues.push({ itemId: _id, message: "Invalid item data" });
        continue;
      }

      const product = await productModel.findById(_id);
      if (!product) {
        stockIssues.push({ itemId: _id, message: `Product not found` });
        continue;
      }

      let availableStock = 0;
      if (product.hasSize) {
        if (!size) {
          stockIssues.push({ itemId: _id, message: `Size required for ${product.name}` });
          continue;
        }
        availableStock = product.stock?.[size] || 0;
      } else {
        availableStock = typeof product.stock === 'number' ? product.stock : 0;
      }

      if (availableStock <= 0) {
        stockIssues.push({ 
          itemId: _id, 
          size: size || null,
          message: `${product.name}${size ? ` (Size: ${size})` : ''} is out of stock` 
        });
      } else if (quantity > availableStock) {
        stockIssues.push({ 
          itemId: _id, 
          size: size || null,
          message: `Only ${availableStock} available for ${product.name}${size ? ` (Size: ${size})` : ''}` 
        });
      } else {
        validatedItems.push({
          itemId: _id,
          size: size || null,
          quantity,
          availableStock,
          productName: product.name
        });
      }
    }

    if (stockIssues.length > 0) {
      return res.json({ 
        success: false, 
        message: "Stock validation failed",
        stockIssues,
        validatedItems
      });
    }

    return res.json({ 
      success: true, 
      message: "All items have sufficient stock",
      validatedItems 
    });

  } catch (error) {
    console.error('Stock validation error:', error);
    res.json({ success: false, message: error.message });
  }
}

// function for list product with pagination and filtering
const listProducts = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      gender, 
      occasion, 
      type, 
      category, 
      subCategory, 
      filterTags, 
      search,
      sort = 'relavent'
    } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // Helper to create case-insensitive regex array for string fields
    const createRegexArray = (values) => {
      return values.map(value => new RegExp(`^${value}$`, 'i'));
    };

    // Enhanced search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { gender: searchRegex },
        { occasion: { $in: [searchRegex] } },
        { type: { $in: [searchRegex] } },
        { filterTags: { $in: [searchRegex] } }
      ];
    }

    // Apply other filters
    if (gender) filter.gender = { $in: createRegexArray(gender.split(',')) };
    if (occasion) filter.occasion = { $in: occasion.split(',') };
    if (type) filter.type = { $in: type.split(',') };
    if (category) filter.category = { $in: createRegexArray(category.split(',')) };
    if (subCategory) filter.subCategory = { $in: createRegexArray(subCategory.split(',')) };
    if (filterTags) filter.filterTags = { $in: filterTags.split(',') };

    const total = await productModel.countDocuments(filter);

    // Enhanced sorting options
    let sortObj = {};
    switch (sort) {
      case 'low-high':
        sortObj = { price: 1 };
        break;
      case 'high-low':
        sortObj = { price: -1 };
        break;
      case 'newest':
        sortObj = { date: -1 };
        break;
      case 'oldest':
        sortObj = { date: 1 };
        break;
      case 'bestseller':
        sortObj = { bestseller: -1, date: -1 };
        break;
      case 'name-asc':
        sortObj = { name: 1 };
        break;
      case 'name-desc':
        sortObj = { name: -1 };
        break;
      case 'relavent':
      default:
        // For search results, show relevant results first, then by date
        if (search && search.trim()) {
          sortObj = { date: -1 };
        } else {
          sortObj = { bestseller: -1, date: -1 };
        }
        break;
    }

    const products = await productModel.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total,
      hasResults: products.length > 0,
      searchTerm: search || null
    });

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getFilterValues = async (req, res) => {
  try {
    const products = await productModel.find({});

    const genders = new Set();
    const categories = new Set();
    const subCategories = new Set();
    const occasions = new Set();
    const types = new Set();
    const filterTags = new Set();

    products.forEach(product => {
      // Normalize and trim strings, convert to consistent casing
      if (product.gender && typeof product.gender === 'string') {
        genders.add(product.gender.trim().toLowerCase());
      }
      if (product.category && typeof product.category === 'string') {
        categories.add(product.category.trim().toLowerCase());
      }
      if (product.subCategory && typeof product.subCategory === 'string') {
        subCategories.add(product.subCategory.trim().toLowerCase());
      }
      if (Array.isArray(product.occasion)) {
        product.occasion.forEach(o => {
          if (typeof o === 'string') occasions.add(o.trim().toLowerCase());
        });
      }
      if (Array.isArray(product.type)) {
        product.type.forEach(t => {
          if (typeof t === 'string') types.add(t.trim().toLowerCase());
        });
      }
      if (Array.isArray(product.filterTags)) {
        product.filterTags.forEach(tag => {
          if (typeof tag === 'string') filterTags.add(tag.trim().toLowerCase());
        });
      }
    });

    // Convert sets to arrays and capitalize first letter for display
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const formatArray = (arr) => Array.from(arr).map(capitalize).sort();

    res.json({
      success: true,
      filters: {
        gender: formatArray(genders),
        category: formatArray(categories),
        subCategory: formatArray(subCategories),
        occasion: formatArray(occasions),
        type: formatArray(types),
        filterTags: formatArray(filterTags)
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    const productId = req.body.id;

    await productModel.findByIdAndDelete(productId);

    await userModel.updateMany(
      { [`cartData.${productId}`]: { $exists: true } },
      { $unset: { [`cartData.${productId}`]: "" } }
    );

    res.json({ success: true, message: "Product removed from database and all user carts." });

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// function for single product info
const singleProduct = async (req, res) => {
  try {

    const { productId } = req.body
    const product = await productModel.findById(productId)
    res.json({ success: true, product })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getBestsellerProducts = async (req, res) => {
  try {
    const bestsellers = await productModel.find({ bestseller: true });

    // Map products to include totalQuantity and totalRevenue with default 0
    const bestsellersWithSales = bestsellers.map(product => ({
      _id: product._id,
      productName: product.name,
      category: product.category,
      price: product.price,
      totalQuantity: 0, // Placeholder, as no sales data available here
      totalRevenue: 0   // Placeholder
    }));

    res.json({ success: true, bestsellers: bestsellersWithSales });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export const getLowStockProducts = async (req, res) => {
  try {
    const lowStockThreshold = 5;

    // Find products with stock less than threshold
    const lowStockProducts = await productModel.find({
      $or: [
        { 
          hasSize: true,
          $expr: {
            $lt: [
              { $min: { $objectToArray: "$stock.v" } }, // This is complex, so we will handle in JS below
              lowStockThreshold
            ]
          }
        },
        { 
          hasSize: false,
          stock: { $lt: lowStockThreshold }
        }
      ]
    });

    // Since MongoDB query for min stock in object is complex, fallback to filtering in JS
    const filteredLowStockProducts = lowStockProducts.filter(product => {
      if (product.hasSize) {
        return Object.values(product.stock || {}).some(stockQty => stockQty < lowStockThreshold);
      } else {
        return product.stock < lowStockThreshold;
      }
    });

    res.json({ success: true, products: filteredLowStockProducts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Manual trigger for stock alerts (for testing)
const triggerStockAlerts = async (req, res) => {
  try {
    const { checkStockAlerts } = await import('../services/stockAlertChecker.js');
    await checkStockAlerts();
    res.json({ success: true, message: "Stock alerts checked and processed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ New function to get current stock levels (for admin monitoring)
const getStockLevels = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    let query = {};
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      query._id = { $in: productIds };
    }

    const products = await productModel.find(query, {
      _id: 1,
      name: 1,
      hasSize: 1,
      sizes: 1,
      stock: 1
    });

    const stockData = products.map(product => {
      const stockInfo = {
        productId: product._id,
        name: product.name,
        hasSize: product.hasSize,
        stock: {}
      };

      if (product.hasSize) {
        // For products with sizes
        stockInfo.sizes = product.sizes;
        for (const size of product.sizes) {
          stockInfo.stock[size] = product.stock?.[size] || 0;
        }
        stockInfo.totalStock = Object.values(stockInfo.stock).reduce((sum, stock) => sum + stock, 0);
      } else {
        // For products without sizes
        const totalStock = typeof product.stock === 'number' ? product.stock : 0;
        stockInfo.stock = totalStock;
        stockInfo.totalStock = totalStock;
      }

      return stockInfo;
    });

    res.json({ 
      success: true, 
      message: "Stock levels retrieved successfully",
      stockData 
    });

  } catch (error) {
    console.error('Get stock levels error:', error);
    res.json({ success: false, message: error.message });
  }
}

// ✅ New function to update stock levels (admin only)
const updateStockLevels = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.json({ success: false, message: "Updates array is required" });
    }

    const results = [];
    
    for (const update of updates) {
      const { productId, stock } = update;
      
      if (!productId) {
        results.push({ productId, success: false, message: "Product ID is required" });
        continue;
      }

      const product = await productModel.findById(productId);
      if (!product) {
        results.push({ productId, success: false, message: "Product not found" });
        continue;
      }

      try {
        if (product.hasSize) {
          // For products with sizes, expect stock to be an object
          if (typeof stock !== 'object' || stock === null) {
            results.push({ productId, success: false, message: "Stock must be an object for products with sizes" });
            continue;
          }
          
          // Validate all sizes exist
          const invalidSizes = Object.keys(stock).filter(size => !product.sizes.includes(size));
          if (invalidSizes.length > 0) {
            results.push({ productId, success: false, message: `Invalid sizes: ${invalidSizes.join(', ')}` });
            continue;
          }

          // Update stock
          if (!product.stock) product.stock = {};
          for (const [size, quantity] of Object.entries(stock)) {
            product.stock[size] = Math.max(0, Number(quantity) || 0);
          }
          product.markModified('stock');
        } else {
          // For products without sizes, expect stock to be a number
          const stockValue = Number(stock);
          if (isNaN(stockValue)) {
            results.push({ productId, success: false, message: "Stock must be a number for products without sizes" });
            continue;
          }
          
          product.stock = Math.max(0, stockValue);
        }

        await product.save();
        results.push({ productId, success: true, message: "Stock updated successfully" });
        
      } catch (saveError) {
        results.push({ productId, success: false, message: `Error saving: ${saveError.message}` });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    res.json({ 
      success: failCount === 0, 
      message: `Stock update complete: ${successCount} successful, ${failCount} failed`,
      results 
    });

  } catch (error) {
    console.error('Update stock levels error:', error);
    res.json({ success: false, message: error.message });
  }
}

export { listProducts, addProduct, removeProduct, singleProduct, addStockAlert, validateStock, getStockLevels, updateStockLevels, getFilterValues, getBestsellerProducts, triggerStockAlerts }
