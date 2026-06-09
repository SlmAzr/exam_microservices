// server.js
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Serveur en écoute sur le port ${PORT}`);
});