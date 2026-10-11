import { chromium } from 'playwright';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Runs fn up to `retries` times with a growing pause; rethrows the last error. */
export async function withRetry(fn, { retries = 3, delayMs = 1000, label = '' } = {}) {
  let last;
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn(i);
    } catch (e) {
      last = e;
      if (i < retries) await sleep(delayMs * i);
    }
  }
  const err = new Error(`${label ? label + ': ' : ''}${last?.message || last}`);
  err.cause = last;
  throw err;
}

const albumIdOf = href => (href.match(/\/albums\/(\d+)/) || [])[1] || null;
const categoryIdOf = href => (href.match(/\/categories\/(\d+)/) || [])[1] || null;
/**
 * Yupoo photo id: the folder holding a photo's sizes, e.g. 05b75aba in https://photo.yupoo.com/minkang/05b75aba/medium.jpg.
 * The album's cover thumbnail and the full-size photo share it.
 */
export const photoIdOf = url => {
  const parts = String(url || '').split(/[?#]/)[0].split('/').filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 2] : null;
};

export function withPage(url, n) {
  const u = new URL(url);
  if (n > 1) u.searchParams.set('page', String(n)); else u.searchParams.delete('page');
  return u.toString();
}

export class YupooClient {
  constructor(config, { headed = false } = {}) {
    this.config = config;
    this.base = config.source.baseUrl.replace(/\/$/, '');
    this.sel = config.selectors;
    this.req = config.requests;
    this.headed = headed;
  }

  async open() {
    this.browser = await chromium.launch({ headless: !this.headed });
    this.context = await this.browser.newContext({
      locale: 'en-GB',
      viewport: { width: 1366, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.req.timeoutMs);
  }

  async close() {
    await this.browser?.close();
  }

  async goto(url) {
    await withRetry(async () => {
      const res = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.req.timeoutMs });
      if (res && res.status() >= 400) throw new Error(`HTTP ${res.status()}`);
      await this.page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    }, { retries: this.req.retries, delayMs: this.req.delayMs, label: `Could not load ${url}` });
    await sleep(this.req.delayMs);
  }

  /** Category links in the store's navigation: [{ id, name, url }]. */
  async categories() {
    await this.goto(this.base + this.config.source.albumsPath);
    const links = await this.page.$$eval(this.sel.categoryLinks.join(','), as =>
      as.map(a => ({ href: a.href, name: (a.getAttribute('title') || a.textContent || '').replace(/\s+/g, ' ').trim() })));
    const seen = new Map();
    for (const l of links) {
      const id = categoryIdOf(l.href);
      if (id && l.name && !seen.has(id)) seen.set(id, { id, name: l.name, url: l.href });
    }
    return [...seen.values()];
  }

  /**
   * All albums in a listing (category page or /albums), following ?page=N until a page adds nothing new.
   * With stopAfter, stops paging once that many albums were found.
   */
  async albumsIn(listUrl, { stopAfter = 0 } = {}) {
    const found = new Map();
    for (let n = 1; n <= this.config.source.maxListPages; n++) {
      if (stopAfter && found.size >= stopAfter) break;
      await this.goto(withPage(listUrl, n));
      const links = await this.page.$$eval(this.sel.albumLinks.join(','), as =>
        as.map(a => ({
          href: a.href,
          title: (a.getAttribute('title') || a.querySelector('.album__title')?.textContent || a.textContent || '').replace(/\s+/g, ' ').trim(),
          cover: a.querySelector('img')?.getAttribute('src') || '',
        })));
      let added = 0;
      for (const l of links) {
        const id = albumIdOf(l.href);
        if (!id || found.has(id) || !l.title) continue;
        const u = new URL(l.href);
        // coverId: the photo the supplier picked as the album's cover (usually the whole shirt), shown first on the site.
        found.set(id, { albumId: id, title: l.title, url: `${u.origin}${u.pathname}${u.searchParams.get('uid') ? '?uid=' + u.searchParams.get('uid') : ''}`, coverId: photoIdOf(l.cover) });
        added++;
      }
      if (!added) break;
    }
    return [...found.values()];
  }

  /** Reads one album: { title, imageUrls[], passwordProtected }. Follows album pagination when present. */
  async readAlbum(url) {
    const urls = [];
    let title = '';
    for (let n = 1; n <= this.config.source.maxAlbumPages; n++) {
      await this.goto(withPage(url, n));
      if (n === 1) {
        const locked = await this.page.$(this.sel.passwordMarkers.join(','));
        if (locked) return { title: '', imageUrls: [], passwordProtected: true };
        // Selectors in priority order. Yupoo wraps the title and the photo count in one <h1>, so a generic
        // selector must not win just by coming first in the document.
        title = await this.page.evaluate(sels => {
          for (const s of sels) {
            const el = document.querySelector(s);
            const t = (el?.getAttribute('data-name') || el?.textContent || '').replace(/\s+/g, ' ').trim();
            if (t) return t;
          }
          return '';
        }, this.sel.albumTitle).catch(() => '');
      }
      await this.autoScroll();
      const pageUrls = await this.page.$$eval(
        this.sel.albumImages.join(','),
        (imgs, attrs) => imgs.map(img => { for (const a of attrs) { const v = img.getAttribute(a); if (v && !v.startsWith('data:')) return v; } return null; }).filter(Boolean),
        this.sel.imageAttrs,
      );
      let added = 0;
      for (const raw of pageUrls) {
        const abs = new URL(raw, this.page.url()).toString();
        if (/avatar|logo|\/static\//i.test(abs) || urls.includes(abs)) continue;
        urls.push(abs);
        added++;
      }
      if (!added) break;
    }
    return { title, imageUrls: urls.slice(0, this.config.images.maxPerAlbum), passwordProtected: false };
  }

  async autoScroll() {
    await this.page.evaluate(async () => {
      await new Promise(resolve => {
        let y = 0;
        const step = () => {
          window.scrollBy(0, 800);
          y += 800;
          if (y >= document.body.scrollHeight || y > 40000) resolve(); else setTimeout(step, 120);
        };
        step();
      });
    });
    await sleep(400);
  }

  /** Downloads an image inside the browser session (same cookies, album page as Referer). */
  async download(imageUrl, referer) {
    return withRetry(async () => {
      const res = await this.context.request.get(imageUrl, { headers: { Referer: referer }, timeout: this.req.timeoutMs });
      if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
      const type = res.headers()['content-type'] || '';
      if (type && !type.startsWith('image/')) throw new Error(`Not an image (${type})`);
      return await res.body();
    }, { retries: this.req.retries, delayMs: this.req.delayMs, label: `Image ${imageUrl}` });
  }
}
