import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ (CORS)
// On autorise tout le monde (*) pour le test, puis on restreindra si besoin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR OVH
// On utilise ssl0.ovh.net qui est le serveur le plus stable
const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 465,
  secure: true, // true pour le port 465
  auth: {
    user: "panne@radiologie-lyon.com",
    pass: process.env.OVH_MAIL_PASSWORD
  },
  tls: {
    // Cette option évite les erreurs de certificat SSL fréquentes sur les serveurs mutualisés
    rejectUnauthorized: false
  },
  // Debug : affiche les détails de la connexion dans les logs Render
  debug: true, 
  logger: true 
});

// 3. ROUTE DE TEST (Vérification du réveil du serveur)
app.get("/", (req, res) => {
  res.send("Serveur de signalement actif sur Render. Prêt à envoyer.");
});

// 4. ROUTE D'ENVOI DU SIGNALEMENT
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  // Sécurité : Vérifier que les données arrivent bien
  if (!subject || !text) {
    console.error("Données manquantes dans la requête");
    return res.status(400).json({ error: "Sujet ou texte manquant" });
  }

  try {
    // Envoi du mail
    const info = await transporter.sendMail({
      from: '"Alerte Panne" <panne@radiologie-lyon.com>', // L'expéditeur DOIT être l'adresse OVH
      to: "panne@radiologie-lyon.com", 
      subject: subject,
      text: text,
    });

    console.log("Email envoyé avec succès :", info.messageId);
    res.status(200).send("Email envoyé avec succès");

  } catch (err) {
    // On log l'erreur complète pour la voir dans l'onglet Logs de Render
    console.error("ERREUR SMTP DÉTAILLÉE :", err);
    
    res.status(500).json({ 
      error: "Échec de l'envoi", 
      message: err.message,
      code: err.code 
    });
  }
});

// 5. LANCEMENT DU SERVEUR SUR LE PORT RENDER
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
