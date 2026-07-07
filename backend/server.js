require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const citizenRoutes = require('./routes/citizens');
const { landRouter, bizRouter } = require('./routes/records');
const { getDashboardStats } = require('./controllers/dashboardController');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'https://mansa-records-frontend.onrender.com', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/land', landRouter);
app.use('/api/business', bizRouter);
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', system: 'Mansa Municipal Records' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mansa Records API running on http://localhost:${PORT}`);
});
