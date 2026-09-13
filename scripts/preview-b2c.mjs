import { createReadStream, readFileSync, statSync, watch } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const publicRoot = resolve(process.argv[2] || "public");
const port = Number(process.env.PORT || 5173);
const clients = new Set();
let initialConnectionReloaded = false;
const mime = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const liveReload = `<script>
(() => {
  const events = new EventSource('/__krane_live_reload');
  events.addEventListener('reload', () => location.reload());
})();
</script>`;

function fileFor(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(publicRoot, `.${clean}`);
  if (!candidate.startsWith(`${publicRoot}/`) && candidate !== publicRoot) return null;
  try {
    const stats = statSync(candidate);
    return stats.isDirectory() ? join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

  if (url.pathname === "/__krane_live_reload") {
    response.writeHead(200, {
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream"
    });
    response.write("retry: 500\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    if (!initialConnectionReloaded) {
      initialConnectionReloaded = true;
      setTimeout(() => response.write("event: reload\ndata: server-ready\n\n"), 120);
    }
    return;
  }

  if (url.pathname === "/") {
    response.writeHead(302, { Location: "/b2c/krane-b2c.html" });
    response.end();
    return;
  }

  const file = fileFor(url.pathname);
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = extname(file).toLowerCase();
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", mime[extension] || "application/octet-stream");

  if (extension === ".html") {
    const html = readFileSync(file, "utf8");
    response.end(html.includes("</body>") ? html.replace("</body>", `${liveReload}</body>`) : `${html}${liveReload}`);
    return;
  }

  createReadStream(file).pipe(response);
});

let reloadTimer;
watch(publicRoot, { recursive: true }, (_event, filename) => {
  if (!filename || filename.includes(".DS_Store")) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const client of clients) client.write("event: reload\ndata: changed\n\n");
    process.stdout.write(`↻ refreshed: ${filename}\n`);
  }, 120);
});

server.listen(port, "127.0.0.1", () => {
  console.log("Krane B2C live preview is ready:");
  console.log(`http://127.0.0.1:${port}/b2c/krane-b2c.html`);
  console.log(`Watching ${publicRoot} for automatic refresh.`);
});

process.on("SIGINT", () => {
  for (const client of clients) client.end();
  server.close(() => process.exit(0));
});
