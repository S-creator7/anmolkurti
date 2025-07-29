// import mongoose from 'mongoose';
// import productModel from './models/productModel.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const updateImageUrls = async (oldUrl, newUrl) => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ Connected to MongoDB');

//     // Find all products
//     const products = await productModel.find({});
//     console.log(`📦 Found ${products.length} products to update`);

//     let updatedCount = 0;

//     for (const product of products) {
//       let hasUpdates = false;
//       const updatedImages = product.image.map(imageUrl => {
//         if (imageUrl.includes(oldUrl)) {
//           hasUpdates = true;
//           return imageUrl.replace(oldUrl, newUrl);
//         }
//         return imageUrl;
//       });

//       if (hasUpdates) {
//         await productModel.findByIdAndUpdate(product._id, { image: updatedImages });
//         updatedCount++;
//         console.log(`✅ Updated: ${product.name}`);
//       }
//     }

//     console.log(`\n🎯 Summary:`);
//     console.log(`  📦 Total Products: ${products.length}`);
//     console.log(`  🔄 Updated Products: ${updatedCount}`);
//     console.log(`  📊 Success Rate: ${((updatedCount / products.length) * 100).toFixed(1)}%`);

//     if (updatedCount > 0) {
//       console.log('\n🚀 Image URLs updated successfully!');
//     } else {
//       console.log('\n⚠️  No products needed URL updates');
//     }

//   } catch (error) {
//     console.error('❌ Update failed:', error);
//   } finally {
//     await mongoose.disconnect();
//     console.log('🔌 Disconnected from MongoDB');
//   }
// };

// // Usage examples:
// const args = process.argv.slice(2);

// if (args.length < 2) {
//   console.log('📝 Usage Examples:');
//   console.log('==================');
//   console.log('Development to Production:');
//   console.log('node updateImageUrls.js "http://localhost:4000" "https://your-domain.com"');
//   console.log('');
//   console.log('Change server IP:');
//   console.log('node updateImageUrls.js "http://localhost:4000" "http://145.223.20.110:4000"');
//   console.log('');
//   console.log('Add HTTPS:');
//   console.log('node updateImageUrls.js "http://your-domain.com" "https://your-domain.com"');
//   console.log('');
//   console.log('Current command:');
//   console.log(`node updateImageUrls.js "${args[0] || '[OLD_URL]'}" "${args[1] || '[NEW_URL]'}"`);
//   process.exit(1);
// }

// const [oldUrl, newUrl] = args;
// console.log(`🔄 Updating image URLs from "${oldUrl}" to "${newUrl}"`);
// updateImageUrls(oldUrl, newUrl); 

import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import orderModel from './models/orderModel.js'; // ✅ Make sure you have this model
import dotenv from 'dotenv';

dotenv.config();

const updateImageUrls = async (oldUrl, newUrl) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update Products Collection
    const products = await productModel.find({});
    let updatedProducts = 0;
    for (const product of products) {
      const updatedImages = product.image.map(url =>
        url.includes(oldUrl) ? url.replace(oldUrl, newUrl) : url
      );
      if (JSON.stringify(product.image) !== JSON.stringify(updatedImages)) {
        await productModel.findByIdAndUpdate(product._id, { image: updatedImages });
        updatedProducts++;
      }
    }
    console.log(`📦 Updated ${updatedProducts} product image URLs`);

    // Update Orders Collection
    const orders = await orderModel.find({});
    let updatedOrders = 0;
    for (const order of orders) {
      let orderChanged = false;
      order.items.forEach(item => {
        const updatedImages = item.image.map(url =>
          url.includes(oldUrl) ? url.replace(oldUrl, newUrl) : url
        );
        if (JSON.stringify(item.image) !== JSON.stringify(updatedImages)) {
          item.image = updatedImages;
          orderChanged = true;
        }
      });
      if (orderChanged) {
        await order.save();
        updatedOrders++;
      }
    }
    console.log(`🛒 Updated ${updatedOrders} order image URLs`);

    console.log('🚀 Image URLs updated successfully in products & orders');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// CLI Usage
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node updateImageUrls.js "http://old" "https://new"');
  process.exit(1);
}

const [oldUrl, newUrl] = args;
updateImageUrls(oldUrl, newUrl);
