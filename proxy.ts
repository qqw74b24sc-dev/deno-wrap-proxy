// Cloudflare IPv6网关（全球通用）
const CLOUDFLARE_IPV6 = "2606:4700:20::ac43:12a1";

// 内置UA列表（无任何外部依赖）
const UA_LIST = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/119.0"
];

addEventListener("fetch", async (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 提取目标网站（格式：/https://目标地址）
  const targetUrlStr = url.pathname.slice(1);
  if (!targetUrlStr.startsWith("http")) {
    return new Response("请输入完整目标URL，例如：/https://www.baidu.com", { status: 400 });
  }
  const targetUrl = new URL(targetUrlStr);

  // 伪装请求头
  const headers = new Headers(request.headers);
  headers.set("Host", targetUrl.host);
  headers.set("User-Agent", UA_LIST[Math.floor(Math.random() * UA_LIST.length)]);
  headers.delete("Via");

  // 转发请求
  const proxyUrl = `https://[${CLOUDFLARE_IPV6}]${targetUrl.pathname}${targetUrl.search}`;
  const response = await fetch(proxyUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
  });

  return new Response(response.body, { status: response.status, headers: response.headers });
});
