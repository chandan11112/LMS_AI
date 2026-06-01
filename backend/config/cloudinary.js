import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


import { v2 as cloudinary } from "cloudinary";


console.log("CLOUD:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("KEY:", process.env.CLOUDINARY_API_KEY);
console.log("SECRET:", !!process.env.CLOUDINARY_API_SECRET);  



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder, resource_type: "image", quality: "auto", fetch_format: "auto" },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
  });
};

// FIX: Upload video using resource_type "video" and return secure_url (https)
// FIX: Do NOT use eager HLS transformation as the primary URL — eager is async
//      and the m3u8 URL won't be ready immediately after upload.
//      Use the direct mp4 secure_url which ReactPlayer can handle natively.
// export const uploadVideo = (file, folder) => {
  // return new Promise((resolve, reject) => {
    // cloudinary.uploader.upload(
      // file.tempFilePath,
      // {
        // folder,
        // resource_type: "video",
       // FIX: chunk_size for large video files
        // chunk_size: 6000000,
       // FIX: removed eager HLS — the async HLS URL isn't reliably available
       // right after upload. The direct mp4 URL works immediately with ReactPlayer.
      // },
      // (err, result) => {
        // if (err) return reject(err);
        // resolve({
         // FIX: use secure_url (https) to prevent mixed-content browser errors
          // url: result.secure_url,
          // publicId: result.public_id,
          // duration: result.duration || 0,
        // });
      // }
    // );
  // });
// };



export const uploadVideo = async (file, folder) => {
  try {
    console.log("VIDEO FILE:", file.name);
    console.log("TEMP PATH:", file.tempFilePath);

    const result = await cloudinary.uploader.upload(
      file.tempFilePath,
      {
        folder,
        resource_type: "video",
        chunk_size: 6000000,
        timeout: 1200000, // 20 min
      }
    );

    console.log("UPLOAD RESULT:", result);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
    };
  } catch (error) {
    console.log("CLOUDINARY VIDEO ERROR:", error);

    throw new Error(
      error?.message || "Video upload failed"
    );
  }
};




export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

export default cloudinary;
