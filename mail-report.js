import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ (CORS)
// Permet à ton application React de communiquer avec ce serveur
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR BREVO
// Les variables sont récupérées de manière sécurisée depuis Render
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.BREVO_USER,     // Doit être radiologuesmermoz@gmail.com sur Render
    pass: process.env.BREVO_SMTP_KEY   // Ta clé API xsmtpsib... sur Render
  }
});

// 3. PAGE D'ACCUEIL (Pour vérifier que le serveur tourne)
app.get("/", (req, res) => {
  res.send("<h1>Serveur RadioTask Mail</h1><p>Statut : Opérationnel</p>");
});

// 4. ROUTE D'ENVOI DU SIGNALEMENT
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  // Sécurité : Vérifier que les données ne sont pas vides
  if (!subject || !text) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const info = await transporter.sendMail({
      // L'expéditeur est ton adresse validée dans Brevo (via la variable Render)
      from: `"Signalement RadioTask" <${process.env.BREVO_USER}>`,
      // Le destinataire final
      to: "panne@radiologie-lyon.com", 
      subject: subject,
      text: text,
    });

    console.log("Email envoyé :", info.messageId);
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
