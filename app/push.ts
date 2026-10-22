import webpush, { type PushSubscription } from "web-push";

import { queryRows, runStatement } from "@/db/platform";

export type PushMessage = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function vapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "https://aion-finance-amber.vercel.app";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function pushPublicKey() {
  return vapidConfig()?.publicKey ?? null;
}

function asPushSubscription(row: StoredSubscription): PushSubscription {
  return { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
}

async function sendOne(row: StoredSubscription, message: PushMessage) {
  const config = vapidConfig();
  if (!config) throw new Error("As notificações ainda não foram configuradas.");
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  await webpush.sendNotification(asPushSubscription(row), JSON.stringify({ ...message, url: message.url || "/painel" }), {
    TTL: 60 * 60 * 12,
    urgency: "normal",
  });
}

export async function sendPushToUser(userId: string, message: PushMessage) {
  const subscriptions = await queryRows<StoredSubscription>(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
    [userId],
  );
  let delivered = 0;
  for (const subscription of subscriptions) {
    try {
      await sendOne(subscription, message);
      delivered += 1;
    } catch (error) {
      const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
      if (statusCode === 404 || statusCode === 410) {
        await runStatement("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [userId, subscription.endpoint]);
        continue;
      }
      console.error("Aion push delivery failed", error);
    }
  }
  return delivered;
}
