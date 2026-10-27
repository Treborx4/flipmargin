"""Generate the GitHub Pages calculator site in docs/.

    python build_site.py

Edit PAGES below, rerun, commit docs/. Shared styles and math live in docs/assets/.
"""
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"
SITE = "https://treborx4.github.io/flipmargin/"
STORE_URL = "https://chromewebstore.google.com/detail/pjgcdahejcbcnbinjghpffmbmojnihko"
FEE_HELP_URL = "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822"

STANDARD = ("13.6", "Standard 13.6% (most categories)")
STORE = ("12.7", "Basic Store 12.7%")

PAGES = [
    {
        "slug": "",
        "nav": "All categories",
        "title": "eBay Fee Calculator 2026: Net Payout, Shipping and Max Buy Price",
        "description": "Free 2026 eBay fee calculator. Enter a sold price and see the 13.6% final value fee, the $0.30 or $0.40 per-order fee, your shipping cost, net payout and the most you should pay to hit 30% ROI.",
        "h1": "eBay Fee Calculator (2026)",
        "intro": "Type in what it sold for (or what it's selling for) and see what eBay keeps, what lands in your account after the shipping label, and the most you should pay for it if you want a 30% return.",
        "rates": [STANDARD, STORE],
        "price": "45",
        "ship_charged": "0",
        "ship_cost": "5.25",
        "body": """
<h2>How the 2026 eBay fees work</h2>
<p>For most categories eBay takes a final value fee of 13.6% of the total the buyer pays. That total includes shipping and any sales tax, which surprises a lot of people. On top of that there's a per-order fee: $0.30 if the order is $10.00 or less, $0.40 if it's over $10.</p>
<p>If you pay for a Basic Store or higher, most categories drop to around 12.7%. Pick that from the fee dropdown if it applies to you. The rate only covers the first $7,500 of a sale. Anything above that gets charged 2.35%, and the calculator handles that for you.</p>

<h2>What "max buy" means</h2>
<p>Max buy is the most you can pay for an item and still make your target return after fees and shipping. With the default 30% ROI, if you'd net $65 after everything, your max buy is $50 ($50 plus 30% is $65). Change the ROI box if you work with a different number. A lot of people use 30% to 50% for small stuff and less for expensive items that sell fast.</p>

<h2>Shipping, the part people forget</h2>
<p>Put what the buyer pays for shipping in "Shipping charged" and what the label actually costs you in "Your label cost". Free shipping listings are just $0 charged. eBay still charges its percentage on whatever shipping the buyer pays, so charging $8 shipping on a $5 label doesn't make you a full $3.</p>
""",
    },
    {
        "slug": "trading-cards",
        "nav": "Trading Cards",
        "title": "eBay Trading Card Fee Calculator 2026: Pokemon, Sports and TCG",
        "description": "Work out eBay fees on Pokemon, sports and TCG cards in 2026. See the trading card final value fee, the $0.30 or $0.40 per-order fee, PWE or BMWT shipping, net payout and your max buy price.",
        "h1": "eBay Trading Card Fee Calculator",
        "intro": "Built for card flippers. Check the real payout on a single, a slab or a lot before you buy it, including the per-order fee that eats cheap cards alive.",
        "rates": [("13.25", "Trading cards 13.25%"), STANDARD],
        "price": "12",
        "ship_charged": "1.50",
        "ship_cost": "0.97",
        "body": """
<h2>Trading card fees on eBay</h2>
<p>Individual cards in trading card categories (sports, Pokemon, Magic, Yu-Gi-Oh, One Piece and so on) have been charged a slightly lower rate than most categories, 13.25% on the first $7,500. Sealed product and supplies can fall under different categories, so check where you're listing. If eBay's fee page shows a different rate for your category, pick Custom and type it in.</p>

<h2>Why cheap cards are rough</h2>
<p>On a $1 card the per-order fee alone is 30 cents. Add the percentage fee and a stamp and envelope, and you can sell a card and make nothing. Try a $0.99 price with $0.97 shipping cost in the calculator and you'll see it. That's why a lot of sellers bundle low cards into lots or set a minimum like $2.99 plus shipping.</p>

<h2>Tips for card flippers</h2>
<ul>
<li>Use the eBay standard envelope or a plain white envelope for cheap singles, and a bubble mailer with tracking for anything you'd be upset to lose.</li>
<li>Look at sold listings, not active ones, when you set the sale price in the calculator.</li>
<li>For graded cards, include what you paid for grading in your item cost so the ROI is honest.</li>
</ul>
""",
    },
    {
        "slug": "video-games",
        "nav": "Video Games",
        "title": "eBay Video Game Fee Calculator 2026: Games, Consoles and Accessories",
        "description": "See eBay fees on video games, consoles and controllers in 2026. Calculate the final value fee, per-order fee, shipping, net payout and the max you should pay to flip it at 30% ROI.",
        "h1": "eBay Video Game Fee Calculator",
        "intro": "Pricing a stack of retro games from a lot, or a console you want to flip? Plug in the sold price and shipping to see what you actually keep.",
        "rates": [STANDARD, STORE],
        "price": "39.99",
        "ship_charged": "0",
        "ship_cost": "4.80",
        "body": """
<h2>Video game fees on eBay</h2>
<p>Most video games, accessories and consoles use the standard 13.6% rate plus the per-order fee. A few subcategories have had their own rates over the years, so if your listing shows something different on eBay's fee page, pick Custom and type it in.</p>

<h2>Shipping games without losing money</h2>
<p>A single disc game in a case usually ships well under a pound, and Ground Advantage is the normal pick. Consoles are heavier and often land in a different price range for labels, so weigh it before you list. If you offer free shipping, raise the price to cover it and put the label cost in the calculator so the payout is right.</p>

<h2>Flipping game lots</h2>
<ul>
<li>Price the good titles one by one, then decide what the lot is worth to you with the max buy number.</li>
<li>Cartridge only games sell for less than complete in box ones, so look at sold listings for the same condition.</li>
<li>Test consoles before you list. Returns on "untested" consoles get expensive fast.</li>
</ul>
""",
    },
    {
        "slug": "electronics",
        "nav": "Electronics",
        "title": "eBay Electronics Fee Calculator 2026: Phones, Laptops and Gadgets",
        "description": "Calculate eBay fees on phones, laptops, tablets, headphones and other electronics in 2026. See the final value fee, per-order fee, shipping cost, net payout and your max buy price.",
        "h1": "eBay Electronics Fee Calculator",
        "intro": "Electronics move a lot of money per sale, so a couple of percent in fees adds up. Check the payout on a phone, laptop or pair of headphones before you buy it to resell.",
        "rates": [STANDARD, STORE],
        "price": "180",
        "ship_charged": "0",
        "ship_cost": "11.50",
        "body": """
<h2>Electronics fees on eBay</h2>
<p>Most consumer electronics use the standard 13.6% rate on the first $7,500, plus the per-order fee. Some tech subcategories have had different rates, so it's worth a quick look at eBay's fee page for the exact category you're listing in. Use Custom in the dropdown if yours is different.</p>

<h2>Promoted listings and electronics</h2>
<p>Electronics categories are crowded and a lot of sellers pay for promoted listings to get seen. That ad rate is charged on the full sale, just like the final value fee. Open "More options" in the calculator and add your ad rate so you don't get surprised.</p>

<h2>Before you flip electronics</h2>
<ul>
<li>Check that phones aren't carrier locked or blacklisted, and that laptops aren't locked to an account.</li>
<li>Insure anything expensive when you ship it, and add that to your label cost.</li>
<li>Factor in returns. A target ROI of 25% to 30% leaves some room for one going wrong.</li>
</ul>
""",
    },
    {
        "slug": "clothing",
        "nav": "Clothing",
        "title": "eBay Clothing Fee Calculator 2026: Shirts, Jeans, Shoes and Bags",
        "description": "Work out eBay fees on clothing, shoes and accessories in 2026. Calculate the final value fee, per-order fee, poly mailer shipping, net payout and the max you should pay at the thrift store.",
        "h1": "eBay Clothing Fee Calculator",
        "intro": "For thrift and closet flippers. Check what a shirt, pair of jeans or jacket really pays out after eBay fees and the shipping label, and how much you can pay for it on the rack.",
        "rates": [STANDARD, STORE],
        "price": "28",
        "ship_charged": "0",
        "ship_cost": "4.65",
        "body": """
<h2>Clothing fees on eBay</h2>
<p>Most clothing and accessories use the standard 13.6% rate plus the per-order fee. eBay has had special rates for some fashion items, like sneakers over a certain price and handbags, and those change from time to time. If you sell those, look up the current rate on eBay's fee page and type it in with Custom.</p>

<h2>Shipping clothes</h2>
<p>Most single pieces fit in a poly mailer and ship Ground Advantage. Weigh the item in the mailer, since a heavy jacket or jeans can push you into the next weight range. If you offer free shipping, the label comes out of your payout, so add it to the calculator.</p>

<h2>Thrift flipping tips</h2>
<ul>
<li>Set the target ROI higher on cheap items. A $4 shirt that sells for $20 looks great on paper, but your time counts too.</li>
<li>Check sold listings for the same brand, size and condition before you trust a price.</li>
<li>Bundle offers to repeat buyers save you per-order fees and shipping.</li>
</ul>
""",
    },
]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}assets/icon128.png">
<meta name="theme-color" content="#059669">
<link rel="icon" href="{prefix}assets/icon48.png">
<link rel="stylesheet" href="{prefix}assets/style.css">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebApplication","name":"{h1}","url":"{url}","applicationCategory":"BusinessApplication","operatingSystem":"Any","offers":{{"@type":"Offer","price":"0","priceCurrency":"USD"}}}}</script>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="logo" href="{prefix}"><img src="{prefix}assets/icon48.png" alt="" width="28" height="28">FlipMargin</a>
    <nav aria-label="Categories">{nav}</nav>
    <a class="cta cta-sm" href="{store}">Add FlipMargin to Chrome <span class="long">(Free)</span></a>
  </div>
