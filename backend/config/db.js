// config/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const connectDB = async () => {
    try {
        logger.info(`url de la page dans les var env ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('MongoDB connecté');
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
