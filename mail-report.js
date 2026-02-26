import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ (CORS)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR (PORT 587 - STARTTLS)
// C'est la configuration la plus robuste pour éviter le "Délai dépassé"
const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 587,
  secure: false, // Doit être false pour le port 587
  auth: {
    user: "panne@radiologie-lyon.com",
    pass: process.env.OVH_MAIL_PASSWORD
  },
  tls: {
    // Aide à la connexion sur les réseaux Cloud (Render)
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  debug: true, 
  logger: true 
});

// 3. ROUTE D'ACCUEIL (Test simple)
app.get("/", (req, res) => {
  res.send("Serveur de signalement actif (Port 587). Prêt à envoyer.");
});

// 4. ROUTE D'ENVOI DU MAIL
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  if (!subject || !text) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const info = await transporter.sendMail({
      from: '"Alerte Panne" <panne@radiologie-lyon.com>',
      to: "panne@radiologie-lyon.com",
      subject: subject,
      text: text,
    });

    console.log("Email envoyé avec succès :", info.messageId);
    res.status(200).json({ message: "Email envoyé avec succès", id: info.messageId });

  } catch (err) {
    console.error("ERREUR SMTP DÉTAILLÉE :", err);
    res.status(500).json({ 
      error: "Échec de l'envoi", 
      details: err.message 
    });
  }
});

// 5. DÉMARRAGE DU SERVEUR
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
