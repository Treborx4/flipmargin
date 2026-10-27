// eBay fee, shipping and max buy calculator. Everything runs in the browser.
(function () {
  // eBay charges the category rate on the first $7,500 of the order and 2.35% above that.
  var TIER_CAP = 7500;
  var ABOVE_CAP_PCT = 2.35;
  // Per-order fee: $0.30 when item + shipping is $10.00 or less, $0.40 above that.
  var SMALL_ORDER_LIMIT = 10;

  var form = document.getElementById('calc');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };

  function num(id) {
    var n = parseFloat($(id).value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function money(n) {
    var s = '$' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return n < 0 ? '-' + s : s;
  }

  function feeRate() {
    var v = $('rate').value;
    return v === 'custom' ? num('custom-rate') : parseFloat(v);
  }

  function update() {
    $('custom-wrap').hidden = $('rate').value !== 'custom';

    var price = num('price');
    var shipCharged = num('ship-charged');
    var shipCost = num('ship-cost');
    var itemCost = num('item-cost');
    var taxPct = num('tax');
    var adPct = num('ad');
    var roiPct = num('roi');
    var rate = feeRate();

    var gross = price + shipCharged;
    // eBay calculates the percentage fees on the total the buyer pays, sales tax included.
    var feeBase = gross * (1 + taxPct / 100);
    var fvf = (Math.min(feeBase, TIER_CAP) * rate + Math.max(0, feeBase - TIER_CAP) * ABOVE_CAP_PCT) / 100;
    var orderFee = gross > 0 ? (gross <= SMALL_ORDER_LIMIT ? 0.3 : 0.4) : 0;
    var adFee = feeBase * adPct / 100;
    var fees = fvf + orderFee + adFee;
    var payout = gross - fees;
    var afterShip = payout - shipCost;
    var profit = afterShip - itemCost;
    var maxBuy = Math.max(0, afterShip / (1 + roiPct / 100));

    $('max-buy').textContent = money(maxBuy);
    $('max-buy-sub').textContent = 'Pay this or less to make ' + roiPct + '% ROI at this sale price.';
    $('r-gross').textContent = money(gross);
    $('r-fvf').textContent = '-' + money(fvf);
    $('r-fvf-label').textContent = 'Final value fee (' + rate + '%)';
    $('r-order').textContent = '-' + money(orderFee);
    $('r-ad').textContent = '-' + money(adFee);
    $('r-ad-row').hidden = adFee === 0;
    $('r-ship').textContent = '-' + money(shipCost);
    $('r-after').textContent = money(afterShip);
    $('r-after').className = afterShip < 0 ? 'neg' : '';
    $('r-fees-pct').textContent = gross > 0 ? 'Fees are ' + (fees / gross * 100).toFixed(1) + '% of the sale' : '';

    var profitRow = $('r-profit-row');
    profitRow.hidden = itemCost === 0;
    $('r-profit').textContent = money(profit);
    $('r-profit').className = profit < 0 ? 'neg' : '';
    $('r-roi').textContent = itemCost > 0 ? (profit / itemCost * 100).toFixed(0) + '% ROI' : '';
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  update();
})();
