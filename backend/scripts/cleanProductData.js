import productModel from '../models/productModel.js';
import connectDB from '../config/mongodb.js';

const cleanProductData = async () => {
  try {

    connectDB()
    const products = await productModel.find({});

    for (const product of products) {
      let updated = false;

      // Clean gender field
      if (typeof product.gender === 'string') {
        const cleanedGender = product.gender.replace(/["']/g, '').trim().toLowerCase();
        if (cleanedGender !== product.gender) {
          product.gender = cleanedGender;
          updated = true;
        }
      }

      // Clean category field
      if (typeof product.category === 'string') {
        try {
          let cleanedCategory = product.category.replace(/["']/g, '').trim().toLowerCase();
          // Remove gender values from category if present
          const genderValues = ['men', 'women', 'children'];
          if (genderValues.includes(cleanedCategory)) {
            cleanedCategory = '';
          }
          if (cleanedCategory !== product.category) {
            product.category = cleanedCategory;
            updated = true;
          }
        } catch (error) {
          console.error('Error cleaning category for product', product._id, error);
        }
      }

      // Clean subCategory field
      if (typeof product.subCategory === 'string') {
        const cleanedSubCategory = product.subCategory.replace(/["']/g, '').trim().toLowerCase();
        if (cleanedSubCategory !== product.subCategory) {
          product.subCategory = cleanedSubCategory;
          updated = true;
        }
      }

      // Clean occasion array
      if (Array.isArray(product.occasion)) {
        const cleanedOccasion = product.occasion.map(item => item.replace(/["']/g, '').trim().toLowerCase());
        if (JSON.stringify(cleanedOccasion) !== JSON.stringify(product.occasion)) {
          product.occasion = cleanedOccasion;
          updated = true;
        }
      }

      // Clean type array
      if (Array.isArray(product.type)) {
        const cleanedType = product.type.map(item => item.replace(/["']/g, '').trim().toLowerCase());
        if (JSON.stringify(cleanedType) !== JSON.stringify(product.type)) {
          product.type = cleanedType;
          updated = true;
        }
      }

      // Clean filterTags array
      if (Array.isArray(product.filterTags)) {
        const cleanedFilterTags = product.filterTags.map(item => item.replace(/["']/g, '').trim().toLowerCase());
        if (JSON.stringify(cleanedFilterTags) !== JSON.stringify(product.filterTags)) {
          product.filterTags = cleanedFilterTags;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        console.log(`Cleaned product ${product._id}`);
      }
    }

    console.log('Product data cleaning completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning product data:', error);
    process.exit(1);
  }
};

cleanProductData();
