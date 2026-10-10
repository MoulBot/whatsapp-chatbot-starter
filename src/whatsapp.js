// ============================================================
// whatsapp.js — Envoi de messages via l'API WhatsApp Cloud (Meta)
// ============================================================
// Doc officielle : https://developers.facebook.com/docs/whatsapp/cloud-api

const API_VERSION = "v21.0";
const MAX_LENGTH = 4000; // WhatsApp limite chaque message à 4096 caractères (on prend une marge)

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error(
      "WHATSAPP_TOKEN et PHONE_NUMBER_ID doivent être définis dans le fichier .env"
    );
  }
  return { token, phoneNumberId };
}

// Découpe un long texte en morceaux de 4000 caractères max,
// en coupant de préférence à un saut de ligne ou à un espace.
function splitMessage(text) {
  if (text.length <= MAX_LENGTH) return [text];
  const parts = [];
  let restant = text;
  while (restant.length > MAX_LENGTH) {
    let coupure = restant.lastIndexOf("\n", MAX_LENGTH);
    if (coupure === -1) coupure = restant.lastIndexOf(" ", MAX_LENGTH);
    if (coupure === -1) coupure = MAX_LENGTH;
    parts.push(restant.slice(0, coupure).trim());
    restant = restant.slice(coupure).trim();
  }
  if (restant) parts.push(restant);
  return parts;
}

// Envoie un message texte à un numéro WhatsApp (format international, ex : "2126XXXXXXXX")
async function sendTextMessage(to, text) {
  const { token, phoneNumberId } = getConfig();

  for (const part of splitMessage(text)) {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: part },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Échec d'envoi (${res.status}) : ${err}`);
    }
  }
}

module.exports = { sendTextMessage };
