import {v2 as cloudinary } from "cloudinary"

const connectCloudinary = async () => {

    cloudinary.config({
        cloud_name: 'dgoptvwkk',
        api_key:299314211881297,
        api_secret: 'MB0EsKeO1vJ5JSzzQbx8cOaxpaM'
    })

}

export default connectCloudinary;