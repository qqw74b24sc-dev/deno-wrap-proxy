// 可靠的UA随机依赖（Deno Land已收录，可正常下载）
import { getRandom } from "https://deno.land/x/random_useragent@v2.0.0/mod.ts";
// Cloudflare IPv6网关（全球通用）
const CLOUDFLARE_IPV6 = "2606:4700:20::ac43:12a1";

addEventListener("fetch", async (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 从请求路径提取任意目标网站（例如：/https://www.bilibili.com）
  const targetUrlStr = url.pathname.slice(1);
  if (!targetUrlStr.startsWith("http")) {
    return new Response("请输入完整目标URL（如 /https://www.baidu.com）", { status: 400 });
  }
  const targetUrl = new URL(targetUrlStr);

  // 伪装请求头（含随机UA）
  const headers = new Headers(request.headers);
  headers.set("Host", targetUrl.host); // 自动适配目标网站的Host
  headers.set("User-Agent", getRandom()); // 调用可靠的随机UA依赖
  headers.delete("Via"); // 移除代理痕迹

  // 转发请求到Cloudflare IPv6隧道
  const proxyUrl = `https://[${CLOUDFLARE_IPV6}]${targetUrl.pathname}${targetUrl.search}`;
  const response = await fetch(proxyUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
  });

  return new Response(response.body, { status: response.status, headers: response.headers });
});
