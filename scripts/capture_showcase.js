import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';

const OUT_DIR_WEB = path.resolve(__dirname, '../public/screenshots');
const OUT_DIR_BRAIN = 'C:\\Users\\jayashree\\.gemini\\antigravity\\brain\\f8b874bf-5922-4aaa-b06f-97a08c01b1e2\\screenshots';

fs.mkdirSync(OUT_DIR_WEB, { recursive: true });
fs.mkdirSync(OUT_DIR_BRAIN, { recursive: true });

function saveBoth(filename, buffer) {
  fs.writeFileSync(path.join(OUT_DIR_WEB, filename), buffer);
  fs.writeFileSync(path.join(OUT_DIR_BRAIN, filename), buffer);
  console.log(`Saved: ${filename} (${buffer.length} bytes)`);
}

async function capture() {
  console.log('Launching Edge for ASTRA showcase captures...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--mute-audio',
    ],
  });

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // 1. DESKTOP WEB SCREENSHOTS (1920 x 1080)
    // ══════════════════════════════════════════════════════════════════════════
    const pageWeb = await browser.newPage();
    await pageWeb.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1.5 });

    console.log('Navigating to Web Mission Hub...');
    await pageWeb.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2000)); // wait for 3D stars & planets to render

    // 1A: Desktop Landing / Mission Hub
    let buf = await pageWeb.screenshot({ type: 'png' });
    saveBoth('01_web_landing.png', buf);

    // 1B: Desktop Exoplanet Analysis
    console.log('Capturing Desktop Exoplanet Analysis...');
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exBtn = btns.find((b) => b.textContent.includes('EXOPLANET') || b.textContent.includes('Exoplanet'));
      if (exBtn) exBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Generate dataset
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find((b) => b.textContent.includes('GENERATE'));
      if (genBtn) genBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Run analysis
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const runBtn = btns.find((b) => b.textContent.includes('RUN ANALYSIS'));
      if (runBtn) runBtn.click();
    });
    // Wait for transit animation to finish (2000ms duration) and results to display
    await new Promise((r) => setTimeout(r, 2800));

    buf = await pageWeb.screenshot({ type: 'png' });
    saveBoth('02_web_exoplanet_detected.png', buf);

    // 1C: Desktop Asteroid Disruption Comm Network
    console.log('Capturing Desktop Comm Network & Dijkstra Rerouting...');
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const netBtn = btns.find((b) => b.textContent.includes('COMM') || b.textContent.includes('Comm') || b.textContent.includes('NETWORK'));
      if (netBtn) netBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Initial network screenshot
    buf = await pageWeb.screenshot({ type: 'png' });
    saveBoth('03_web_network_initial.png', buf);

    // Trigger Asteroid disruption
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const trigBtn = btns.find((b) => b.textContent.includes('TRIGGER ASTEROID'));
      if (trigBtn) trigBtn.click();
    });
    // Wait for asteroid animation and Dijkstra rerouting calculation (duration ~1500ms + margin)
    await new Promise((r) => setTimeout(r, 2500));

    buf = await pageWeb.screenshot({ type: 'png' });
    saveBoth('04_web_network_rerouted.png', buf);

    // 1D: Desktop Cosmic Soundscapes (Navarasas)
    console.log('Capturing Desktop Cosmic Soundscapes...');
    await pageWeb.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sndBtn = btns.find((b) => b.textContent.includes('SOUNDSCAPES') || b.textContent.includes('Soundscapes'));
      if (sndBtn) sndBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Select "Adbhuta — Wonder & Amazement"
    await pageWeb.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button'));
      const adbhuta = cards.find((c) => c.textContent.includes('Adbhuta'));
      if (adbhuta) adbhuta.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    buf = await pageWeb.screenshot({ type: 'png' });
    saveBoth('05_web_soundscapes.png', buf);
    await pageWeb.close();

    // ══════════════════════════════════════════════════════════════════════════
    // 2. ANDROID MOBILE SCREENSHOTS (412 x 915 — Pixel 7 / Modern Android)
    // ══════════════════════════════════════════════════════════════════════════
    console.log('Switching to Android Mobile Viewport (412x915)...');
    const pageMobile = await browser.newPage();
    await pageMobile.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36');
    await pageMobile.setViewport({
      width: 412,
      height: 915,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2.5,
    });

    // 2A: Android Landing
    console.log('Capturing Android Landing...');
    await pageMobile.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2000));
    buf = await pageMobile.screenshot({ type: 'png' });
    saveBoth('06_android_landing.png', buf);

    // 2B: Android Exoplanet Analysis with Transit Detection
    console.log('Capturing Android Exoplanet Analysis...');
    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exBtn = btns.find((b) => b.textContent.includes('EXOPLANET') || b.textContent.includes('Exoplanet') || b.textContent.includes('◉'));
      if (exBtn) exBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find((b) => b.textContent.includes('GENERATE'));
      if (genBtn) genBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const runBtn = btns.find((b) => b.textContent.includes('RUN ANALYSIS'));
      if (runBtn) runBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2800));

    buf = await pageMobile.screenshot({ type: 'png' });
    saveBoth('07_android_exoplanet_detected.png', buf);

    // 2C: Android Asteroid Comm Network with Dijkstra Rerouting
    console.log('Capturing Android Comm Network & Dijkstra...');
    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const netBtn = btns.find((b) => b.textContent.includes('COMM') || b.textContent.includes('Comm') || b.textContent.includes('◎'));
      if (netBtn) netBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Trigger disruption on Android
    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const trigBtn = btns.find((b) => b.textContent.includes('TRIGGER ASTEROID'));
      if (trigBtn) trigBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    buf = await pageMobile.screenshot({ type: 'png' });
    saveBoth('08_android_network_rerouted.png', buf);

    // 2D: Android Cosmic Soundscapes
    console.log('Capturing Android Soundscapes...');
    await pageMobile.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sndBtn = btns.find((b) => b.textContent.includes('SOUNDSCAPES') || b.textContent.includes('Soundscapes') || b.textContent.includes('◑'));
      if (sndBtn) sndBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await pageMobile.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button'));
      const shanta = cards.find((c) => c.textContent.includes('Shanta') || c.textContent.includes('Peace'));
      if (shanta) shanta.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    buf = await pageMobile.screenshot({ type: 'png' });
    saveBoth('09_android_soundscapes.png', buf);
    await pageMobile.close();

    console.log('All screenshots captured successfully for both Web and Android!');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
