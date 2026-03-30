import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
const uploadOnCloudinary = async (file) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(file);

    fs.unlinkSync(file);

    return result; 
  } catch (error) {
    fs.unlinkSync(file);
    console.log(error);
  }
};



export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary delete error:", error.message);
  }
};

export default uploadOnCloudinary

