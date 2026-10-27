# FlipMargin: eBay Profit Badges & Comps CSV Exporter

**Get it on the Chrome Web Store (free):** https://chromewebstore.google.com/detail/pjgcdahejcbcnbinjghpffmbmojnihko

**Free eBay fee calculator site:** https://treborx4.github.io/flipmargin/

FlipMargin is a Chrome extension by Tr3borx4 (Treborx Software) for eBay sellers and flippers. It puts your estimated net payout, eBay fees and max buy price right under every price on eBay search results and item pages, and exports a search page to CSV so you can keep comps in a spreadsheet.

## What's new in 1.0.1

- Fee math updated for 2026. The default final value fee is now 13.6%.
- New fee picker in the popup: Standard 13.6%, Basic Store 12.7%, or Custom % (Pro).
- The per-order fee now follows eBay's rule: $0.30 when item + shipping is $10.00 or less, $0.40 above $10.
- If you saved the old 13.25% default in 1.0.0, it moves to the new 13.6% standard automatically. Any other rate you typed stays as your custom rate.

## Pricing & Delivery

- **Free:** On-page fee and net profit badges, the Standard and Basic Store fee presets, and up to 15 CSV rows per export.
- **FlipMargin Pro ($4.99/month or $19.99 lifetime):** Instant unlock inside the extension for unlimited CSV rows, a custom fee %, and deal highlighting on search pages.

## Cancellation & Refund Policy

Subscriptions can be canceled any time in one click from the FlipMargin popup. Full refunds are given on request within 14 days of any charge.

## Customer Support

Email: tr3borx4@gmail.com

## For developers

```bash
python build.py        # checks manifests and JS, writes dist/flipmargin-v<version>-chrome.zip and -firefox.zip
python build_site.py   # regenerates the GitHub Pages calculator in docs/
```

`manifest.json` is the Chrome build (service worker background). `manifest.firefox.json` is the Firefox build (background scripts plus the gecko id), and `build.py` renames it to `manifest.json` inside the Firefox zip. Payments run through [ExtensionPay](https://extensionpay.com).

Not affiliated with or endorsed by eBay. Fee numbers are estimates.
