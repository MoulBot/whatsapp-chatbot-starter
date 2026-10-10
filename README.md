# 🤖 WhatsApp Chatbot Starter

Starter kit **Node.js + Express** pour créer un chatbot avec l'**API WhatsApp Cloud officielle** de Meta. Testé en conditions réelles.

## Ce qui est inclus

- ✅ Vérification du webhook (GET) et réception des messages (POST)
- ✅ **Vérification de signature** `X-Hub-Signature-256` : seules les requêtes Meta sont acceptées
- ✅ Réponse `200` immédiate puis traitement en arrière-plan (évite les renvois en boucle de Meta)
- ✅ Envoi de messages via l'API Cloud (avec découpage auto des longs textes)
- ✅ Routeur d'exemple par mots-clés, facile à remplacer par ta logique métier
- ✅ `.env.example` documenté

## Démarrage rapide

```bash
npm install
cp .env.example .env   # puis remplis tes valeurs
npm start
```

## Configuration Meta (checklist)

1. **Créer l'app** : [developers.facebook.com](https://developers.facebook.com) → Créer une app → ajouter le produit **WhatsApp**.
2. **Token PERMANENT** (important) : `business.facebook.com` → Paramètres → Utilisateurs système → créer un utilisateur système avec l'accès WhatsApp → générer le token. Les tokens temporaires de l'API Setup expirent après ~24h !
3. **Numéro** : WhatsApp → API Setup → ajoute et vérifie ton numéro par SMS → note le **Phone Number ID**.
4. **Tunnel local** (dév) : expose ton port 3000 avec [ngrok](https://ngrok.com) : `ngrok http 3000`.
5. **Webhook** : WhatsApp → Configuration → URL `https://ton-domaine/webhook`, token de vérification = ton `VERIFY_TOKEN` → **S'abonner** au champ `messages`.
6. **L'étape que tout le monde oublie** ⚠️ : abonne ton WABA à l'app, sinon aucun vrai message n'arrive :
   ```
   POST https://graph.facebook.com/v21.0/<WABA_ID>/subscribed_apps
   ```
7. **Mode Live** : pour recevoir les vrais messages (pas seulement les tests du dashboard), l'app doit être en mode Live.
8. **Vérification d'entreprise** : requise pour passer en production sans limites.

## Où mettre ta logique

Ouvre `src/router.js` et remplace les réponses d'exemple : branche ton catalogue, ta FAQ, ta prise de commande… Pour de l'IA, appelle ton API préférée depuis `routeMessage()` (ou un module dédié).

## Sécurité

- Ne commite **jamais** ton `.env` (déjà dans `.gitignore`).
- `APP_SECRET` active la vérification de signature : sans elle, n'importe qui peut appeler ton webhook.
- En production, héberge sur un VPS (pas ngrok) avec HTTPS.

## Licence

MIT — voir [LICENSE](LICENSE).
