import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.log("File delete error:", error.message);
  }
};

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "image",
      folder: "placementor",
    });

    removeLocalFile(file);

    if (!result?.secure_url) {
      return null;
    }

    return result;
  } catch (error) {
    removeLocalFile(file);
    console.log("Cloudinary upload error:", error.message);

    return null;
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1];

    const publicId = "placementor/" + fileName.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary delete error:", error.message);
  }
};

export default uploadOnCloudinary;
