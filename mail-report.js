import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();

// 1. CONFIGURATION DE SÉCURITÉ
app.use(cors());
app.use(express.json());

// 2. CONFIGURATION DU TRANSPORTEUR OVH
const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net", 
  port: 465,            
  secure: true,         
  auth: {
    user: "panne@radiologie-lyon.com",
    pass: process.env.OVH_MAIL_PASSWORD 
  }
});

// 3. ROUTE DE TEST
app.get("/", (req, res) => {
  res.send("Serveur de signalement actif sur Render.");
});

// 4. ROUTE D'ENVOI
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  if (!subject || !text) {
    return res.status(400).send("Erreur : Contenu manquant.");
  }

  try {
    await transporter.sendMail({
      from: "panne@radiologie-lyon.com",
      to: "panne@radiologie-lyon.com",
      subject: subject,
      text: text
    });
    res.status(200).send("OK");
  } catch (err) {
    console.error("Erreur SMTP:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. PORT POUR RENDER
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
