import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js"

// function for add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, gender, category, subCategory, occasion, type, filterTags, sizes, bestseller, stock, hasSize, filters } = req.body

    const image1 = req.files.image1 && req.files.image1[0]
    const image2 = req.files.image2 && req.files.image2[0]
    const image3 = req.files.image3 && req.files.image3[0]
    const image4 = req.files.image4 && req.files.image4[0]

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
          transformation: [
            { fetch_format: "auto", quality: "auto" },
            { width: 1080, height: 1080, crop: "limit" }  // Optimize format and quality
          ],
        });
        return result.secure_url
      })
    )
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
      name,
      description,
      gender,
      category,
      price: Number(price),
      subCategory,
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

    console.log(productData);

    const product = new productModel(productData);
    await product.save()

    res.json({ success: true, message: "Product Added" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//add stock alert subscription
const addStockAlert = async (req, res) => {
  try {
    const { productId, email } = req.body;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Add email if not already subscribed
    if (!product.stockAlerts.includes(email)) {
      product.stockAlerts.push(email);
      await product.save();
    }
    res.json({ success: true, message: "You'll be notified when back in stock" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// function for list product
const listProducts = async (req, res) => {
  try {

    const products = await productModel.find({});
    res.json({ success: true, products })

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

export { listProducts, addProduct, removeProduct, singleProduct, addStockAlert, getFilterValues, getBestsellerProducts }
