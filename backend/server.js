// 1. Load environment variables BEFORE doing anything else!
require('dotenv').config(); 

// 2. Now it is safe to load the rest of the app
const app = require('./src/app.js');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 CROPIC Server running on port ${PORT}`);
});