import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// PAGE D'ACCUEIL
app.get("/", (req, res) => {
  res.send("<h1>Serveur RadioTask Mail (API Mode)</h1><p>Prêt à envoyer via Brevo API.</p>");
});

// ROUTE D'ENVOI DU SIGNALEMENT VIA API BREVO
app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  if (!subject || !text) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_SMTP_KEY // Ta clé api-key (xkeysib...)
      },
      body: JSON.stringify({
        sender: { 
          name: "Signalement RadioTask", 
          email: process.env.BREVO_USER // Ton email validé (radiologuesmermoz@gmail.com)
        },
        to: [{ email: "panne@radiologie-lyon.com" }],
        subject: subject,
        textContent: text
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Email envoyé via API :", data.messageId);
      res.status(200).json({ message: "Succès", id: data.messageId });
    } else {
      throw new Error(JSON.stringify(data));
    }

  } catch (err) {
    console.error("ERREUR API BREVO :", err.message);
    res.status(500).json({ error: "Échec de l'envoi via API", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur API actif sur le port ${PORT}`);
});
