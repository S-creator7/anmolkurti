import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import connectDB from '../config/mongodb.js';
import dotenv from 'dotenv';
dotenv.config();

// Sample products with proper filter data
const sampleProducts = [
  {
    name: "Elegant Silk Saree",
    description: "Beautiful traditional silk saree",
    price: 2500,
    gender: "Women",
    category: "Saree",
    subCategory: "Silk",
    occasion: ["Wedding", "Party", "Festival"],
    type: ["Embroidered", "Designer"],
    filterTags: ["Silk", "Red", "Traditional", "Premium"],
    bestseller: true,
    hasSize: false,
    stock: { value: 15 },
    image: ["sample-saree-1.jpg"],
    date: Date.now()
  },
  {
    name: "Casual Cotton Kurti",
    description: "Comfortable casual cotton kurti",
    price: 800,
    gender: "Women",
    category: "Kurti",
    subCategory: "Cotton",
    occasion: ["Casual", "Office"],
    type: ["Printed", "Plain"],
    filterTags: ["Cotton", "Blue", "Casual", "Comfortable"],
    bestseller: false,
    hasSize: true,
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 5, M: 8, L: 6, XL: 4 },
    image: ["sample-kurti-1.jpg"],
    date: Date.now()
  },
  {
    name: "Designer Anarkali Dress",
    description: "Elegant designer anarkali dress",
    price: 3500,
    gender: "Women",
    category: "Dress",
    subCategory: "Anarkali",
    occasion: ["Wedding", "Party", "Festival"],
    type: ["Embroidered", "Designer"],
    filterTags: ["Designer", "Pink", "Elegant", "Premium"],
    bestseller: true,
    hasSize: true,
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 3, M: 5, L: 4, XL: 2 },
    image: ["sample-dress-1.jpg"],
    date: Date.now()
  },
  {
    name: "Formal Cotton Shirt",
    description: "Professional formal cotton shirt",
    price: 1200,
    gender: "Men",
    category: "Shirt",
    subCategory: "Formal",
    occasion: ["Office", "Formal"],
    type: ["Plain"],
    filterTags: ["Cotton", "White", "Formal", "Professional"],
    bestseller: true,
    hasSize: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 3, M: 7, L: 9, XL: 5, XXL: 2 },
    image: ["sample-shirt-1.jpg"],
    date: Date.now()
  },
  {
    name: "Casual Denim Pants",
    description: "Comfortable casual denim pants",
    price: 1500,
    gender: "Men",
    category: "Pants",
    subCategory: "Denim",
    occasion: ["Casual"],
    type: ["Plain"],
    filterTags: ["Denim", "Blue", "Casual", "Comfortable"],
    bestseller: false,
    hasSize: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 4, M: 8, L: 10, XL: 6, XXL: 3 },
    image: ["sample-pants-1.jpg"],
    date: Date.now()
  },
  {
    name: "Designer Kids Suit",
    description: "Elegant designer suit for children",
    price: 2000,
    gender: "Children",
    category: "Suit",
    subCategory: "Designer",
    occasion: ["Wedding", "Party", "Festival"],
    type: ["Embroidered", "Designer"],
    filterTags: ["Designer", "Black", "Premium", "Kids"],
    bestseller: true,
    hasSize: true,
    sizes: ["S", "M", "L"],
    stock: { S: 4, M: 6, L: 3 },
    image: ["sample-suit-1.jpg"],
    date: Date.now()
  },
  {
    name: "Party Wear Salwar",
    description: "Beautiful party wear salwar suit",
    price: 1800,
    gender: "Women",
    category: "Salwar",
    subCategory: "Party Wear",
    occasion: ["Party", "Wedding", "Festival"],
    type: ["Embroidered", "Designer"],
    filterTags: ["Designer", "Purple", "Party", "Elegant"],
    bestseller: true,
    hasSize: true,
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 2, M: 4, L: 3, XL: 1 },
    image: ["sample-salwar-1.jpg"],
    date: Date.now()
  }
];

// Add sample products
const addSampleProducts = async () => {
  try {
    // Clear existing products
    await productModel.deleteMany({});
    console.log('Cleared existing products');

    // Add sample products
    const result = await productModel.insertMany(sampleProducts);
    console.log(`Added ${result.length} sample products`);

    // Verify the products were added
    const count = await productModel.countDocuments();
    console.log(`Total products in database: ${count}`);

    // Test dynamic filters
    const products = await productModel.find({});
    console.log('\nSample products added:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.gender}, ${product.category})`);
    });

  } catch (error) {
    console.error('Error adding sample products:', error);
  }
};

// Run the script
const run = async () => {
      console.log("uri",process.env.MONGODB_URI);

  await connectDB();
  await addSampleProducts();
  mongoose.connection.close();
  console.log('Script completed');
};

run(); 