addEventListener("fetch", (event) => {
  event.respondWith(new Response("服务已启动", { status: 200 }));
});
