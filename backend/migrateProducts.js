import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ProductModel from './models/productModel.js'; // Adjust path as needed

dotenv.config();

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Run the migration
    const result = await ProductModel.updateMany(
      {},
      [{
        $set: {
          gender: { $toLower: "$gender" },
          category: { $toLower: "$category" },
          subCategory: { $toLower: "$subCategory" },
          occasion: {
            $map: {
              input: "$occasion",
              as: "occ",
              in: { $toLower: "$$occ" }
            }
          },
          type: {
            $map: {
              input: "$type",
              as: "t",
              in: { $toLower: "$$t" }
            }
          },
          filterTags: {
            $map: {
              input: "$filterTags",
              as: "tag",
              in: { $toLower: "$$tag" }
            }
          }
        }
      }]
    );

    console.log(`Successfully migrated ${result.modifiedCount} products`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateProducts();