// import mongoose from "mongoose";

// const connectDB = async () => {

//     mongoose.connection.on('connected',() => {
//         console.log("DB Connected");
//     })

//     await mongoose.connect(process.env.MONGODB_URI)
//     console.log("DB Connected");


// }

// export default connectDB;

import mongoose from "mongoose";
import dotenv from 'dotenv';
// dotenv.config();
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const connectDB = async () => {
  try {
    mongoose.connection.once("connected", () => {
      console.log("✅ MongoDB connection established.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1); 
  }
};

export default connectDB;
