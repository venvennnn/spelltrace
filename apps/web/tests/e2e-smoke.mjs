import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const out = "/tmp/spelltrace-shots";
mkdirSync(out, { recursive: true });
const notes = [];

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  const path = `${out}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  notes.push(`shot ${name}`);
  return path;
}

async function overflow(page, label) {
  const x = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  notes.push(`${label} overflowX=${x}`);
  if (x > 2) notes.push(`FAIL overflow ${label}`);
  return x;
}

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await mobile.newPage();
page.on("pageerror", (e) => notes.push(`pageerror ${e.message}`));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const h1 = await page.locator("h1").innerText();
if (!/Spot a change in your bowling/i.test(h1)) notes.push(`FAIL landing h1: ${h1}`);
await shot(page, "mobile_landing");
await overflow(page, "landing-390");
await page.getByRole("link", { name: /Try the demonstration/i }).click();
await page.waitForURL("**/today");
await shot(page, "mobile_today");
await overflow(page, "today-390");
const today = await page.locator("body").innerText();
if (!/Demonstration data/i.test(today)) notes.push("FAIL missing demo banner on today");
if (!/What changed/i.test(today)) notes.push("FAIL missing What changed");
if (/\b(you have an injury|injury risk|diagnosed)\b/i.test(today)) notes.push("FAIL injury language on today");

await page.goto("http://localhost:3000/sessions/sess-changed-2026-10-02/review", { waitUntil: "networkidle" });
await shot(page, "mobile_review");
await overflow(page, "review-390");
await page.getByRole("button", { name: "Usual" }).click();
await page.locator("select").first().selectOption("finding");
await page.getByRole("button", { name: /How measured|Show measurements|Matches how it felt/i }).first().click().catch(() => {});
const details = page.locator("summary");
if (await details.count()) await details.first().click();
await shot(page, "mobile_review_overlay");
const reviewText = await page.locator("body").innerText();
if (!/No delivery-level watch recording|not recorded/i.test(reviewText)) notes.push("FAIL missing watch-motion absent label");
if (!/AI explanation/i.test(reviewText)) notes.push("FAIL missing AI explanation");

await page.goto("http://localhost:3000/sessions/sess-2026-09-12", { waitUntil: "networkidle" });
const moved = await page.locator("body").innerText();
if (!/original video deleted|skeletal/i.test(moved)) notes.push("FAIL movement-only session missing deletion label");
await shot(page, "mobile_movement_only");

await page.goto("http://localhost:3000/sessions/new", { waitUntil: "networkidle" });
await overflow(page, "new-390");
await page.locator('input[name="startedAtLocal"]').fill("2026-10-03T17:10");
await page.locator('textarea[name="notes"]').fill("Felt late through the crease.");
await page.getByRole("button", { name: /Create session/i }).click();
await page.waitForURL(/\/sessions\/sess-/, { timeout: 8000 });
await shot(page, "mobile_new_session");
notes.push(`new session url ${page.url()}`);

await page.goto("http://localhost:3000/watch", { waitUntil: "networkidle" });
const watch = await page.locator("body").innerText();
if (!/Coming soon/i.test(watch)) notes.push("FAIL Garmin/Google not marked coming soon");
if (/Connect Garmin(?![\s\S]*Coming soon)/.test(watch) && /Connect Garmin/.test(watch) && !/Coming soon/.test(watch)) {
  notes.push("FAIL live Garmin");
}
await shot(page, "mobile_watch");

await page.goto("http://localhost:3000/trends", { waitUntil: "networkidle" });
const trends = await page.locator("body").innerText();
if (!/source footage deleted|skeletal/i.test(trends)) notes.push("FAIL trends missing movement-only label");
await shot(page, "mobile_trends");

await page.goto("http://localhost:3000/shares/new", { waitUntil: "networkidle" });
await page.locator('input[type="checkbox"]').first().waitFor({ timeout: 8000 });
const boxes = page.locator('input[type="checkbox"]');
await boxes.nth(0).check();
await page.getByRole("button", { name: /Create expiring link/i }).click();
await page.locator("text=/\\/s\\/[a-f0-9]+/").waitFor({ timeout: 8000 }).catch(() => {});
const shareBox = await page.locator("body").innerText();
const tokenMatch = shareBox.match(/\/s\/([a-f0-9]+)/);
if (!tokenMatch) notes.push("FAIL no share token");
else {
  const token = tokenMatch[1];
  await page.goto(`http://localhost:3000/s/${token}`, { waitUntil: "networkidle" });
  const pub = await page.locator("body").innerText();
  if (/private demo note|menstrual/i.test(pub)) notes.push("FAIL private note leaked on share");
  await shot(page, "mobile_share_public");
}
await shot(page, "mobile_share_form");

await mobile.close();

const desk = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const d = await desk.newPage();
await d.goto("http://localhost:3000/sessions/sess-changed-2026-10-02/review", { waitUntil: "networkidle" });
await shot(d, "desktop_review_dual");
await overflow(d, "review-1280");
await d.goto("http://localhost:3000/today", { waitUntil: "networkidle" });
await shot(d, "desktop_today");
await desk.close();

await browser.close();
writeFileSync(`${out}/notes.txt`, notes.join("\n"));
console.log(notes.join("\n"));
if (notes.some((n) => n.startsWith("FAIL"))) process.exit(1);