</header>

<main class="wrap">
  <section class="hero">
    <h1>{h1}</h1>
    <p>{intro}</p>
    <a class="cta" href="{store}"><img src="{prefix}assets/icon48.png" alt="" width="20" height="20">Add FlipMargin to Chrome (Free)</a>
  </section>

  <form id="calc" class="calc" autocomplete="off">
    <div class="inputs">
      <div class="grid2">
        <div class="field">
          <label for="price">Sold price</label>
          <div class="money"><input id="price" type="number" inputmode="decimal" min="0" step="0.01" value="{price}"></div>
        </div>
        <div class="field">
          <label for="ship-charged">Shipping charged</label>
          <div class="money"><input id="ship-charged" type="number" inputmode="decimal" min="0" step="0.01" value="{ship_charged}"></div>
          <small>What the buyer pays. 0 for free shipping.</small>
        </div>
        <div class="field">
          <label for="ship-cost">Your label cost</label>
          <div class="money"><input id="ship-cost" type="number" inputmode="decimal" min="0" step="0.01" value="{ship_cost}"></div>
        </div>
        <div class="field">
          <label for="roi">Target ROI</label>
          <div class="pct"><input id="roi" type="number" inputmode="decimal" min="0" step="1" value="30"></div>
        </div>
        <div class="field span2">
          <label for="rate">eBay fee rate</label>
          <select id="rate">{rate_options}<option value="custom">Custom %</option></select>
        </div>
        <div class="field span2" id="custom-wrap" hidden>
          <label for="custom-rate">Custom fee rate</label>
          <div class="pct"><input id="custom-rate" type="number" inputmode="decimal" min="0" max="100" step="0.01" value="{first_rate}"></div>
        </div>
      </div>
      <details class="extra">
        <summary>More options: item cost, sales tax, promoted listings</summary>
        <div class="grid2">
          <div class="field">
            <label for="item-cost">What you paid</label>
            <div class="money"><input id="item-cost" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div>
            <small>Shows your profit and ROI.</small>
          </div>
          <div class="field">
            <label for="tax">Buyer sales tax</label>
            <div class="pct"><input id="tax" type="number" inputmode="decimal" min="0" max="20" step="0.01" placeholder="0"></div>
            <small>eBay charges its % on tax too.</small>
          </div>
          <div class="field">
            <label for="ad">Promoted listing rate</label>
            <div class="pct"><input id="ad" type="number" inputmode="decimal" min="0" max="100" step="0.1" placeholder="0"></div>
          </div>
        </div>
      </details>
    </div>

    <div class="results" aria-live="polite">
      <div class="big">
        <div class="label">Max buy price</div>
        <div class="value" id="max-buy">$0.00</div>
        <div class="sub" id="max-buy-sub"></div>
      </div>
      <table class="lines">
        <tr><td>Buyer pays (item + shipping)</td><td id="r-gross"></td></tr>
        <tr><td id="r-fvf-label">Final value fee</td><td id="r-fvf"></td></tr>
        <tr><td>Per-order fee</td><td id="r-order"></td></tr>
        <tr id="r-ad-row" hidden><td>Promoted listing fee</td><td id="r-ad"></td></tr>
        <tr><td>Shipping label</td><td id="r-ship"></td></tr>
        <tr class="total"><td>You keep<br><small id="r-fees-pct"></small></td><td id="r-after"></td></tr>
        <tr id="r-profit-row" class="total" hidden><td>Profit<br><small id="r-roi"></small></td><td><span id="r-profit"></span></td></tr>
      </table>
    </div>
  </form>

  <section class="band">
    <p><strong>Want this on every eBay listing?</strong>FlipMargin is a free Chrome extension that puts your net payout, fees and max buy price right under each price while you browse eBay, and exports search results to a CSV for comps.</p>
    <a class="cta" href="{store}"><img src="{prefix}assets/icon48.png" alt="" width="20" height="20">Add FlipMargin to Chrome (Free)</a>
  </section>

  <article class="content">
{body}
    <h2>Other calculators</h2>
    <ul class="cats">{cat_links}</ul>
    <p>Fee rates change. Before you rely on a number, double check the current rates on <a href="{fee_help}" rel="nofollow">eBay's selling fees page</a>.</p>
  </article>
