// FlipMargin content script: net profit badges on eBay listings + CSV row extraction for the popup.
const extpay = ExtPay('flipmargin-pro');

// 2026 eBay final value fee presets. Custom % is a Pro override.
const FM_FEE_PRESETS = { standard: 13.6, store: 12.7 };
const FM_DEFAULT_SETTINGS = { feeMode: 'standard', feePct: FM_FEE_PRESETS.standard, roiPct: 30 };
// eBay per-order fee: $0.30 when item + shipping is $10.00 or less, $0.40 above that.
const FM_FIXED_FEE_SMALL = 0.3;
const FM_FIXED_FEE_LARGE = 0.4;
const FM_FIXED_FEE_THRESHOLD = 10;
const FM_MIN_COMPS_FOR_DEALS = 5;

const FM_CARD_SELECTOR = 'li.s-item, li.s-card';
const FM_CARD_TITLE_SELECTOR = '.s-item__title, .s-card__title';
const FM_CARD_PRICE_SELECTOR = '.s-item__price, .s-card__price';
const FM_CARD_SHIPPING_SELECTOR = '.s-item__shipping, .s-item__logisticsCost, .s-item__freeXDays';
const FM_CARD_LINK_SELECTOR = 'a.s-item__link, a.s-card__link, a.su-link, a[href*="/itm/"]';

const FM_ITEM_TITLE_SELECTOR = '.x-item-title__mainTitle, h1.x-item-title, #itemTitle';
const FM_ITEM_PRICE_SELECTOR = '.x-price-primary, [itemprop="price"], #prcIsum';
const FM_ITEM_SHIPPING_SELECTOR =
  '.ux-labels-values--shipping .ux-labels-values__values, #fshippingCost, .d-shipping-minview';

const fmState = {
  feeMode: FM_DEFAULT_SETTINGS.feeMode,
  feePct: FM_DEFAULT_SETTINGS.feePct,
  roiPct: FM_DEFAULT_SETTINGS.roiPct,
  isPro: false,
};

// ---------- Parsing helpers ----------

function fmCleanText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function fmParseMoney(text) {
  if (!text) return null;
  const match = text.match(/(\d{1,3}(?:,\d{3})+|\d+)(\.\d{1,2})?/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, '') + (match[2] || ''));
}

function fmParseShipping(text) {
  if (!text || /free/i.test(text)) return 0;
  const value = fmParseMoney(text);
  return value === null ? 0 : value;
}

function fmCleanUrl(href) {
  try {
    const url = new URL(href, location.href);
    return url.origin + url.pathname;
  } catch (e) {
    return href || '';
  }
}

