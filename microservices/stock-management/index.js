const express = require('express');
const app = express();
const PORT = 4003;
const winston = require('winston');


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/stock-management.log' }),
  ],
});

app.use(express.json());

app.post('/update-stock', (req, res) => {
    const { productId, quantity } = req.body;
    logger.info(`Mise à jour du stock: Produit ${productId}, Quantité ${quantity}`);
    res.send(`Stock mis à jour pour le produit de ID : ${productId}`);
});

app.listen(PORT, () => logger.info(`Service de gestion des stocks sur le port ${PORT}`));
