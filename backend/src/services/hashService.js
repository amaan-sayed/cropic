const crypto = require('crypto');

// Creates a unique digital fingerprint (hash) of an image file
const generateImageHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

module.exports = { generateImageHash };