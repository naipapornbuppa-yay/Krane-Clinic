/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { qaAssetPath } from "./routes.mjs";

interface Env {
  ASSETS?: Fetcher;
  DB: D1Database;
  QA_REVIEW_PASSWORD?: string;
  QA_REVIEW_COOKIE_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const REVIEW_COOKIE = "krane_qa_review";
const REVIEW_COOKIE_TTL_SECONDS = 7 * 24 * 60 * 60;
const PUBLIC_REVIEW_ASSETS = new Set([
  "/og.png",
  "/b2c/assets/krane-qa-line-share.png",
  "/b2c/assets/landing-573/latest/hero-base.png",
  "/b2c/assets/krane-lockup-charcoal.svg",
  "/assets/krane-clinic-logo-charcoal.svg",
]);

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[character] || character));
}

function safeReturnPath(value: string | null, fallback = "/START-HERE.html"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const parsed = new URL(value, "https://krane.invalid");
    if (parsed.origin !== "https://krane.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function reviewPassword(env: Env): string {
  return env.QA_REVIEW_PASSWORD || "234";
}

function reviewSecret(env: Env): string {
  return env.QA_REVIEW_COOKIE_SECRET || `${reviewPassword(env)}:krane-client-review:v1`;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const values = new Uint8Array(bytes);
  let binary = "";
  values.forEach((value) => { binary += String.fromCharCode(value); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signReviewValue(value: string, env: Env): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(reviewSecret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function secureCookieSuffix(request: Request, requestUrl: URL): string {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
  return requestUrl.protocol === "https:" || forwardedProtocol === "https" ? "; Secure" : "";
}

async function createReviewCookie(env: Env, request: Request, requestUrl: URL): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + REVIEW_COOKIE_TTL_SECONDS;
  const payload = `v1.${expiresAt}`;
  const signature = await signReviewValue(payload, env);
  const secure = secureCookieSuffix(request, requestUrl);
  return `${REVIEW_COOKIE}=${payload}.${signature}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${REVIEW_COOKIE_TTL_SECONDS}`;
}

async function hasValidReviewCookie(request: Request, env: Env): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REVIEW_COOKIE}=`));
  if (!cookie) return false;

  const value = cookie.slice(REVIEW_COOKIE.length + 1);
  const match = value.match(/^(v1\.(\d+))\.([A-Za-z0-9_-]+)$/);
  if (!match || Number(match[2]) <= Math.floor(Date.now() / 1000)) return false;
  const expected = await signReviewValue(match[1], env);
  return constantTimeEqual(match[3], expected);
}

function unlockPage(nextPath: string, errorMessage = "", status = 200): Response {
  const next = escapeHtml(safeReturnPath(nextPath));
  const error = errorMessage
    ? `<p class="error" id="access-message" role="alert">${escapeHtml(errorMessage)}</p>`
    : `<p class="error error--empty" id="access-message" aria-hidden="true">&nbsp;</p>`;
  const html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0969ee">
  <title>Krane Clinic · Client review</title>
  <style>
    *{box-sizing:border-box}
    html{min-height:100%;margin:0;background:#dfe7e4}
    body{position:relative;isolation:isolate;min-height:100%;min-height:100dvh;margin:0;display:grid;place-items:center;overflow:hidden;padding:max(22px,env(safe-area-inset-top)) max(22px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(22px,env(safe-area-inset-left));color:#182520;font-family:"Prompt","Noto Sans Thai",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    body::before{content:"";position:fixed;z-index:-2;inset:-20px;background:url("/b2c/assets/landing-573/latest/hero-base.png?v=20260729k") 34% center/cover no-repeat;filter:grayscale(.82) blur(4px);opacity:.16;transform:scale(1.035)}
    body::after{content:"";position:fixed;z-index:-1;inset:0;background:radial-gradient(circle at 18% 12%,rgba(255,255,255,.82),transparent 42%),linear-gradient(145deg,rgba(224,233,230,.96),rgba(204,217,218,.96) 52%,rgba(186,202,201,.96))}
    main{width:min(100%,560px);padding:46px 48px 42px;border:1px solid rgba(255,255,255,.9);border-radius:32px;background:rgba(250,249,246,.94);box-shadow:0 24px 64px rgba(30,54,49,.15),inset 0 1px 0 rgba(255,255,255,.9);text-align:center;backdrop-filter:blur(18px) saturate(.9);-webkit-backdrop-filter:blur(18px) saturate(.9);animation:card-in .45s cubic-bezier(.22,1,.36,1) both}
    .eyebrow{margin:0 0 18px;color:#42625a;font-size:13px;font-weight:650;letter-spacing:.17em}
    h1{margin:0;color:#17231f;font-size:clamp(34px,4vw,42px);font-weight:650;line-height:1.18;letter-spacing:-.02em}
    .subtitle{margin:16px 0 0;color:#697570;font-size:17px;font-weight:400;line-height:1.55}
    form{margin-top:28px}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .access-field{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;min-height:72px;padding:6px;border:1.5px solid #c9d3cf;border-radius:999px;background:#f0f3f1;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);transition:border-color .18s ease,background .18s ease,box-shadow .18s ease}
    .access-field:focus-within{border-color:#315b50;background:#fff;box-shadow:0 0 0 4px rgba(49,91,80,.12)}
    input{min-width:0;width:100%;height:58px;padding:0 18px;border:0;outline:0;background:transparent;color:#182520;text-align:center;font:500 18px/1 "Prompt","Noto Sans Thai",ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em}
    input::placeholder{color:#89938f;opacity:1;letter-spacing:.04em}
    button{display:grid;place-items:center;width:58px;height:58px;padding:0;border:0;border-radius:50%;background:#214b40;color:#fff;font:400 29px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 20px rgba(33,75,64,.2);transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
    button:hover{transform:translateX(2px);background:#173c33;box-shadow:0 10px 24px rgba(33,75,64,.25)}
    button:active{transform:translateX(2px) scale(.96)}
    .error{min-height:20px;margin:14px 0 -8px;color:#8a332f;font-size:13px;font-weight:600;line-height:1.45}
    .error:not(.error--empty){display:inline-block;padding:8px 12px;border:1px solid #e3c6c3;border-radius:999px;background:#f8ecea}
    .error--empty{visibility:hidden}
    @keyframes card-in{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
    @media(max-width:560px){body{padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}body::before{background-position:28% center}main{padding:38px 22px 30px;border-radius:26px}.eyebrow{margin-bottom:14px}.subtitle{margin-top:14px;font-size:15px;line-height:1.55}form{margin-top:22px}.access-field{min-height:66px;padding:5px}input{height:54px;padding:0 12px;font-size:17px}button{width:54px;height:54px;font-size:27px}.error{margin-top:12px}}
    @media(prefers-reduced-motion:reduce){main{animation:none}.access-field,button{transition:none}}
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">KRANE CLINIC</p>
    <h1>ตัวอย่างงานออกแบบ</h1>
    <p class="subtitle">Design preview · ใส่รหัสแล้วเลือกส่วนที่ต้องการดู</p>
    ${error}
    <form method="post" action="/qa-unlock">
      <input type="hidden" name="next" value="${next}">
      <label class="sr-only" for="review-password">Access code</label>
      <div class="access-field">
        <input id="review-password" name="password" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" placeholder="Access code" aria-describedby="access-message" required autofocus>
        <button type="submit" aria-label="เปิดตัวอย่างงาน"><span aria-hidden="true">→</span></button>
      </div>
    </form>
  </main>
  <script>
    (() => {
      const next = document.querySelector('input[name="next"]');
      if (!next) return;
      const isUnlockResponse = location.pathname === "/qa-unlock";
      if (isUnlockResponse && next.value) {
        history.replaceState(null, "", next.value);
      } else {
        next.value = location.pathname + location.search + location.hash;
      }
      document.querySelector("form")?.addEventListener("submit", () => {
        next.value = location.pathname + location.search + location.hash;
      });
    })();
  </script>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env = {} as Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/qa-unlock" && request.method === "POST") {
      const form = await request.formData();
      const next = safeReturnPath(String(form.get("next") || ""));
      if (String(form.get("password") || "") !== reviewPassword(env)) {
        return unlockPage(next, "The password is incorrect. Please try again.", 401);
      }
      return new Response(null, {
        status: 303,
        headers: {
          location: next,
          "set-cookie": await createReviewCookie(env, request, url),
          "cache-control": "no-store",
        },
      });
    }

    if (url.pathname === "/qa-lock" && request.method === "POST") {
      const secure = secureCookieSuffix(request, url);
      return new Response(null, {
        status: 303,
        headers: {
          location: "/START-HERE.html",
          "set-cookie": `${REVIEW_COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`,
          "cache-control": "no-store",
        },
      });
    }

    const isPublicPreviewAsset = PUBLIC_REVIEW_ASSETS.has(url.pathname);
    const isInternalAsset = url.pathname.startsWith("/_next/") || url.pathname.startsWith("/_vinext/");
    if (!isPublicPreviewAsset && !isInternalAsset && !(await hasValidReviewCookie(request, env))) {
      return unlockPage(`${url.pathname}${url.search}`);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS!.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const assetPath = qaAssetPath(url.pathname);
      if (assetPath) {
        url.pathname = assetPath;
        if (!env.ASSETS) {
          return new Response(null, {
            status: 307,
            headers: {
              location: `${url.pathname}${url.search}${url.hash}`,
              "cache-control": "no-store",
            },
          });
        }
        return env.ASSETS.fetch(new Request(url.toString(), {
          method: request.method,
          headers: request.headers,
        }));
      }
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