function fmNumberOr(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

// ---------- Fee math ----------

function fmEffectiveFeePct() {
  if (fmState.feeMode === 'custom') return fmState.isPro ? fmState.feePct : FM_FEE_PRESETS.standard;
  return FM_FEE_PRESETS[fmState.feeMode] || FM_FEE_PRESETS.standard;
}

function fmFixedFee(gross) {
  return gross <= FM_FIXED_FEE_THRESHOLD ? FM_FIXED_FEE_SMALL : FM_FIXED_FEE_LARGE;
}

function fmCalc(price, shipping) {
  const gross = price + shipping;
  const fixedFee = fmFixedFee(gross);
  const fee = gross * (fmEffectiveFeePct() / 100) + fixedFee;
  const net = gross - fee;
  const maxBuy = Math.max(0, net / (1 + fmState.roiPct / 100));
  return { gross, fee, fixedFee, net, maxBuy };
}

function fmMoney(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
}

function fmPct(n) {
  return String(+n.toFixed(2));
}

// ---------- Listing discovery ----------

function fmCardShippingText(card) {
  const direct = card.querySelector(FM_CARD_SHIPPING_SELECTOR);
  if (direct) return direct.textContent;
  // Newer s-card layout puts shipping in a generic attribute row.
  for (const row of card.querySelectorAll('.s-card__attribute-row, .su-styled-text')) {
    const text = row.textContent;
    if (/delivery|shipping/i.test(text) && (/free/i.test(text) || /\d/.test(text))) return text;
  }
  return '';
}

function fmParseCard(card) {
  const titleEl = card.querySelector(FM_CARD_TITLE_SELECTOR);
  const priceEl = card.querySelector(FM_CARD_PRICE_SELECTOR);
  if (!titleEl || !priceEl) return null;

  const title = fmCleanText(titleEl.textContent)
    .replace(/^New Listing\s*/i, '')
    .replace(/\s*Opens in a new window or tab$/i, '');
  const linkEl = card.querySelector(FM_CARD_LINK_SELECTOR);
  const url = linkEl ? fmCleanUrl(linkEl.href) : '';

  // eBay renders a hidden "Shop on eBay" placeholder card at the top of results.
  if (!title || /^shop on ebay$/i.test(title) || url.includes('/itm/123456')) return null;

  const price = fmParseMoney(priceEl.textContent);
  if (price === null) return null;

  return { card, priceEl, title, price, shipping: fmParseShipping(fmCardShippingText(card)), url };
}

function fmCollectListings() {
  const listings = [];
  for (const card of document.querySelectorAll(FM_CARD_SELECTOR)) {
    const parsed = fmParseCard(card);
    if (parsed) listings.push(parsed);
  }
  return listings;
}

function fmParseItemPage() {
  if (!/\/itm\//.test(location.pathname)) return null;
  const priceEl = document.querySelector(FM_ITEM_PRICE_SELECTOR);
  const price = priceEl && fmParseMoney(priceEl.textContent);
  if (!priceEl || price === null) return null;

  const shippingEl = document.querySelector(FM_ITEM_SHIPPING_SELECTOR);
  const titleEl = document.querySelector(FM_ITEM_TITLE_SELECTOR);
  return {
    priceEl,
    title: titleEl ? fmCleanText(titleEl.textContent) : document.title,
    price,
    shipping: fmParseShipping(shippingEl ? shippingEl.textContent : ''),
    url: fmCleanUrl(location.href),
  };
}

// Pro: a listing is a "deal" if buying it at gross total still hits target ROI
// when resold at the median gross of the visible comps.
function fmDealCutoff(listings) {
  if (listings.length < FM_MIN_COMPS_FOR_DEALS) return null;
  const grosses = listings.map((l) => l.price + l.shipping).sort((a, b) => a - b);
  const mid = Math.floor(grosses.length / 2);
  const median = grosses.length % 2 ? grosses[mid] : (grosses[mid - 1] + grosses[mid]) / 2;
  return fmCalc(median, 0).maxBuy;
}

// ---------- Rendering ----------

function fmInjectStyles() {
  if (document.getElementById('fm-styles')) return;
  const style = document.createElement('style');
  style.id = 'fm-styles';
  style.textContent = `
    .fm-badge {
      display: inline-block;
      max-width: 100%;
      margin: 4px 0 2px;
      padding: 3px 9px;
      border: 1px solid #a7f3d0;
      border-radius: 999px;
      background: #ecfdf5;
      color: #065f46;
      font: 600 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      letter-spacing: 0;
      text-decoration: none;
      vertical-align: middle;
      box-sizing: border-box;
    }
    .fm-badge--item { display: block; width: fit-content; margin-top: 8px; font-size: 13px; }
    .fm-badge--deal { background: #047857; border-color: #047857; color: #ffffff; }
    .fm-deal-card { outline: 2px solid #10b981; outline-offset: -2px; border-radius: 8px; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function fmUpsertBadge(anchorEl, calc, { isDeal = false, isItemPage = false } = {}) {
  let badge = anchorEl.nextElementSibling;
  if (!badge || !badge.classList.contains('fm-badge')) {
    badge = document.createElement('span');
    badge.className = 'fm-badge';
    anchorEl.insertAdjacentElement('afterend', badge);
  }
  const roi = fmPct(fmState.roiPct);
  const text =
    `Net: ${fmMoney(calc.net)} (Fee: ${fmMoney(calc.fee)}) | Max Buy @${roi}% ROI: ${fmMoney(calc.maxBuy)}`;
  badge.textContent = isDeal ? `★ Deal · ${text}` : text;
  badge.title =
    `Gross ${fmMoney(calc.gross)} − fees (${fmPct(fmEffectiveFeePct())}% + ${fmMoney(calc.fixedFee)}) ` +
    `= net ${fmMoney(calc.net)}. Max buy keeps ${roi}% ROI. Estimated by FlipMargin.`;
  badge.classList.toggle('fm-badge--deal', isDeal);
  badge.classList.toggle('fm-badge--item', isItemPage);
}

let fmRenderTimer = null;
const fmObserver = new MutationObserver(fmScheduleRender);

function fmScheduleRender() {
  clearTimeout(fmRenderTimer);
  fmRenderTimer = setTimeout(fmRender, 250);
}

function fmRender() {
  // Pause observation so our own badge insertions don't retrigger a render.
  fmObserver.disconnect();
  try {
    const listings = fmCollectListings();
    const dealCutoff = fmState.isPro ? fmDealCutoff(listings) : null;
    for (const listing of listings) {
      const calc = fmCalc(listing.price, listing.shipping);
      const isDeal = dealCutoff !== null && calc.gross <= dealCutoff;
      fmUpsertBadge(listing.priceEl, calc, { isDeal });
      listing.card.classList.toggle('fm-deal-card', isDeal);
    }

    const item = fmParseItemPage();
    if (item) fmUpsertBadge(item.priceEl, fmCalc(item.price, item.shipping), { isItemPage: true });
  } finally {
    fmObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// ---------- CSV extraction ----------

function fmIsVisible(el) {
  return el.getClientRects().length > 0;
}

function fmExtractRows() {
  return fmCollectListings()
    .filter((listing) => fmIsVisible(listing.card))
    .map((listing) => {
      const calc = fmCalc(listing.price, listing.shipping);
      return {
        title: listing.title,
        price: listing.price,
        shipping: listing.shipping,
        gross: calc.gross,
        fee: calc.fee,
        net: calc.net,
        maxBuy: calc.maxBuy,
        url: listing.url,
      };
    });
}

// ---------- State & wiring ----------

// v1.0.0 saved only { feePct, roiPct } with a 13.25% default. Treat that default as the
// new standard preset and any other saved value as a custom rate.
function fmNormalizeSettings(settings) {
  const s = settings || {};
  let feeMode = s.feeMode;
  if (!['standard', 'store', 'custom'].includes(feeMode)) {
    feeMode = s.feePct === undefined || Number(s.feePct) === 13.25 ? 'standard' : 'custom';
  }
  return {
    feeMode,
    feePct: Number(s.feePct) === 13.25 ? FM_DEFAULT_SETTINGS.feePct : fmNumberOr(s.feePct, FM_DEFAULT_SETTINGS.feePct, 0, 100),
    roiPct: fmNumberOr(s.roiPct, FM_DEFAULT_SETTINGS.roiPct, 0, 1000),
  };
}

function fmApplySettings(settings) {
  Object.assign(fmState, fmNormalizeSettings(settings));
}

async function fmLoadState() {
  const { fmSettings, fmIsPro } = await chrome.storage.local.get(['fmSettings', 'fmIsPro']);
  fmApplySettings(fmSettings);
  fmState.isPro = fmIsPro === true;
}

async function fmRefreshPro() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'FM_GET_PRO' });
    if (res && typeof res.isPro === 'boolean') return res.isPro;
  } catch (e) {
    // Service worker unavailable; fall through to a direct lookup.
  }
  try {
    const user = await extpay.getUser();
    return user.paid === true;
  } catch (e) {
    return fmState.isPro;
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.fmSettings) fmApplySettings(changes.fmSettings.newValue);
  if (changes.fmIsPro) fmState.isPro = changes.fmIsPro.newValue === true;
  if (changes.fmSettings || changes.fmIsPro) fmScheduleRender();
});

const fmReady = fmLoadState().then(() => {
  fmInjectStyles();
  fmRender();
  fmRefreshPro().then((isPro) => {
    if (isPro !== fmState.isPro) {
      fmState.isPro = isPro;
      fmScheduleRender();
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'FM_EXTRACT') return;
  fmReady.then(() => {
    sendResponse({
      ok: true,
      rows: fmExtractRows(),
      roiPct: fmState.roiPct,
      feePct: fmEffectiveFeePct(),
      isItemPage: Boolean(fmParseItemPage()),
    });
  });
  return true;
});
