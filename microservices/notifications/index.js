// notifi/server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config()
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/notifications.log' }),
  ],
});

const app = express();
app.use(bodyParser.json());

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Adresse Gmail
    pass: process.env.EMAIL_APPLICATION_PASSWORD, // Mot de passe spécifique à l'application
  },
});

logger.info(`process.env.EMAIL_USER is ${process.env.EMAIL_USER} process.env.EMAIL_APPLICATION_PASSWORD is ${process.env.EMAIL_APPLICATION_PASSWORD}`);
// Route pour envoyer un email
app.post('/notify', async (req, res) => {
  const { to, subject, text } = req.body;
  logger.info(`to is ${to} subject is ${subject} text is ${text}`)

  //const { message } = req.body;
    //logger.info(`Notification: ${text}`);
    //res.send('Notification envoyée mail');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Email envoyé avec succès');
    return res.status(200).json({ message: 'Email envoyé avec succès.' });
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email', error);
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.', error });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notifications' });
});

// Lancer le service Notification
const PORT = process.env.NOTIFI_PORT || 4002;
app.listen(PORT, () => {
  logger.info(`Service de notification en écoute sur le port ${PORT}`);
});
