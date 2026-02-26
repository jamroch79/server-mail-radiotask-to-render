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

// 2. CONFIGURATION DU TRANSPORTEUR BREVO (PASSAGE SUR PORT 465 SSL)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,             // Port sécurisé direct
  secure: true,          // Doit être true pour le port 465
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY
  },
  connectionTimeout: 15000, // On laisse 15 secondes pour établir la connexion
  greetingTimeout: 10000,
  socketTimeout: 15000
});

// 3. PAGE D'ACCUEIL
app.get("/", (req, res) => {
  res.send("<h1>Serveur RadioTask Mail</h1><p>Statut : Opérationnel (SSL Actif)</p>");
});

// 4. ROUTE D'ENVOI DU SIGNALEMENT
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  if (!subject || !text) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Signalement RadioTask" <${process.env.BREVO_USER}>`,
      to: "panne@radiologie-lyon.com", 
      subject: subject,
      text: text,
    });

    console.log("Email envoyé avec succès :", info.messageId);
    res.status(200).json({ message: "Succès", id: info.messageId });

  } catch (err) {
    console.error("ERREUR ENVOI MAIL :", err);
    res.status(500).json({ 
      error: "Erreur lors de l'envoi", 
      details: err.message 
    });
  }
});

// 5. DÉMARRAGE DU SERVEUR
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur actif sur le port ${PORT}`);
});
