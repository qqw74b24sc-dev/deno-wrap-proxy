// Cloudflare固定IPv6网关（全球稳定，无需修改）
const CLOUDFLARE_IPV6 = "2606:4700:20::ac43:12a1";
// 导入随机User-Agent库（防检测，可选但推荐）
import { randomUA } from "https://deno.land/x/ua_randomizer@v1.0.0/mod.ts";

addEventListener("fetch", async (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const headers = new Headers(request.headers);

  // 关键修改：动态获取用户请求的目标Host（支持所有网站）
  const targetHost = url.host; // 自动提取比如"baidu.com"、"bilibili.com"等

  // 伪装请求头（核心防检测，保留并优化）
  headers.set("Host", targetHost); // 用动态目标Host替换固定值
  headers.set("User-Agent", randomUA()); // 随机浏览器UA，避免被识别
  headers.set("CF-Connecting-IP", request.remoteAddr?.hostname || "");
  headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"); // 模拟真实请求
  headers.delete("Via");
  headers.delete("X-Forwarded-For"); // 清除额外代理痕迹

  // 动态拼接转发URL（适配所有目标网站）
  const proxyUrl = `https://[${CLOUDFLARE_IPV6}]/${targetHost}${url.pathname}${url.search}${url.hash}`;

  try {
    // 转发请求并保留原始方法/body
    const response = await fetch(proxyUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: "follow", // 自动跟随302跳转（适配登录、重定向场景）
    });

    // 清理响应头，避免检测
    const newHeaders = new Headers(response.headers);
    newHeaders.delete("Set-Cookie");
    newHeaders.delete("X-Powered-By");
    newHeaders.delete("Server");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    // 异常处理：返回502提示，方便排查
    return new Response(`代理访问失败：${error.message}`, { status: 502 });
  }
});