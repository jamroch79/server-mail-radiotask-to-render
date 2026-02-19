import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: "panne@radiologie-lyon.com",
    pass: process.env.OVH_MAIL_PASSWORD
  }
});

app.post("/report", async (req, res) => {
  const { subject, text } = req.body;

  try {
    await transporter.sendMail({
      from: "panne@radiologie-lyon.com",
      to: "panne@radiologie-lyon.com",
      subject,
      text
    });

    res.send("OK");
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).send("Mail error");
  }
});

app.listen(3001, () => {
  console.log("Mail report server running on port 3001");
});
