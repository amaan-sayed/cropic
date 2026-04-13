const isValidCaptureTime = (timestamp) => {
  const captureDate = new Date(timestamp);
  const now = new Date();
  
  // 1. Cannot be in the future
  if (captureDate > now) return false;

  // 2. Must be during daylight hours (roughly 6 AM to 6 PM)
  const hour = captureDate.getHours();
  if (hour < 6 || hour > 18) return false;

  return true;
};

module.exports = { isValidCaptureTime };