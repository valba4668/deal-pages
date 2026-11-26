/* Raddish Kids subscription cost calculator — pure logic, no DOM.
 * Prices verified live in Raddish's plan builder and checkout on 2026-11-26
 * (https://www.raddishkids.com/products/monthly-cooking-club-membership):
 *   monthly: $28.95/month, renews monthly
 *   6-month: $155.70 upfront ($25.95/month)
 *   12-month: $275.40 upfront ($22.95/month)
 *   6 & 12 month memberships include a free bonus apron (standard benefit, $15 value).
 *   Sibling bundle: $5/month per sibling, paid upfront (extra tool + apron patch each month).
 *   Promo 3FREE (new customers, one week, verified at checkout): $68.85 off the
 *   12-month plan = pay for 9 of 12 months ($206.55). Boxes stay 12. Renews at $275.40.
 *   Note: raddishkids.com/pages/faqs still lists older prices ($27.95 / $287.40).
 */
(function (root) {
  'use strict';

  var PRICES = {
    monthly: { perMonth: 28.95, upfront: null, months: null },
    six:     { perMonth: null, upfront: 155.70, months: 6 },
    twelve:  { perMonth: null, upfront: 275.40, months: 12 }
  };
  var SIBLING_PER_MONTH = 5.0;
  var PROMO_3FREE_DISCOUNT = 68.85; // 3 months at the 12-month rate, off the upfront price
  var MAX_MONTHS = 36;

  function isValidPlan(plan) {
    return plan === 'monthly' || plan === 'six' || plan === 'twelve';
  }

  // Returns null when valid, otherwise a per-field message.
  function validateMonths(raw) {
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return 'Enter how many months you plan to keep it.';
    }
    var n = Number(raw);
    if (!isFinite(n) || isNaN(n)) {
      return 'Months must be a number, not text.';
    }
    if (n < 1) {
      return 'Months must be at least 1.';
    }
    if (n > MAX_MONTHS) {
      return 'Months can be at most ' + MAX_MONTHS + '.';
    }
    if (Math.floor(n) !== n) {
      return 'Months must be a whole number.';
    }
    return null;
  }

  // options: { plan, months (monthly plan only), sibling (bool), promo3free (bool) }
  // Returns { ok: true, boxes, total, perBox, monthlyEquiv, savingsVsMonthly } or { ok: false, errors: {months?, plan?} }
  function compute(options) {
    options = options || {};
    var errors = {};
    var plan = options.plan;
    if (!isValidPlan(plan)) {
      errors.plan = 'Choose a plan.';
    }

    var months;
    if (plan === 'monthly') {
      var msg = validateMonths(options.months);
      if (msg) errors.months = msg;
      else months = Number(options.months);
    } else if (isValidPlan(plan)) {
      months = PRICES[plan].months;
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors: errors };
    }

    var sibling = options.sibling === true;
    var promo3free = options.promo3free === true && plan === 'twelve';

    var boxes = months;

    var total;
    if (plan === 'monthly') {
      total = PRICES.monthly.perMonth * months;
    } else {
      total = PRICES[plan].upfront;
    }
    if (promo3free) {
      total -= PROMO_3FREE_DISCOUNT;
    }
    if (sibling) {
      total += SIBLING_PER_MONTH * months;
    }

    // Sanity: never emit Infinity/NaN/absurd values.
    if (!isFinite(total) || !isFinite(boxes) || boxes <= 0 || total <= 0) {
      return { ok: false, errors: { months: 'Could not compute a result from these inputs.' } };
    }

    var perBox = total / boxes;
    var monthlyEquiv = total / months;
    // Same number of boxes bought month-to-month (including sibling bundle either way).
    var monthlyPlanCost = PRICES.monthly.perMonth * boxes + (sibling ? SIBLING_PER_MONTH * months : 0);
    var savingsVsMonthly = monthlyPlanCost - total;

    // Round to cents; guard against float noise.
    function r2(x) { return Math.round(x * 100) / 100; }
    var result = {
      ok: true,
      plan: plan,
      months: months,
      boxes: boxes,
      total: r2(total),
      perBox: r2(perBox),
      monthlyEquiv: r2(monthlyEquiv),
      savingsVsMonthly: r2(savingsVsMonthly),
      sibling: sibling,
      promo3free: promo3free
    };
    if (!isFinite(result.perBox) || !isFinite(result.monthlyEquiv)) {
      return { ok: false, errors: { months: 'Could not compute a result from these inputs.' } };
    }
    return result;
  }

  var api = { PRICES: PRICES, SIBLING_PER_MONTH: SIBLING_PER_MONTH, PROMO_3FREE_DISCOUNT: PROMO_3FREE_DISCOUNT, MAX_MONTHS: MAX_MONTHS, validateMonths: validateMonths, compute: compute };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.RaddishCalc = api;
})(typeof window !== 'undefined' ? window : this);
