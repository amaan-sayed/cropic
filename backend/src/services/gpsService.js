const { calculateDistance } = require('../utils/distanceCalc');

const verifyLocation = (capturedLat, capturedLng, farmLat, farmLng) => {
  const distance = calculateDistance(capturedLat, capturedLng, farmLat, farmLng);
  
  // If the photo was taken more than 1km away from the farm, flag it!
  const isWithinBounds = distance <= 1.0; 
  
  return {
    valid: isWithinBounds,
    distanceKm: distance.toFixed(2),
    message: isWithinBounds ? 'Location verified' : 'Photo captured too far from registered farm'
  };
};

module.exports = { verifyLocation };