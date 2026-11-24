const webpush = require("web-push");

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (Boolean(publicKey) !== Boolean(privateKey)) {
  throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured together.");
}

const isConfigured = Boolean(publicKey && privateKey);

if (isConfigured) {
  if (!process.env.MAIL_USER) {
    throw new Error("MAIL_USER is required to configure web push.");
  }

  webpush.setVapidDetails(`mailto:${process.env.MAIL_USER}`, publicKey, privateKey);
} else {
  console.warn("Web push is disabled until VAPID keys are configured.");
}

module.exports = { webpush, isConfigured };
