const { cloudinary } = require('../config/cloudinary');

/**
 * Deletes an image from Cloudinary.
 * Useful if the database fails to save, or if an authority rejects a fake photo.
 * @param {string} imageUrl - The full secure_url from Cloudinary
 */
const deleteImageFromCloud = async (imageUrl) => {
  try {
    if (!imageUrl) return false;

    // Cloudinary URLs look like: https://res.cloudinary.com/.../CROPIC_Observations/filename.jpg
    // We need to extract just the "Folder_Name/File_Name" (known as the public_id) to delete it.
    const urlParts = imageUrl.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    
    // Remove the .jpg / .png extension
    const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;

    // Tell Cloudinary to permanently destroy the file
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log(`☁️ Cloudinary Cleanup: ${result.result}`);
    return result.result === 'ok';
    
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    return false;
  }
};

module.exports = { deleteImageFromCloud };