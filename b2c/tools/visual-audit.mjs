import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const root = process.env.KRANE_AUDIT_ROOT || "http://127.0.0.1:4173";
const outputDirectory = process.env.KRANE_AUDIT_OUTPUT || "/tmp/krane-visual-audit";

await mkdir(outputDirectory, { recursive: true });

const targets = [
  {
    name: "landing",
    path: "/b2c/krane-b2c-landing.html?preview=20260910-visual-audit#services",
    sections: [
      ["top", "#top"],
      ["services", "#services"],
      ["how", "#how"],
      ["weight", "#weight-program"],
      ["hair", "#hair-program"],
      ["ed", "#ed-program"],
      ["positioning", ".positioning-section"],
      ["trust", "#trust"],
      ["experts", "#experts"],
      ["reviews", ".reviews--figma"],
      ["articles", "#articles-preview"],
      ["closing", ".closing--figma"],
    ],
  },
  {
    name: "profile",
    path: "/b2c/krane-b2c.html?demoStage=prescription&preview=20260910-visual-audit#profile",
    sections: [["profile", "#profile"]],
  },
  {
    name: "treatment",
    path: "/b2c/krane-b2c.html?demoStage=prescription&preview=20260910-visual-audit#treatment-detail",
    sections: [["treatment", "#treatment-detail"]],
  },
  {
    name: "payment",
    path: "/b2c/krane-b2c.html?demoStage=prescription&preview=20260910-visual-audit#payment",
    sections: [["payment", "#payment"]],
  },
];

const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 1000 }],
];

const report = [];
const browser = await chromium.launch({ headless: true });

for (const target of targets) {
  for (const [viewportName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];

    page.on("pageerror", (error) => errors.push(`page:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console:${message.text()}`);
    });

    await page.goto(root + target.path, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.querySelectorAll("[data-reveal], .reveal-item").forEach((element) => {
        element.classList.add("is-visible");
        element.style.opacity = "1";
        element.style.transform = "none";
      });
    });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((image) => (image.currentSrc || image.src) && image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    }));

    const result = { name: target.name, viewport: viewportName, ...metrics, errors };
    report.push(result);

    for (const [sectionName, selector] of target.sections) {
      const element = page.locator(selector).first();
      if (!(await element.count())) continue;

      try {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(180);
        await element.screenshot({
          path: `${outputDirectory}/${target.name}-${viewportName}-${sectionName}.png`,
        });
      } catch (error) {
        result.screenshotErrors ||= [];
        result.screenshotErrors.push(`${sectionName}:${error.message}`);
      }
    }

    await page.close();
  }
}

await browser.close();
await writeFile(`${outputDirectory}/report.json`, JSON.stringify(report, null, 2));

const failures = report.filter(
  (result) =>
    result.scrollWidth > result.clientWidth + 1 ||
    result.brokenImages.length ||
    result.errors.length ||
    result.screenshotErrors?.length,
);

if (failures.length) {
  await writeFile(`${outputDirectory}/failures.json`, JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
