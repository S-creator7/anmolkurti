import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Product data using the images from assets folder
const products = [
  {
    name: "Elegant Floral Print Kurti",
    description: "Beautiful cotton kurti with intricate floral prints. Perfect for casual and semi-formal occasions. Comfortable fit with 3/4 sleeves.",
    price: 899,
    image: ["http://localhost:4000/assets/p_img1.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "printed",
    occasion: ["casual", "party"],
    type: ["cotton", "floral"],
    filterTags: ["printed", "cotton", "comfortable", "trendy"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now(),
    stock: { "S": 15, "M": 20, "L": 18, "XL": 12 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Designer Embroidered Kurti Set",
    description: "Stunning embroidered kurti with matching dupatta. Premium quality fabric with intricate handwork. Perfect for festivals and special occasions.",
    price: 1599,
    image: ["http://localhost:4000/assets/p_img2.png"],
    gender: "women",
    category: "sets",
    subCategory: "embroidered",
    occasion: ["wedding", "festival", "party"],
    type: ["embroidered", "designer"],
    filterTags: ["embroidered", "premium", "handwork", "festive"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: false,
    date: Date.now() - 86400000,
    stock: { "S": 8, "M": 12, "L": 10, "XL": 6 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Casual Cotton Straight Kurti",
    description: "Simple yet elegant cotton kurti in straight cut. Perfect for daily wear and office. Breathable fabric for all-day comfort.",
    price: 699,
    image: ["http://localhost:4000/assets/p_img3.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "casual",
    occasion: ["casual", "office"],
    type: ["cotton", "straight"],
    filterTags: ["casual", "office-wear", "comfortable", "daily-wear"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 172800000,
    stock: { "S": 25, "M": 30, "L": 28, "XL": 20 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Traditional Anarkali Suit",
    description: "Classic anarkali suit with beautiful prints. Complete set with kurti, bottom, and dupatta. Perfect for traditional events.",
    price: 2299,
    image: ["http://localhost:4000/assets/p_img4.png"],
    gender: "women",
    category: "suits",
    subCategory: "anarkali",
    occasion: ["wedding", "festival", "traditional"],
    type: ["anarkali", "traditional"],
    filterTags: ["anarkali", "traditional", "complete-set", "ethnic"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 259200000,
    stock: { "S": 10, "M": 15, "L": 12, "XL": 8 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Chic A-Line Kurti",
    description: "Modern A-line kurti with contemporary design. Perfect blend of style and comfort. Suitable for both casual and formal occasions.",
    price: 999,
    image: ["http://localhost:4000/assets/p_img5.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "designer",
    occasion: ["casual", "party", "office"],
    type: ["a-line", "contemporary"],
    filterTags: ["modern", "stylish", "versatile", "chic"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: false,
    date: Date.now() - 345600000,
    stock: { "S": 12, "M": 18, "L": 15, "XL": 10 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Ethnic Block Print Kurti",
    description: "Handcrafted block print kurti with authentic ethnic design. Made from pure cotton for maximum comfort and style.",
    price: 1199,
    image: ["http://localhost:4000/assets/p_img6.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "printed",
    occasion: ["casual", "festival"],
    type: ["block-print", "handcrafted"],
    filterTags: ["block-print", "ethnic", "handcrafted", "authentic"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 432000000,
    stock: { "S": 8, "M": 14, "L": 11, "XL": 7 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Palazzo Set with Kurti",
    description: "Trendy palazzo set with matching kurti. Perfect for summer and casual outings. Comfortable and stylish combo.",
    price: 1399,
    image: ["http://localhost:4000/assets/p_img7.png"],
    gender: "women",
    category: "sets",
    subCategory: "palazzo",
    occasion: ["casual", "summer"],
    type: ["palazzo", "combo"],
    filterTags: ["palazzo", "summer-wear", "trendy", "comfortable"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: false,
    date: Date.now() - 518400000,
    stock: { "S": 10, "M": 16, "L": 13, "XL": 9 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Festive Golden Kurti",
    description: "Glamorous golden kurti with subtle shimmer. Perfect for festive occasions and celebrations. Premium fabric with elegant finish.",
    price: 1799,
    image: ["http://localhost:4000/assets/p_img8.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "festive",
    occasion: ["festival", "party", "celebration"],
    type: ["shimmer", "golden"],
    filterTags: ["festive", "golden", "shimmer", "premium"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 604800000,
    stock: { "S": 6, "M": 10, "L": 8, "XL": 5 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Simple Cotton Tunic",
    description: "Minimalist cotton tunic for everyday wear. Clean lines and comfortable fit. Perfect for casual and work environments.",
    price: 599,
    image: ["http://localhost:4000/assets/p_img9.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "casual",
    occasion: ["casual", "office"],
    type: ["tunic", "minimal"],
    filterTags: ["minimal", "everyday", "work-wear", "simple"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 691200000,
    stock: { "S": 20, "M": 25, "L": 22, "XL": 18 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Sharara Set Designer",
    description: "Elegant sharara set with heavy work kurti. Perfect for weddings and special occasions. Premium quality with detailed embroidery.",
    price: 2999,
    image: ["http://localhost:4000/assets/p_img10.png"],
    gender: "women",
    category: "sets",
    subCategory: "sharara",
    occasion: ["wedding", "party"],
    type: ["sharara", "heavy-work"],
    filterTags: ["sharara", "wedding-wear", "heavy-work", "premium"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: false,
    date: Date.now() - 777600000,
    stock: { "S": 5, "M": 8, "L": 6, "XL": 4 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Printed Kurti with Jacket",
    description: "Stylish printed kurti with matching jacket. Modern Indo-western design. Perfect for office and semi-formal events.",
    price: 1699,
    image: ["http://localhost:4000/assets/p_img11.png"],
    gender: "women",
    category: "sets",
    subCategory: "jacket-set",
    occasion: ["office", "party"],
    type: ["printed", "indo-western"],
    filterTags: ["jacket-set", "indo-western", "modern", "stylish"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: true,
    date: Date.now() - 864000000,
    stock: { "S": 9, "M": 13, "L": 11, "XL": 7 },
    stockAlerts: [],
    filters: {}
  },
  {
    name: "Boho Chic Long Kurti",
    description: "Bohemian style long kurti with unique prints. Free-flowing design for comfort and style. Perfect for casual outings.",
    price: 1099,
    image: ["http://localhost:4000/assets/p_img12.png"],
    gender: "women",
    category: "kurtis",
    subCategory: "boho",
    occasion: ["casual", "outing"],
    type: ["boho", "long"],
    filterTags: ["boho", "long-kurti", "free-flowing", "unique"],
    sizes: ["S", "M", "L", "XL"],
    hasSize: true,
    bestseller: false,
    date: Date.now() - 950400000,
    stock: { "S": 12, "M": 16, "L": 14, "XL": 10 },
    stockAlerts: [],
    filters: {}
  }
];

// Generate more products for remaining images (p_img13 to p_img52)
const generateMoreProducts = () => {
  const additionalProducts = [];
  const names = [
    "Elegant Silk Kurti", "Cotton Cambric Suit", "Georgette Party Wear", "Rayon Casual Kurti",
    "Chanderi Silk Set", "Linen Summer Kurti", "Velvet Winter Kurti", "Chiffon Festive Wear",
    "Khadi Cotton Kurti", "Crepe Silk Suit", "Muslin Casual Wear", "Brocade Wedding Set",
    "Handloom Cotton Kurti", "Designer Net Suit", "Pure Cotton Everyday", "Silk Blend Kurti",
    "Viscose Party Wear", "Cotton Slub Kurti", "Polyester Blend Set", "Organic Cotton Kurti",
    "Jacquard Designer Suit", "Modal Silk Kurti", "Hemp Cotton Casual", "Tencel Soft Kurti",
    "Bamboo Fiber Kurti", "Linen Cotton Blend", "Silk Cotton Kurti", "Rayon Crepe Set",
    "Cotton Lawn Kurti", "Poly Cotton Blend", "Viscose Rayon Kurti", "Cotton Poplin Set",
    "Dobby Cotton Kurti", "Slub Cotton Casual", "Cotton Voile Kurti", "Handwoven Cotton Set",
    "Organic Silk Kurti", "Cotton Chambray Set", "Linen Silk Blend", "Modal Cotton Kurti"
  ];

  const descriptions = [
    "Premium quality ethnic wear with modern touches. Perfect blend of tradition and contemporary style.",
    "Comfortable and stylish outfit for daily wear. Made from breathable fabric for all-day comfort.",
    "Elegant design suitable for special occasions. Features intricate details and superior craftsmanship.",
    "Casual yet chic outfit perfect for everyday styling. Versatile piece for multiple occasions.",
    "Festive wear with traditional elements. Designed to make you stand out at celebrations.",
    "Modern cut with ethnic appeal. Perfect for office and casual meetings.",
    "Trendy design with comfortable fit. Ideal for young and fashion-forward women.",
    "Classic style with contemporary updates. Timeless piece for your wardrobe."
  ];

  const categories = ["kurtis", "sets", "suits"];
  const subCategories = ["printed", "embroidered", "casual", "designer", "festive"];
  const occasions = [["casual", "office"], ["party", "festival"], ["wedding", "celebration"], ["casual", "daily"]];
  const types = [["cotton", "comfortable"], ["silk", "premium"], ["printed", "stylish"], ["embroidered", "traditional"]];

  for (let i = 13; i <= 52; i++) {
    const randomIndex = (i - 13) % names.length;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
    const occasionSet = occasions[Math.floor(Math.random() * occasions.length)];
    const typeSet = types[Math.floor(Math.random() * types.length)];
    
    const product = {
      name: names[randomIndex],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      price: Math.floor(Math.random() * 2000) + 500, // Random price between 500-2500
      image: [`http://localhost:4000/assets/p_img${i}.png`],
      gender: "women",
      category: category,
      subCategory: subCategory,
      occasion: occasionSet,
      type: typeSet,
      filterTags: [...typeSet, subCategory, "women"],
      sizes: ["S", "M", "L", "XL"],
      hasSize: true,
      bestseller: Math.random() > 0.7, // 30% chance of being bestseller
      date: Date.now() - (i * 86400000), // Spread dates over time
      stock: {
        "S": Math.floor(Math.random() * 20) + 5,
        "M": Math.floor(Math.random() * 25) + 10,
        "L": Math.floor(Math.random() * 20) + 8,
        "XL": Math.floor(Math.random() * 15) + 5
      },
      stockAlerts: [],
      filters: {}
    };
    
    additionalProducts.push(product);
  }
  
  return additionalProducts;
};

// Combine base products with generated ones
const allProducts = [...products, ...generateMoreProducts()];

// Connect to MongoDB and seed products
const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const deleteResult = await productModel.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing products`);

    // Insert new products
    const insertResult = await productModel.insertMany(allProducts);
    console.log(`✅ Successfully seeded ${insertResult.length} products`);

    // Show summary
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    
    const stats = await productModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          bestsellers: { $sum: { $cond: ["$bestseller", 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} products (Avg: ₹${Math.round(stat.avgPrice)}, Bestsellers: ${stat.bestsellers})`);
    });

    const totalProducts = await productModel.countDocuments();
    const totalBestsellers = await productModel.countDocuments({ bestseller: true });
    
    console.log(`\n🎯 Total Products: ${totalProducts}`);
    console.log(`⭐ Total Bestsellers: ${totalBestsellers}`);
    console.log('\n🚀 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding function
seedProducts(); 