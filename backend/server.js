require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const calendarRoutes = require('./routes/calendar');
const customersRoutes = require('./routes/customers');
const authMiddleware = require('./middleware/auth');
const setupDatabase = require('./db_setup');

setupDatabase();

const app = express();

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/src')));

app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/customers', authMiddleware, customersRoutes);
app.use('/api/providers', authMiddleware, require('./routes/providers'));
app.use('/api/hotels', authMiddleware, require('./routes/hotels'));
app.use('/api/notifications', authMiddleware, require('./routes/notifications'));

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
