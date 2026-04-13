const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Import the premium controller we built earlier!
const { createObservation } = require('../controllers/uploadController');

const upload = multer({ storage }); // Uses our Cloudinary settings

// I changed the route name to just '/submit' to match your Postman setup!
router.post('/submit', upload.single('image'), createObservation);

module.exports = router;