window.chrome = {
  runtime: {
    sendMessage: function(msg, cb){
      if(msg && msg.type==='resolvePricing'){
        setTimeout(function(){ cb({ ok:true, handle:'concept2-bikeerg', productTitle:'Concept 2 Bike Erg', variantTitle:'Default Title', sku:'BikeErg', rrp:250000, promo:214500, onSale:true, saving:35500, matchedBy:'variant id (TEST)', currency:'AUD' }); }, 25);
      } else if (typeof cb==='function'){ setTimeout(function(){ cb({ok:true}); },0); }
    },
    onMessage: { addListener: function(){} }
  },
  storage: {
    sync: { get: function(keys, cb){ cb({ enabled:true, currency:'AUD' }); } },
    onChanged: { addListener: function(){} }
  }
};
// AFS RRP Radar — shared money/percent formatting (content-script global).
(function () {
  window.AFSRRP = window.AFSRRP || {};

  // cents (integer) -> "$1,299.00"
  window.AFSRRP.money = function (cents, currency) {
    if (cents == null || isNaN(cents)) return '';
    var value = Number(cents) / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'AUD',
        currencyDisplay: 'narrowSymbol'
      }).format(value);
    } catch (e) {
      return '$' + value.toFixed(2);
    }
  };

  // discount percent off RRP, e.g. 25
  window.AFSRRP.pct = function (rrp, promo) {
    if (!rrp || rrp <= 0 || promo == null) return null;
    return Math.round((1 - Number(promo) / Number(rrp)) * 100);
  };
})();
// AFS RRP Radar — content script (runs inside the Shopify admin).
// Read-only. Detects draft-order / order line items, asks the service worker for
// RRP (compare-at) vs promo pricing, and annotates each line + a floating summary.
//
// v0.2 — the modern Shopify admin renders the order editor as `s-*` web components
// inside deeply nested Shadow DOM, and product line links are <s-internal-link>
// custom elements (not <a>) with href /products/{id}/variants/{variantId}. So we:
//   1) pierce shadow roots when scanning (a flat querySelectorAll can't see them),
//   2) match any element with a /products/{id} href (not just <a>),
//   3) read the variantId straight off the href → exact storefront match,
//   4) inline-style the per-line badges (injected content.css can't cross the
//      shadow boundary, so external classes wouldn't apply inside a line row).
// The floating summary panel lives in the light DOM, so content.css still styles it.
//
// Because Shadow-DOM mutations don't bubble to a document observer, we also poll on
// a low-frequency interval as a safety net. A manual "Rescan" button + verbose
// logging (see DEBUG) make tuning quick.

