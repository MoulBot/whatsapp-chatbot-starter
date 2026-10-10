// ============================================================
// index.js — Serveur Express + webhooks WhatsApp Cloud API
// ============================================================
//  GET  /webhook → vérification initiale demandée par Meta
//  POST /webhook → réception des messages (signature vérifiée)
//  GET  /health  → pour vérifier que le serveur tourne
// ============================================================

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { routeMessage } = require("./router");
const { sendTextMessage } = require("./whatsapp");

const app = express();

// On garde le corps brut pour vérifier la signature Meta.
// Sans ça, impossible de vérifier X-Hub-Signature-256.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "change-moi";
const APP_SECRET = process.env.APP_SECRET || "";

// ----------------------------------------------------------
// Vérifie que la requête POST vient vraiment de Meta.
// Rejette tout ce qui n'a pas une signature valide.
// ----------------------------------------------------------
function verifySignature(req, res, next) {
  if (!APP_SECRET) {
    console.warn("[sécurité] APP_SECRET manquant : signature non vérifiée !");
    return next();
  }
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    console.warn("[sécurité] Requête sans signature, rejetée.");
    return res.sendStatus(401);
  }
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", APP_SECRET).update(req.rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.warn("[sécurité] Signature invalide, rejetée.");
    return res.sendStatus(401);
  }
  next();
}

// ----------------------------------------------------------
// 1. Vérification du webhook (Meta appelle cette URL une fois,
//    au moment où tu configures le webhook dans le dashboard)
// ----------------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[webhook] Vérification réussie ✔");
    return res.status(200).send(challenge);
  }
  console.warn("[webhook] Échec de vérification : token incorrect");
  return res.sendStatus(403);
});

// ----------------------------------------------------------
// 2. Réception des messages (signature vérifiée)
// ----------------------------------------------------------
app.post("/webhook", verifySignature, (req, res) => {
  // IMPORTANT : on répond 200 IMMÉDIATEMENT.
  // Si Meta n'a pas de réponse rapide, il renvoie le message en boucle.
  res.sendStatus(200);

  // ... puis on traite le message en arrière-plan
  handleIncoming(req.body).catch((err) => {
    console.error("[webhook] Erreur de traitement :", err.message);
  });
});

// Extrait l'expéditeur et le texte depuis le payload Meta,
// puis route vers la bonne réponse.
async function handleIncoming(body) {
  const value =
    body && body.entry && body.entry[0] &&
    body.entry[0].changes && body.entry[0].changes[0] &&
    body.entry[0].changes[0].value;
  const message = value && value.messages && value.messages[0];

  // Pas un message entrant (ex : statut de lecture) → on ignore
  if (!message || message.type !== "text") return;

  const from = message.from; // numéro de l'expéditeur, format international
  const text = (message.text && message.text.body) || "";
  console.log(`[message] ${from} : ${text}`);

  const reply = routeMessage(text);
  if (reply) {
    await sendTextMessage(from, reply);
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[bot] Serveur démarré sur le port ${PORT}`);
});
