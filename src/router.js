// ============================================================
// router.js — Exemple de routage simple par mots-clés.
// ------------------------------------------------------------
// C'est ici que tu branches TA logique métier :
// catalogue, prise de commande, FAQ, qualification...
// Remplace les réponses d'exemple par les tiennes.
// ============================================================

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function routeMessage(text) {
  const msg = normalize(text);

  // Salutations
  if (/^(salam|salut|bonjour|hello|cc|azul)/.test(msg)) {
    return (
      "Salam 👋 Bienvenue ! Je suis l'assistant virtuel de la boutique.\n\n" +
      "Je peux vous aider pour :\n" +
      "• nos produits et prix (écrivez *catalogue*)\n" +
      "• nos horaires (écrivez *horaires*)\n" +
      "• parler à un humain (écrivez *humain*)"
    );
  }

  // Exemple : catalogue
  if (msg.includes("catalogue") || msg.includes("produit") || msg.includes("prix")) {
    return (
      "Voici un exemple de catalogue :\n\n" +
      "• Article A — 199 DH\n" +
      "• Article B — 349 DH\n" +
      "• Article C — 499 DH\n\n" +
      "Remplacez ce texte par VOTRE catalogue. 💡"
    );
  }

  // Exemple : horaires
  if (msg.includes("horaire") || msg.includes("ouvert") || msg.includes("fermé")) {
    return "Nous sommes ouverts du lundi au samedi, de 9h à 19h. 🕘";
  }

  // Exemple : transfert vers un humain
  if (msg.includes("humain") || msg.includes("conseiller") || msg.includes("agent")) {
    return "Bien sûr ! Un membre de notre équipe vous répondra très vite. En attendant, n'hésitez pas à décrire votre besoin. 🙏";
  }

  // Réponse par défaut
  return (
    "Je n'ai pas bien compris 🤔\n\n" +
    "Écrivez *catalogue* pour voir nos produits, *horaires* pour nos heures d'ouverture, " +
    "ou *humain* pour parler à quelqu'un de l'équipe."
  );
}

module.exports = { routeMessage };
