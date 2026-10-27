// FlipMargin background: ExtPay bootstrap, default settings, and Pro status lookups.
// Chrome service worker imports ExtPay here; Firefox background pages load it via manifest "scripts".
if (typeof ExtPay === 'undefined' && typeof importScripts === 'function') {
  importScripts('ExtPay.js');
}
const extpay = ExtPay('flipmargin-pro');
extpay.startBackground();

const FM_DEFAULT_SETTINGS = { feeMode: 'standard', feePct: 13.6, roiPct: 30 };

chrome.runtime.onInstalled.addListener(async () => {
  const { fmSettings } = await chrome.storage.local.get('fmSettings');
  if (!fmSettings) {
    await chrome.storage.local.set({ fmSettings: FM_DEFAULT_SETTINGS });
  }
});

// Cache Pro status so content scripts and the popup can render instantly.
extpay.onPaid.addListener(() => {
  chrome.storage.local.set({ fmIsPro: true });
});

// Content scripts ask here for Pro status so the ExtensionPay request runs from the extension origin.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'FM_GET_PRO') return;

  const extpay = ExtPay('flipmargin-pro');
  extpay
    .getUser()
    .then((user) => {
      const isPro = user.paid === true;
      chrome.storage.local.set({ fmIsPro: isPro });
      sendResponse({ isPro });
    })
    .catch(async () => {
      const { fmIsPro } = await chrome.storage.local.get('fmIsPro');
      sendResponse({ isPro: fmIsPro === true, cached: true });
    });
  return true;
});
