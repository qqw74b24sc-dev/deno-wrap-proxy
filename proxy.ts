// 1. 可靠的UA随机库（Deno官方生态，稳定可用）
import { getRandomUserAgent } from "https://deno.land/x/user_agent@v2.0.0/mod.ts";
// 2. Cloudflare固定IPv6网关（全球通用）
const CLOUDFLARE_IPV6 = "2606:4700:20::ac43:12a1";

addEventListener("fetch", async (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 关键：从请求路径中提取目标网站（支持任意网站）
  // 比如访问 https://你的代理URL.dev/https://www.bilibili.com → 目标是B站
  const targetUrlStr = url.pathname.slice(1); // 去掉开头的"/"
  if (!targetUrlStr.startsWith("http")) {
    return new Response("请输入完整目标URL（如 /https://www.baidu.com）", { status: 400 });
  }
  const targetUrl = new URL(targetUrlStr);

  // 伪装请求头（防校园网检测）
  const headers = new Headers(request.headers);
  headers.set("Host", targetUrl.host); // 自动适配目标网站的Host
  headers.set("User-Agent", getRandomUserAgent()); // 随机UA
  headers.delete("Via");
  headers.set("CF-Connecting-IP", request.remoteAddr?.hostname || "");

  // 转发请求到Cloudflare IPv6隧道
  const proxyUrl = `https://[${CLOUDFLARE_IPV6}]${targetUrl.pathname}${targetUrl.search}`;
  const response = await fetch(proxyUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
  });

  // 清除敏感响应头
  const newHeaders = new Headers(response.headers);
  newHeaders.delete("Set-Cookie");
  newHeaders.delete("X-Powered-By");

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
});
