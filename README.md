# ZoZoPeak Deal Pages

Standalone SEO pages with interactive cost tools, one folder per page. Each page is plain HTML/CSS/JS with no build step; open `index.html` in a browser.

## Pages

- `raddish-kids-cost-calculator/` — Raddish Kids subscription cost calculator + "Free Raddish Apron with a 6 or 12 month subscription" Vault deal page (EN, US). Prices verified on raddishkids.com on 2026-11-26.

## Standards (from the tool QA rules)

- Tool-first layout, calculator above the fold on mobile.
- Strict input validation: per-field range messages, `aria-invalid`, results stay finite (never Infinity/NaN), errors announced with `role="alert"`, results with `aria-live`.
- Honest result labels: plan cost, before tax, not a market price.
- Visible worked example with defaults.
- Affiliate disclosure immediately before the deal button; deal card explains why it sits next to the tool and who it suits.
- Unique title/description per page; canonical + hreflang set at publish.
- JSON-LD `WebApplication`, no ratings.
- Edge-case unit tests: `node <page>/test/calc.test.js`.
- "Processed in your browser, not sent or stored" privacy line on every tool.

## Publish checklist

1. Set the canonical URL to the final public path.
2. Replace the Vault placeholder link in the deal card with the exact affiliate link from the Vault entry.
3. Re-verify prices and promo on the vendor site; update the verified date.
4. Run the unit tests, then open the page in a real browser and check mobile + desktop.
