import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ (CORS)
app.use(cors({
  origin: '*', // Autorise ton app Stackblitz à communiquer avec Render
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR BREVO
// Utilise les variables d'environnement que tu as créées sur Render
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.BREVO_USER,      // Ton email d'inscription Brevo
    pass: process.env.BREVO_SMTP_KEY   // Ta clé API xsmtpsib...
  }
});

// 3. ROUTE DE VÉRIFICATION (Affichée quand tu vas sur l'URL Render)
app.get("/", (req, res) => {
  res.send("<h1>Serveur de Mail Actif</h1><p>Statut : Prêt à envoyer via Brevo.</p>");
});

// 4. ROUTE D'ENVOI DU SIGNALEMENT
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  // Vérification basique des données reçues
  if (!subject || !text) {
    console.log("Données reçues incomplètes");
    return res.status(400).json({ error: "Sujet ou texte manquant" });
  }

  try {
    const info = await transporter.sendMail({
      // IMPORTANT : L'adresse 'from' doit être validée dans ton compte Brevo
      // Par défaut, utilise l'email avec lequel tu as créé ton compte Brevo
      from: `"Signalement Panne" <${process.env.BREVO_USER}>`,
      to: "panne@radiologie-lyon.com", 
      subject: subject,
      text: text,
    });

    console.log("Email envoyé avec succès :", info.messageId);
    res.status(200).json({ 
      message: "Succès", 
      id: info.messageId 
    });

  } catch (err) {
    // Si une erreur survient, elle sera détaillée dans les logs de Render
    console.error("ERREUR LORS DE L'ENVOI :", err);
    res.status(500).json({ 
      error: "Échec de l'envoi", 
      details: err.message 
    });
  }
});

// 5. DÉMARRAGE DU SERVEUR
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré et écoute sur le port ${PORT}`);
});
