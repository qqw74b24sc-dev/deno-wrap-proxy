{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // 1. Cloudflare\uc0\u22266 \u23450 IPv6\u32593 \u20851 \u65288 \u20840 \u29699 \u31283 \u23450 \u21487 \u29992 \u65292 \u19981 \u29992 \u25913 \u65289 \
const CLOUDFLARE_IPV6 = "2606:4700:20::ac43:12a1";\
// 2. \uc0\u30446 \u26631 IPv4\u32593 \u31449 \u65288 \u21487 \u25913 \u65292 \u27604 \u22914 "bilibili.com"\u65289 \
const TARGET_DOMAIN = "baidu.com";\
\
addEventListener("fetch", async (event) => \{\
  const request = event.request;\
  const url = new URL(request.url);\
  const headers = new Headers(request.headers);\
\
  // \uc0\u20851 \u38190 \u32454 \u33410 \u65306 \u20266 \u35013 \u35831 \u27714 \u22836 \u65292 \u35753 \u26657 \u22253 \u32593 \u20197 \u20026 \u26159 \u21512 \u27861 IPv6\u27969 \u37327 \
  headers.set("Host", TARGET_DOMAIN); // \uc0\u27450 \u39575 \u26657 \u22253 \u32593 DPI\u65292 \u20266 \u35013 \u25104 \u30452 \u25509 \u35775 \u38382 \u30446 \u26631 \u31449 \
  headers.set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"); // \uc0\u27169 \u25311 \u30495 \u23454 \u27983 \u35272 \u22120 \
  headers.set("CF-Connecting-IP", request.remoteAddr?.hostname || ""); // \uc0\u20266 \u35013 \u25104 Cloudflare\u21512 \u27861 \u35831 \u27714 \
  headers.delete("Via"); // \uc0\u31227 \u38500 \u20195 \u29702 \u30165 \u36857 \
\
  // \uc0\u36716 \u21457 \u35831 \u27714 \u21040 Cloudflare IPv6\u38567 \u36947 \
  const proxyUrl = `https://[$\{CLOUDFLARE_IPV6\}]/$\{TARGET_DOMAIN\}$\{url.pathname\}$\{url.search\}`;\
  const response = await fetch(proxyUrl, \{\
    method: request.method,\
    headers: headers,\
    body: request.body,\
  \});\
\
  // \uc0\u28165 \u38500 \u25935 \u24863 \u21709 \u24212 \u22836 \u65292 \u36991 \u20813 \u26657 \u22253 \u32593 \u26816 \u27979 \
  const newHeaders = new Headers(response.headers);\
  newHeaders.delete("Set-Cookie"); // \uc0\u38450 \u27490 \u35748 \u35777 Cookie\u27844 \u38706 \
  newHeaders.delete("X-Powered-By"); // \uc0\u38544 \u34255 \u26381 \u21153 \u22120 \u20449 \u24687 \
\
  return new Response(response.body, \{\
    status: response.status,\
    headers: newHeaders,\
  \});\
\});}