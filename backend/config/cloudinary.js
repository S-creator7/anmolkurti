import {v2 as cloudinary } from "cloudinary"

const connectCloudinary = async () => {
    console.log("Cloudinary Config - CLOUD_NAME:", process.env.CLOUD_NAME);
    console.log("Cloudinary Config - CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
    console.log("Cloudinary Config - CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

}

export default connectCloudinary;
