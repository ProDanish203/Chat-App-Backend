import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import { getBase64 } from './helpers.js';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "danish-siddiqui", 
  api_key: process.env.CLOUDINARY_API_KEY || "591852473349489", 
  api_secret: process.env.CLOUDINARY_API_SECRET || "IEhHiMSchl7W3lBmMD0AaA4-xVY"
});

export const uploadFile = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        // Upload file on cloudinary
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: '/master_backend'
        });
        // success
        fs.unlinkSync(localFilePath);
        return res
    }catch(error){
        // Remove the locally saved file if upload failed
        fs.unlinkSync(localFilePath)
        console.log(error);
        return null;
    }
}

export const deleteFile = async (public_id) => {
    try{
        if(!public_id) return null;

        const res = await cloudinary.uploader.destroy(public_id)
        return res;
    }catch(error){
        console.log(error)
        return null;
    }
}

// Upload multiple files on cloudinary
export const uploadFilesToCloudinary = async (files = []) => {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          getBase64(file),
          {
            resource_type: "auto",
            public_id: uuid(),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
      });
    });
  
    try {
      const results = await Promise.all(uploadPromises);
  
      const formattedResults = results.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
      }));
      return formattedResults;
    } catch (err) {
      throw new Error("Error uploading files to cloudinary", err);
    }
};