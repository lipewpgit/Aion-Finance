import webpush from "web-push";

export function pushPublicKey() {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

export function configuredWebPush() {
  const publicKey = pushPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) throw new Error("As chaves de notificação ainda não foram configuradas.");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT?.trim() || "mailto:contato@aion.finance", publicKey, privateKey);
  return webpush;
}