(function () {
  'use strict';

  const CONFIG = {
    // Only activate on the draft-order / order editor, not every admin page.
    pathTest: /\/(draft_orders|orders)(\/|$)/,
    debug: false, // flip true (or set localStorage['afsrrp:debug']='1') for console tracing
    badgeAttr: 'data-afsrrp',
    rescanDebounceMs: 500,
    pollMs: 2000
  };

  const DEBUG = () => CONFIG.debug || localStorage.getItem('afsrrp:debug') === '1';
  const log = (...a) => { if (DEBUG()) console.log('%c[AFS RRP]', 'color:#f26422;font-weight:bold', ...a); };

  const money = (c, cur) => (window.AFSRRP ? window.AFSRRP.money(c, cur) : '$' + (c / 100).toFixed(2));
  const pct = (r, p) => (window.AFSRRP ? window.AFSRRP.pct(r, p) : null);

  let enabled = true;
  let currency = 'AUD';
  let summaryEl = null;
  let observer = null;
  let debounceTimer = null;
  let pollTimer = null;
  const resultCache = new Map(); // lineKey -> { key, res }  (survives shadow-DOM re-renders)

  // ---- shadow-piercing query ----------------------------------------------
  // Collect every element (across open shadow roots) for which pred() is true.
  function deepQueryAll(pred, root, out, roots) {
    root = root || document;
    out = out || [];
    roots = roots || new Set();
    let nodes;
    try { nodes = root.querySelectorAll('*'); } catch (e) { return out; }
    for (const el of nodes) {
      try { if (pred(el)) out.push(el); } catch (e) { /* ignore */ }
      if (el.shadowRoot && !roots.has(el.shadowRoot)) {
        roots.add(el.shadowRoot);
        deepQueryAll(pred, el.shadowRoot, out, roots);
      }
    }
    return out;
  }

  // Parent that may cross a shadow boundary (element → its host).
  function parentAcrossShadow(el) {
    if (el.parentElement) return el.parentElement;
    const root = el.getRootNode && el.getRootNode();
    return (root instanceof ShadowRoot) ? root.host : null;
  }

  const PRICE_RE = /\$\s?[\d,]+\.\d{2}/;

  // ---- store detection -----------------------------------------------------
  function currentStore() {
    // https://admin.shopify.com/store/{handle}/draft_orders/123
    let m = location.pathname.match(/\/store\/([^/]+)\//);
    if (m) return m[1];
    // legacy {handle}.myshopify.com/admin/...
    m = location.hostname.match(/^([^.]+)\.myshopify\.com$/);
    if (m) return m[1];
    return null;
  }

  function onDraftOrderPage() {
    return CONFIG.pathTest.test(location.pathname);
  }

  // ---- line-item detection (shadow-piercing, selector-agnostic) ------------
  function findLineRows() {
    const hrefEls = deepQueryAll(el => {
      const h = el.getAttribute && el.getAttribute('href');
      return h && /\/products\/\d+/.test(h);
    });

    // Group by variant id (falls back to product id). The admin renders both an
    // <s-internal-link> and a paired empty <a> for the same href — grouping and
    // keeping the element with the most text de-dupes them and gives us the title.
    const groups = new Map();
    hrefEls.forEach(el => {
      const href = el.getAttribute('href') || '';
      const vm = href.match(/\/variants\/(\d+)/);
      const pm = href.match(/\/products\/(\d+)/);
      const gid = vm ? 'v' + vm[1] : (pm ? 'p' + pm[1] : href);
      const prev = groups.get(gid);
      const txt = (el.textContent || '').trim();
      if (!prev || txt.length > (prev.el.textContent || '').trim().length) {
        groups.set(gid, { el, productId: pm ? pm[1] : null, variantId: vm ? vm[1] : null });
      }
    });

    const out = [];
    const usedRows = new Set();
    groups.forEach(g => {
      const title = (g.el.textContent || '').trim();
      if (!title || title.length < 2) return;
      // The "row" = nearest ancestor whose text contains a currency amount.
      let el = g.el, row = null, hops = 0;
      while (el && hops < 12) {
        const p = parentAcrossShadow(el);
        if (!p) break;
        if (PRICE_RE.test(p.textContent || '')) { row = p; break; }
        el = p; hops++;
      }
      // Badge host: append into the parent of the SKU line so the badge lands
      // directly BELOW the SKU (left-aligned with title/SKU). The generic
      // "climb until price" host is unreliable — it can land the badge between
      // the title and SKU depending on the row's render state.
      let host = null;
      if (row) {
        const skuLines = deepQueryAll(el => {
          const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
          return /^SKU\b/i.test(t) && !PRICE_RE.test(t) && t.length < 48;
        }, row);
        if (skuLines.length) {
          // outermost pure-SKU element (most text, still no title) → its parent is the title/SKU stack
          skuLines.sort((a, b) => (b.textContent || '').length - (a.textContent || '').length);
          host = parentAcrossShadow(skuLines[0]);
        }
      }
      if (!host) { // fallback: climb to the last block before a price appears
        host = g.el; let h2 = 0;
        while (host && h2 < 8) {
          const p = parentAcrossShadow(host);
          if (!p || PRICE_RE.test(p.textContent || '')) break;
          host = p; h2++;
        }
      }
      row = row || host;
      if (!row || usedRows.has(row)) return;
      usedRows.add(row);
      out.push({ row, badgeHost: host || row, anchor: g.el, productId: g.productId, variantId: g.variantId, title });
    });
    return out;
  }

  // Read the line quantity. In the modern admin each line row carries a single
  // native <input type="number" inputmode="numeric"> whose value IS the quantity
  // (the unit price renders as locked text, not an input). We scope to integer-
  // valued number inputs so an editable price (which always has decimals, e.g.
  // "5999.00") can't be mistaken for the qty, and prefer one sitting near a
  // "Quantity" label if a row ever exposes more than one integer field.
  function extractQty(row) {
    const inputs = deepQueryAll(el => {
      if ((el.tagName || '').toLowerCase() !== 'input') return false;
      const type = (el.getAttribute('type') || '').toLowerCase();
      const im = (el.getAttribute('inputmode') || '').toLowerCase();
      return type === 'number' || im === 'numeric';
    }, row);
    const ints = [];
    inputs.forEach(el => {
      let v = (el.value !== undefined && el.value !== '') ? el.value : el.getAttribute('value');
      if (v == null) return;
      v = String(v).trim();
      if (/^\d{1,5}$/.test(v)) ints.push({ el, n: parseInt(v, 10) });
    });
    if (!ints.length) return 1;
    if (ints.length > 1) {
      // Prefer the integer field whose nearby DOM text mentions "quantity".
      const labelled = ints.find(c => {
        let e = c.el, hops = 0;
        while (e && hops < 4) { if (/quantity/i.test(e.textContent || '')) return true; e = parentAcrossShadow(e); hops++; }
        return false;
      });
      if (labelled) return labelled.n >= 1 ? labelled.n : 1;
    }
    return ints[0].n >= 1 ? ints[0].n : 1;
  }

  function extractRow(info) {
    const text = (info.row.textContent || '').replace(/\s+/g, ' ').trim();
    let sku = '';
    const skuM = text.match(/SKU\s*([A-Za-z0-9._\/\-]+)/i);
    if (skuM) {
      sku = skuM[1];
      // The admin prints the SKU twice back-to-back ("FF-T10FF-T10") — halve it.
      const half = sku.length / 2;
      if (sku.length % 2 === 0 && sku.slice(0, half) === sku.slice(half)) sku = sku.slice(0, half);
    }
    const priceM = text.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
    let priceCents = null;
    if (priceM) priceCents = Math.round(parseFloat(priceM[1].replace(/,/g, '')) * 100);
    return {
      title: info.title,
      sku,
      variantTitle: '',
      priceCents,
      qty: extractQty(info.row),
      productId: info.productId,
      variantId: info.variantId
    };
  }

  // ---- badge rendering (inline-styled; can't rely on content.css in shadow) -
  // A block wrapper drops the badge onto its own line below the SKU (left-aligned
  // with the title/SKU); the inner pill is inline-block + nowrap so it hugs its
  // text instead of stretching to fill the narrow details column.
  const WRAP_STYLE = 'display:block;margin-top:6px;';
  const BADGE_BASE = 'display:inline-block;padding:3px 10px;border-radius:12px;' +
    'font:600 11px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
    'white-space:nowrap;vertical-align:middle;';
  const BADGE_STYLE = {
    pending: 'background:#f1f2f4;color:#6b7177;',
    sale:    'background:#e7f6ec;color:#0a7d32;border:1px solid #b6e3c4;',
    full:    'background:#f1f2f4;color:#6b7177;',
    unknown: 'background:#fff4e5;color:#8a5a00;border:1px solid #ffd8a8;'
  };

  const BADGE_ATTR = 'data-afsrrp-vid';

  // Collect every badge across shadow roots, grouped by the variant id it belongs
  // to. Shopify re-renders the shadow-DOM rows constantly, so we can't trust a
  // per-row element identity — dedupe by variant id instead.
  function collectBadges() {
    const map = new Map();
    deepQueryAll(el => el.classList && el.classList.contains('afsrrp-badge')).forEach(b => {
      const vid = b.getAttribute(BADGE_ATTR) || '';
      if (!map.has(vid)) map.set(vid, []);
      map.get(vid).push(b);
    });
    return map;
  }

  // Ensure exactly one badge exists for this line, sitting in the current host.
  function placeBadge(info, vid, badgeMap) {
    const host = info.badgeHost || info.row;
    const existing = badgeMap.get(vid) || [];
    let keep = existing.find(b => b.parentNode === host) || existing[0] || null;
    existing.forEach(b => { if (b !== keep) b.remove(); });
    if (!keep) {
      keep = document.createElement('div'); // block wrapper → own line under the SKU
      keep.className = 'afsrrp-badge';
      keep.setAttribute(BADGE_ATTR, vid);
      keep.style.cssText = WRAP_STYLE;
      const pill = document.createElement('span');
      pill.className = 'afsrrp-pill';
      keep.appendChild(pill);
      host.appendChild(keep);
    } else if (keep.parentNode !== host) {
      host.appendChild(keep); // row re-rendered → move the survivor into the new host
    }
    badgeMap.set(vid, [keep]);
    return keep;
  }

  function styleBadge(b, state, html, tip) {
    const pill = b.querySelector('.afsrrp-pill') || b;
    pill.style.cssText = BADGE_BASE + (BADGE_STYLE[state] || '');
    pill.innerHTML = html;
    if (tip) pill.title = tip; else pill.removeAttribute('title');
  }

  // qty defaults to 1. On-sale badge + summary reflect the LINE total (unit × qty)
  // so the "save" figure and "Customer saves" tracker move with the quantity.
  function renderInto(badge, res, qty) {
    qty = (qty && qty > 0) ? qty : 1;
    if (!res || !res.ok) {
      styleBadge(badge, 'unknown', 'no live price',
        (res && res.reason) ? res.reason : 'Could not match this line to a storefront product');
      return { unknown: true };
    }
    const cur = res.currency || currency;
    if (res.onSale) {
      const p = pct(res.rrp, res.promo);
      const lineSaving = res.saving * qty;
      const multi = qty > 1;
      styleBadge(badge, 'sale',
        '<strong>ON SALE</strong>' + (multi ? ' &times;' + qty : '') +
        ' &nbsp;was ' + money(res.rrp, cur) + (multi ? ' ea' : '') +
        ' &middot; save ' + money(lineSaving, cur) + (p != null ? ' (' + p + '%)' : ''),
        'Matched by ' + res.matchedBy + ' → ' + (res.productTitle || '') +
        (res.variantTitle && res.variantTitle !== 'Default Title' ? ' / ' + res.variantTitle : '') +
        (multi ? '  |  unit save ' + money(res.saving, cur) + ' × ' + qty : ''));
      return { onSale: true, rrp: res.rrp * qty, promo: res.promo * qty, saving: lineSaving };
    }
    styleBadge(badge, 'full', 'not on sale',
      'RRP = current price (' + money(res.promo, cur) + ')' + (qty > 1 ? ' × ' + qty : '') + ', matched by ' + res.matchedBy);
    const unit = res.rrp != null ? res.rrp : res.promo;
    return { onSale: false, rrp: unit * qty, promo: res.promo * qty, saving: 0 };
  }

  function lineKey(details) {
    return details.variantId || details.productId || ('t:' + details.title);
  }
  function clearAllBadges() {
    deepQueryAll(el => el.classList && el.classList.contains('afsrrp-badge')).forEach(b => b.remove());
  }

  // ---- summary panel (light DOM — content.css applies) ---------------------
  function ensureSummary() {
    if (summaryEl && document.body.contains(summaryEl)) return summaryEl;
    summaryEl = document.createElement('div');
    summaryEl.className = 'afsrrp-summary';
    summaryEl.innerHTML =
      '<div class="afsrrp-head">' +
        '<span class="afsrrp-dot"></span><span class="afsrrp-title">RRP Radar</span>' +
        '<button class="afsrrp-btn afsrrp-rescan" title="Re-scan the line items">Rescan</button>' +
        '<button class="afsrrp-btn afsrrp-hide" title="Hide">&times;</button>' +
      '</div>' +
      '<div class="afsrrp-body"><div class="afsrrp-empty">Scanning line items…</div></div>';
    document.body.appendChild(summaryEl);
    summaryEl.querySelector('.afsrrp-rescan').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'clearCache' }, () => scan(true));
    });
    summaryEl.querySelector('.afsrrp-hide').addEventListener('click', () => {
      summaryEl.classList.add('afsrrp-collapsed');
    });
    summaryEl.querySelector('.afsrrp-head').addEventListener('click', (e) => {
      if (e.target.closest('.afsrrp-btn')) return;
      summaryEl.classList.toggle('afsrrp-collapsed');
    });
    return summaryEl;
  }

  function removeSummary() {
    if (summaryEl) { summaryEl.remove(); summaryEl = null; }
  }

  function renderSummary(stats) {
    const el = ensureSummary();
    const body = el.querySelector('.afsrrp-body');
    if (!stats.lines) {
      const msg = stats.noStore
        ? 'This store isn\'t mapped to a storefront yet. Open the extension Options to add it.'
        : 'No line items detected yet. Add a product, then Rescan.';
      body.innerHTML = '<div class="afsrrp-empty">' + msg + '</div>';
      return;
    }
    const rows = [
      ['Lines scanned', String(stats.lines)],
      ['On sale', String(stats.onSale)],
      ['Total RRP', money(stats.totalRRP, currency)],
      ['Total now', money(stats.totalPromo, currency)]
    ];
    let html = rows.map(r => '<div class="afsrrp-row"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>').join('');
    html += '<div class="afsrrp-row afsrrp-saving"><span>Customer saves</span><span>' +
      money(stats.totalSaving, currency) + '</span></div>';
    if (stats.unknown) html += '<div class="afsrrp-note">' + stats.unknown + ' line(s) had no live price match</div>';
    body.innerHTML = html;
  }

  // ---- main scan -----------------------------------------------------------
  function scan(force) {
    if (!enabled || !onDraftOrderPage()) { removeSummary(); clearAllBadges(); return; }
    const store = currentStore();
    const infos = findLineRows();
    log('scan: store=', store, 'rows=', infos.length, location.pathname);
    ensureSummary();
    const badgeMap = collectBadges();

    if (!infos.length) { renderSummary({ lines: 0 }); pruneBadges(badgeMap, new Set()); return; }
    if (!store) { renderSummary({ lines: 0, noStore: true }); pruneBadges(badgeMap, new Set()); return; }

    const stats = { lines: 0, onSale: 0, totalRRP: 0, totalPromo: 0, totalSaving: 0, unknown: 0 };
    const acc = (r) => {
      if (!r) return;
      stats.lines += 1;
      if (r.unknown) { stats.unknown += 1; return; }
      if (r.onSale) stats.onSale += 1;
      stats.totalRRP += (r.rrp || r.promo || 0);
      stats.totalPromo += (r.promo || 0);
      stats.totalSaving += (r.saving || 0);
    };

    const liveKeys = new Set();
    let pending = 0, dispatched = false;
    const finish = () => { if (dispatched && pending <= 0) renderSummary(stats); };

    infos.forEach(info => {
      const details = extractRow(info);
      const vid = lineKey(details);
      liveKeys.add(vid);
      const key = vid + '|' + (details.priceCents || '');
      const badge = placeBadge(info, vid, badgeMap); // guarantees one badge per line
      const cached = resultCache.get(vid);
      if (!force && cached && cached.key === key) {
        // Reuse cached PRICING (qty-independent) but re-render with the live qty
        // so a quantity change updates the badge + summary without a refetch.
        acc(renderInto(badge, cached.res, details.qty));
        return;
      }
      pending += 1;
      styleBadge(badge, 'pending', 'checking price…');
      chrome.runtime.sendMessage(
        { type: 'resolvePricing', payload: Object.assign({ store }, details) },
        (res) => {
          resultCache.set(vid, { key, res });
          acc(renderInto(badge, res, details.qty));
          pending -= 1;
          finish();
        }
      );
    });
    pruneBadges(badgeMap, liveKeys); // drop badges for lines that are gone
    dispatched = true;
    finish();
  }

  // Remove any badges whose variant id is no longer on the page.
  function pruneBadges(badgeMap, liveKeys) {
    badgeMap.forEach((list, vid) => {
      if (!liveKeys.has(vid)) list.forEach(b => b.remove());
    });
  }

  function scheduleScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => scan(false), CONFIG.rescanDebounceMs);
  }

  // ---- observers: SPA route changes + DOM mutations + poll ------------------
  function watch() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => scheduleScan());
    observer.observe(document.body, { childList: true, subtree: true });

    // Shadow-DOM mutations don't reach the document observer, so poll as a net.
    clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (enabled && onDraftOrderPage()) scan(false); }, CONFIG.pollMs);

    // Quantity edits fire composed 'input'/'change' events that bubble across the
    // shadow boundary when captured at the document — re-scan promptly so the
    // badge + summary saving track the qty without waiting on the poll.
    const onQtyEdit = (e) => {
      const t = e.target;
      if (t && (t.tagName || '').toLowerCase() === 'input' &&
          ((t.getAttribute && t.getAttribute('type') === 'number') ||
           (t.getAttribute && t.getAttribute('inputmode') === 'numeric'))) {
        scheduleScan();
      }
    };
    document.addEventListener('input', onQtyEdit, true);
    document.addEventListener('change', onQtyEdit, true);

    // patch history so SPA navigations re-trigger a scan
    ['pushState', 'replaceState'].forEach(fn => {
      const orig = history[fn];
      history[fn] = function () { const r = orig.apply(this, arguments); window.dispatchEvent(new Event('afsrrp:navigate')); return r; };
    });
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('afsrrp:navigate')));
    window.addEventListener('afsrrp:navigate', () => setTimeout(() => scan(true), 400));
  }

  // ---- init ----------------------------------------------------------------
  function init() {
    chrome.storage.sync.get(['enabled', 'currency'], (s) => {
      enabled = s.enabled !== false; // default on
      currency = s.currency || 'AUD';
      log('init enabled=', enabled, 'currency=', currency);
      watch();
      setTimeout(() => scan(true), 600);
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) { enabled = changes.enabled.newValue !== false; scan(true); }
      if (changes.currency) currency = changes.currency.newValue || 'AUD';
    });
    // popup can ask us to rescan
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === 'rescan') { chrome.runtime.sendMessage({ type: 'clearCache' }, () => scan(true)); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
