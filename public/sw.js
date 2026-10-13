self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title || "Aion Finance", {
    body: payload.body || "Seu resumo financeiro diário está pronto.",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.tag || "aion-daily-summary",
    renotify: true,
    data: { url: payload.url || "/painel" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/painel", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    return existing ? existing.focus().then(() => existing.navigate(targetUrl)) : clients.openWindow(targetUrl);
  }));
});
