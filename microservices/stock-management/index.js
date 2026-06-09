const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI manquant pour le service stock-management.');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Stock management connecté à MongoDB'))
  .catch((error) => {
    console.error('Erreur de connexion MongoDB pour stock-management:', error);
    process.exit(1);
  });

app.post('/update-stock', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'productId et quantity sont requis.' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'La quantité doit être un nombre positif.' });
    }

    if (product.stock - quantity < 0) {
      return res.status(400).json({ message: 'Stock insuffisant pour cette commande.' });
    }

    product.stock -= quantity;
    await product.save();

    console.log(`Mise à jour du stock: Produit ${productId}, Quantité retirée ${quantity}, stock restant ${product.stock}`);
    return res.status(200).json({ message: 'Stock mis à jour avec succès.', product });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du stock.' });
  }
});

app.listen(PORT, () => console.log(`Service de gestion des stocks sur le port ${PORT}`));
