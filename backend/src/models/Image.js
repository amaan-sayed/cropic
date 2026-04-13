const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  growthStage: {
    type: String,
    enum: ['Germination', 'Vegetative', 'Flowering', 'Grain Filling', 'Maturity'],
    required: true,
  },
  damageStatus: {
    type: String,
    enum: ['Healthy', 'Pest', 'Flood', 'Drought', 'Hail', 'Fire'],
    default: 'Healthy',
  },
  user: {
    // This creates a relationship between this Image and the User who took it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

module.exports = mongoose.model('Image', imageSchema);