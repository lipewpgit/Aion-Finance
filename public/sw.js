self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = { body: event.data?.text() || "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Aion Finance", {
    body: data.body || "Seu resumo financeiro está pronto.",
    icon: "/aion-app-icon-512.png",
    badge: "/aion-app-icon.png",
    tag: data.tag || "aion-finance",
    data: { url: data.url || "/painel" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/painel", self.location.origin).href;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if ("focus" in client) {
        if ("navigate" in client) await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
