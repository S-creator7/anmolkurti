import mongoose from 'mongoose';
import productModel from '../models/productModel.js';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const normalizeString = (str) => {
  if (!str || typeof str !== 'string') return null;
  return str.trim();
};

const normalizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => (typeof item === 'string' ? item.trim() : null))
    .filter(item => item && item.length > 0);
};

async function cleanProductData() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const products = await productModel.find({});

    for (const product of products) {
      let updated = false;

      // Normalize strings
      const gender = normalizeString(product.gender);
      if (gender !== product.gender) {
        product.gender = gender;
        updated = true;
      }

      const category = normalizeString(product.category);
      if (category !== product.category) {
        product.category = category;
        updated = true;
      }

      const subCategory = normalizeString(product.subCategory);
      if (subCategory !== product.subCategory) {
        product.subCategory = subCategory;
        updated = true;
      }

      // Normalize arrays
      const occasion = normalizeArray(product.occasion);
      if (JSON.stringify(occasion) !== JSON.stringify(product.occasion)) {
        product.occasion = occasion;
        updated = true;
      }

      const type = normalizeArray(product.type);
      if (JSON.stringify(type) !== JSON.stringify(product.type)) {
        product.type = type;
        updated = true;
      }

      const filterTags = normalizeArray(product.filterTags);
      if (JSON.stringify(filterTags) !== JSON.stringify(product.filterTags)) {
        product.filterTags = filterTags;
        updated = true;
      }

      if (updated) {
        await product.save();
        console.log(`Updated product ${product._id}`);
      }
    }

    console.log('Product data cleaning completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning product data:', error);
    process.exit(1);
  }
}

cleanProductData();
