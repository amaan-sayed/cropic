const express = require('express');
const cors = require('cors');

// Import Routes
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');

// Import Middleware
const { loginLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. Standard a
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Rate Limiters (Must go BEFORE the routes they protect)
app.use('/api/auth/login', loginLimiter);

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); // Make sure your uploadRoutes use the `protect` middleware!

// 4. Basic Route for testing
app.get('/', (req, res) => {
  res.send('CROPIC API is running...');
});

// 5. Error Handler (Must be at the VERY END, after all routes)
app.use(errorHandler);

module.exports = app;
 
