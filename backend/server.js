import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Restaurant Management API is running'
  });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Restaurant Management API is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