</main>

<footer>
  <div class="wrap">
    <p>Made by Treborx Software. Not affiliated with or endorsed by eBay. Estimates only.</p>
    <p><a href="{store}">FlipMargin on the Chrome Web Store</a> &middot; <a href="https://github.com/treborx4/flipmargin">Source on GitHub</a> &middot; <a href="https://github.com/treborx4/flipmargin/blob/main/PRIVACY.md">Privacy</a></p>
  </div>
</footer>
<script src="{prefix}assets/calc.js"></script>
</body>
</html>
"""


def page_url(slug):
    return SITE + (slug + "/" if slug else "")


def render(page):
    slug = page["slug"]
    prefix = "../" if slug else ""
    nav = "".join(
        f'<a href="{prefix}{p["slug"] + "/" if p["slug"] else ""}"'
        + (' aria-current="page"' if p["slug"] == slug else "")
        + f'>{escape(p["nav"])}</a>'
        for p in PAGES
    )
    cat_links = "".join(
        f'<li><a href="{prefix}{p["slug"] + "/" if p["slug"] else ""}">{escape(p["h1"])}</a></li>'
        for p in PAGES
        if p["slug"] != slug
    )
    rate_options = "".join(f'<option value="{v}">{escape(label)}</option>' for v, label in page["rates"])
    return TEMPLATE.format(
        title=escape(page["title"]),
        description=escape(page["description"]),
        url=page_url(slug),
        site=SITE,
        prefix=prefix,
        nav=nav,
        store=STORE_URL,
        fee_help=FEE_HELP_URL,
        h1=escape(page["h1"]),
        intro=escape(page["intro"]),
        price=page["price"],
        ship_charged=page["ship_charged"],
        ship_cost=page["ship_cost"],
        rate_options=rate_options,
        first_rate=page["rates"][0][0],
        body=page["body"].strip(),
        cat_links=cat_links,
    )


def main():
    today = date.today().isoformat()
    urls = []
    for page in PAGES:
        out = DOCS / page["slug"] / "index.html" if page["slug"] else DOCS / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        html = render(page)
        for bad in ("—", "–"):
            if bad in html:
                raise SystemExit(f"dash character found in {out}")
        out.write_text(html, encoding="utf-8", newline="\n")
        urls.append(page_url(page["slug"]))
        print(f"wrote {out.relative_to(ROOT)}")

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        sitemap.append(f"  <url><loc>{url}</loc><lastmod>{today}</lastmod></url>")
    sitemap.append("</urlset>")
    (DOCS / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8", newline="\n")
    print("wrote docs/sitemap.xml")


if __name__ == "__main__":
    main()
