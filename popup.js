// FlipMargin popup: fee/ROI settings, tier gate, and search results CSV export.
const extpay = ExtPay('flipmargin-pro');

const FM_FEE_PRESETS = { standard: 13.6, store: 12.7 };
const FM_DEFAULT_SETTINGS = { feeMode: 'standard', feePct: FM_FEE_PRESETS.standard, roiPct: 30 };
const FM_FIXED_FEE_HINT = 'Plus $0.30 per order on sales of $10 or less, $0.40 above $10.';
const FM_FREE_ROW_LIMIT = 15;

const $ = (id) => document.getElementById(id);

const fmPopup = {
  isPro: false,
  settings: { ...FM_DEFAULT_SETTINGS },
};

// ---------- Helpers ----------

function fmNumberOr(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

// Mirrors fmNormalizeSettings in content.js, including the v1.0.0 migration.
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

function fmSetStatus(id, message, kind) {
  const el = $(id);
  el.textContent = message;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

// ---------- Tier UI ----------

function fmRenderTier() {
  const { isPro, settings } = fmPopup;
  const pill = $('plan-pill');
  pill.textContent = isPro ? 'PRO' : 'FREE';
  pill.classList.toggle('is-pro', isPro);

  $('fee-mode').value = settings.feeMode;
  $('fee-pct').disabled = !isPro;
  $('fee-pct').value = settings.feePct;
  $('fee-pro-tag').hidden = isPro;
  fmRenderFeeMode();
  $('roi-pct').value = settings.roiPct;

  $('export-limit').textContent = isPro
    ? 'Pro: unlimited rows per export.'
    : `Free plan: up to ${FM_FREE_ROW_LIMIT} rows per export.`;
  $('upgrade-section').hidden = isPro;
  $('manage-section').hidden = !isPro;
}

function fmRenderFeeMode() {
  const isCustom = $('fee-mode').value === 'custom';
  $('custom-fee').hidden = !isCustom;
  $('fee-hint').textContent = isCustom && !fmPopup.isPro
    ? `Custom fee % is a Pro feature. Free badges use the standard ${FM_FEE_PRESETS.standard}%.`
    : FM_FIXED_FEE_HINT;
}

async function fmRefreshPro() {
  try {
    const user = await extpay.getUser();
    const isPro = user.paid === true;
    await chrome.storage.local.set({ fmIsPro: isPro });
    // Only re-render on a tier change so in-progress input edits aren't overwritten.
    if (isPro !== fmPopup.isPro) {
      fmPopup.isPro = isPro;
      fmRenderTier();
    }
  } catch (e) {
    // Offline or ExtensionPay unreachable: keep the cached status.
  }
  return fmPopup.isPro;
}

// ---------- Settings ----------

async function fmSaveSettings() {
  const roiPct = Number($('roi-pct').value);
  if (!Number.isFinite(roiPct) || roiPct < 0 || roiPct > 1000) {
    fmSetStatus('settings-status', 'Target ROI must be between 0 and 1000%.', 'error');
    return;
  }

  const feeMode = $('fee-mode').value;
  let feePct = fmPopup.settings.feePct;
  if (feeMode === 'custom' && fmPopup.isPro) {
    feePct = Number($('fee-pct').value);
    if (!Number.isFinite(feePct) || feePct < 0 || feePct > 100) {
      fmSetStatus('settings-status', 'Fee must be between 0 and 100%.', 'error');
      return;
    }
  }

  fmPopup.settings = { feeMode, feePct, roiPct };
  await chrome.storage.local.set({ fmSettings: fmPopup.settings });
  fmRenderTier();
  fmSetStatus('settings-status', 'Saved. Badges on open eBay tabs update automatically.', 'ok');
}

async function fmResetSettings() {
  fmPopup.settings = { ...FM_DEFAULT_SETTINGS };
  await chrome.storage.local.set({ fmSettings: fmPopup.settings });
  fmRenderTier();
  fmSetStatus('settings-status', `Reset to the standard ${FM_FEE_PRESETS.standard}% fee and 30% ROI.`, 'ok');
}

// ---------- CSV ----------

function fmCsvField(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Prevent spreadsheet formula injection from listing titles.
function fmSafeText(text) {
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function fmBuildCsv(rows, roiPct) {
  const header = [
    'Title',
    'Price',
    'Shipping',
    'Gross Total',
    'Est. Fee',
    'Net Payout',
    `Max Buy @${+roiPct.toFixed(2)}% ROI`,
    'Item URL',
  ];
  const lines = [header.map(fmCsvField).join(',')];
  for (const r of rows) {
    lines.push(
      [
        fmSafeText(r.title),
        r.price.toFixed(2),
        r.shipping.toFixed(2),
        r.gross.toFixed(2),
        r.fee.toFixed(2),
        r.net.toFixed(2),
        r.maxBuy.toFixed(2),
        r.url,
      ]
        .map(fmCsvField)
        .join(',')
    );
  }
  // RFC 4180: CRLF line breaks. BOM lets Excel detect UTF-8.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

function fmDownload(csv) {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flipmargin-ebay-comps-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function fmExport() {
  const button = $('export-csv');
  button.disabled = true;
  fmSetStatus('export-status', 'Reading listings…');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !/^https:\/\/([a-z0-9-]+\.)*ebay\.com\//i.test(tab.url)) {
      fmSetStatus('export-status', 'Open an eBay search results page, then try again.', 'error');
      return;
    }

    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { type: 'FM_EXTRACT' });
    } catch (e) {
      fmSetStatus('export-status', 'Could not reach the page. Reload the eBay tab and try again.', 'error');
      return;
    }

    const rows = (response && response.rows) || [];
    if (!rows.length) {
      const msg = response && response.isItemPage
        ? 'CSV export works on search results pages. Search eBay, then export.'
        : 'No listings found on this page.';
      fmSetStatus('export-status', msg, 'error');
      return;
    }

    const isPro = await fmRefreshPro();
    const exported = isPro ? rows : rows.slice(0, FM_FREE_ROW_LIMIT);
    fmDownload(fmBuildCsv(exported, response.roiPct));

    if (exported.length < rows.length) {
      fmSetStatus(
        'export-status',
        `Exported ${exported.length} of ${rows.length} rows. Upgrade to Pro for all rows.`,
        'ok'
      );
    } else {
      fmSetStatus('export-status', `Exported ${exported.length} row${exported.length === 1 ? '' : 's'}.`, 'ok');
    }
  } finally {
    button.disabled = false;
  }
}

// ---------- Init ----------

async function fmInit() {
  const { fmSettings, fmIsPro } = await chrome.storage.local.get(['fmSettings', 'fmIsPro']);
  fmPopup.settings = fmNormalizeSettings(fmSettings);
  fmPopup.isPro = fmIsPro === true;
  fmRenderTier();
  fmRefreshPro();
}

$('save-settings').addEventListener('click', fmSaveSettings);
$('reset-settings').addEventListener('click', fmResetSettings);
$('fee-mode').addEventListener('change', fmRenderFeeMode);
$('export-csv').addEventListener('click', fmExport);
$('upgrade').addEventListener('click', () => extpay.openPaymentPage());
$('restore-pro').addEventListener('click', () => extpay.openLoginPage());
$('manage-subscription').addEventListener('click', () => extpay.openPaymentPage());
for (const id of ['fee-pct', 'roi-pct']) {
  $(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fmSaveSettings();
  });
}

fmInit();
