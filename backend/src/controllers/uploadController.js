const Image = require('../models/Image');
const { cloudinary } = require('../config/cloudinary');
const { deleteImageFromCloud } = require('../services/imageService'); // Import at the top!

// This function handles the logic for a new crop observation
const createObservation = async (req, res) => {
  try {
    // 1. Check if a file was actually uploaded by Multer
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // 2. Extract data sent from the frontend (farmer's input)
    const { lat, lng, growthStage, damageStatus, userId } = req.body;

    // 3. Attempt to save to Database
    try {
      const newObservation = await Image.create({
        imageUrl: req.file.path,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        growthStage,
        damageStatus,
        user: userId, // Linking the observation to a specific user/farmer
      });

      // 4. Send a "Premium" success response
      res.status(201).json({
        success: true,
        message: 'Observation captured and secured in the cloud!',
        data: newObservation,
      });

    } catch (dbError) {
      // 🚨 DB FAILED! 
      // The image is in Cloudinary, but the database crashed. We must clean up!
      console.error('Database Error. Reverting cloud upload...', dbError);
      await deleteImageFromCloud(req.file.path);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Database failed, image upload reverted.' 
      });
    }

  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error during upload',
    });
  }
};

module.exports = { createObservation };