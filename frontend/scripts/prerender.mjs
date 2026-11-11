// Runs after `vite build`: opens every sitemap page in headless Chrome and saves the finished HTML to
// dist/_pages/<path>.html, so search engines and AI crawlers get each page's real title, text and canonical
// link without running JavaScript. Visitors still get the normal app (it re-renders over the saved HTML).
//
// dist/index.html becomes the pre-rendered home page; the empty app shell is kept as dist/app.html, which
// .htaccess serves for every route that has no saved page (/register, unknown URLs …).
//
// Without Chrome the build still works: pages are just not pre-rendered.
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const PORT = 5174; // allowed by the live API's CORS settings
const BASE = `http://127.0.0.1:${PORT}`;
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const WAIT_FOR = new Set(['Document', 'Script', 'Stylesheet', 'XHR', 'Fetch']);

// 1. Keep the plain app shell for routes without a saved page — always, even if pre-rendering fails below.
//    index.html is only the empty shell straight after `vite build`; on a re-run, keep the app.html already made.
const builtIndex = readFileSync(join(DIST, 'index.html'), 'utf8');
if (builtIndex.includes('<div id="root"></div>')) copyFileSync(join(DIST, 'index.html'), join(DIST, 'app.html'));
else if (!existsSync(join(DIST, 'app.html'))) throw new Error('dist/index.html is already pre-rendered and app.html is missing — run `npm run build`');
const shell = readFileSync(join(DIST, 'app.html'), 'utf8')
  // The shell is served for many addresses: let the app set the canonical link instead of claiming "/"
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
  .replace(/\s*<meta property="og:url"[^>]*>/, '');
writeFileSync(join(DIST, 'app.html'), shell);
rmSync(join(DIST, '_pages'), { recursive: true, force: true });

const chromePath = CHROME_PATHS.find(p => existsSync(p));
if (!chromePath) {
  console.warn('prerender: Chrome not found — skipping (set CHROME_PATH to enable). The site still works as a normal app.');
  process.exit(0);
}

const paths = [...readFileSync(join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)]
  .map(m => decodeURI(m[1]).replace(/\/+$/, '') || '/');

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
});
const profile = mkdtempSync(join(tmpdir(), 'fi-prerender-'));
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9350', `--user-data-dir=${profile}`, '--no-first-run', '--force-prefers-reduced-motion', 'about:blank'], { stdio: 'ignore' });

const cleanup = async () => {
  preview.kill();
  if (chrome.exitCode === null) {
    const exited = new Promise(r => chrome.once('exit', r));
    chrome.kill();
    await Promise.race([exited, sleep(5000)]);
  }
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    /* a leftover temp folder is harmless */
  }
};

try {
  // Wait for the preview server and Chrome
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE)).ok) break; } catch { /* not up yet */ }
    await sleep(250);
  }
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9350/json')).json()).find(t => t.type === 'page'); } catch { /* not up yet */ }
    if (!target) await sleep(250);
  }
  if (!target) throw new Error('Chrome did not start');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  let inflight = new Set();
  const urls = new Map();
  let mainFrame = null;
  let lastActivity = Date.now();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    // Only the page's own code and API data decide when it is ready — not images, fonts or embedded maps
    if (m.method === 'Network.requestWillBeSent' && WAIT_FOR.has(m.params.type) && m.params.frameId === mainFrame) { inflight.add(m.params.requestId); urls.set(m.params.requestId, m.params.request.url); lastActivity = Date.now(); }
    if (m.method === 'Network.loadingFinished' || m.method === 'Network.loadingFailed') { inflight.delete(m.params.requestId); lastActivity = Date.now(); }
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;

  await send('Page.enable');
  await send('Network.enable');
  // Videos are not needed for the HTML and would keep the network busy
  await send('Network.setBlockedURLs', { urls: ['*.mp4', '*.webm', '*.mov', '*.m4v'] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  let saved = 0;
  for (const path of paths) {
    inflight = new Set();
    lastActivity = Date.now();
    mainFrame = (await send('Page.navigate', { url: `${BASE}${path}` })).result?.frameId ?? null;
    // Settled = no requests for 800 ms (API data loaded), at most 15 s
    const started = Date.now();
    await sleep(500);
    while (Date.now() - started < 15000 && (inflight.size > 0 || Date.now() - lastActivity < 800)) await sleep(100);
    if (process.env.PRERENDER_DEBUG) console.log(`prerender: ${path} ${Date.now() - started} ms`, [...inflight].map(r => urls.get(r)));

    const page = await evaluate(`(() => {
      const html = document.documentElement.cloneNode(true);
      // Theme / language are chosen per visitor by the inline script in <head>
      ['class', 'lang', 'dir', 'style'].forEach(a => html.removeAttribute(a));
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
      html.querySelector('body')?.removeAttribute('style');
      return { title: document.title, html: '<!doctype html>\\n' + html.outerHTML, words: document.body.innerText.split(/\\s+/).length };
    })()`);
    if (!page || /page not found/i.test(page.title) || page.words < 40) {
      console.warn(`prerender: skipped ${path} (${page ? page.title : 'no page'})`);
      continue;
    }
    const file = path === '/' ? join(DIST, 'index.html') : join(DIST, '_pages', `${path.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, page.html.replaceAll(BASE, 'https://futureinnvo.com'));
    saved++;
  }
  ws.close();
  console.log(`prerender: saved ${saved} of ${paths.length} pages`);
} catch (err) {
  console.warn(`prerender: failed (${err.message}) — the site still works as a normal app`);
} finally {
  await cleanup();
}
