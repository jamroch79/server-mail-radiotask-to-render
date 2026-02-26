import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ (CORS)
// Permet à ton interface (Stackblitz ou autre) d'appeler ce serveur
app.use(cors());
app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR OVH
const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net", // Serveur SMTP mutualisé OVH (plus stable que smtp.mail.ovh.net)
  port: 465,            // Port SSL sécurisé
  secure: true,         // Obligatoire pour le port 465
  auth: {
    user: "panne@radiologie-lyon.com",
    // Utilisation impérative d'une variable d'environnement sur Render
    pass: process.env.OVH_MAIL_PASSWORD 
  },
  // Optionnel : augmente la tolérance aux délais de connexion
  connectionTimeout: 10000 
});

// 3. ROUTE DE TEST (Pour vérifier que le serveur est réveillé)
app.get("/", (req, res) => {
  res.send("Serveur de signalement actif sur Render. Prêt à envoyer des emails.");
});

// 4. ROUTE D'ENVOI DU SIGNALEMENT
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  // Sécurité de base : vérifier que le contenu n'est pas vide
  if (!subject || !text) {
    return res.status(400).send("Erreur : Sujet ou contenu manquant.");
  }

  try {
    await transporter.sendMail({
      from: '"Signalement Panne" <panne@radiologie-lyon.com>',
      to: "panne@radiologie-lyon.com", // S'envoie à lui-même ou à une autre adresse
      subject: subject,
      text: text,
      // On peut ajouter un Reply-To si on veut répondre directement au mail
      replyTo: "panne@radiologie-lyon.com" 
    });

