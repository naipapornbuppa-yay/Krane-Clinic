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

function safeReturnPath(value: string | null, fallback = "/b2c/krane-b2c#landing"): string {
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
    ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>`
    : `<p class="hint">Client QA access · enter the review password to continue.</p>`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#f4f6f8">
  <title>Krane Clinic · Client review</title>
  <style>
    *{box-sizing:border-box}
    html{height:100%;margin:0}
    body{min-height:100%;min-height:100dvh;margin:0;display:grid;place-items:center;padding:24px;background:#f4f6f8;color:#111b30;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(100%,420px);padding:32px;border:1px solid #e1e8f0;border-radius:32px;background:#fff;box-shadow:0 24px 70px rgba(17,27,48,.12);transform:translateY(clamp(24px,4vh,48px))}
    .brand{display:block;width:min(100%,248px);height:auto;margin:0 0 40px}
    .eyebrow{margin:0 0 10px;color:#1973ff;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    h1{margin:0;font-size:30px;line-height:1.15;letter-spacing:-.03em}
    .hint,.error{margin:14px 0 24px;color:#5c6479;font-size:14px;line-height:1.55}
    .error{padding:12px 14px;border-radius:14px;background:#fff2f0;color:#9d2d28}
    label{display:block;margin-bottom:8px;font-size:13px;font-weight:700}
    input{width:100%;height:54px;padding:0 16px;border:1px solid #cbd5e1;border-radius:16px;background:#fff;color:#111b30;font:600 20px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.12em}
    input:focus{outline:3px solid rgba(25,115,255,.2);border-color:#1973ff}
    button{width:100%;min-height:54px;margin-top:14px;border:0;border-radius:999px;background:#111b30;color:#fff;font:700 15px/1 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer}
    footer{margin-top:24px;color:#8a94a6;font-size:11px;line-height:1.5;text-align:center}
    @media(max-width:480px){body{padding:12px}main{padding:28px 22px;border-radius:28px;transform:translateY(clamp(20px,4vh,34px))}.brand{width:min(100%,220px);margin-bottom:34px}}
  </style>
</head>
<body>
  <main>
    <img class="brand" src="/b2c/assets/krane-lockup-charcoal.svg?v=20260728d" alt="Krane Clinic">
    <p class="eyebrow">Protected review</p>
    <h1>Open the Krane QA app</h1>
    ${error}
    <form method="post" action="/qa-unlock">
      <input type="hidden" name="next" value="${next}">
      <label for="review-password">Review password</label>
      <input id="review-password" name="password" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" required autofocus>
      <button type="submit">Continue to Krane</button>
    </form>
    <footer>Prototype data only · Do not enter real patient information.</footer>
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
          location: "/b2c/krane-b2c#landing",
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
