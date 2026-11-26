/* Edge-case tests for calc.js — run with: node test/calc.test.js */
'use strict';
const calc = require('../calc.js');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name); }
}
function approx(a, b) { return Math.abs(a - b) < 0.005; }

// Default / happy paths
let r = calc.compute({ plan: 'monthly', months: 1 });
ok('monthly 1 month total', r.ok && approx(r.total, 28.95));
ok('monthly 1 month perBox', r.ok && approx(r.perBox, 28.95));
ok('monthly 1 month savings 0', r.ok && approx(r.savingsVsMonthly, 0));

r = calc.compute({ plan: 'six' });
ok('6mo upfront total', r.ok && approx(r.total, 155.70));
ok('6mo perBox 25.95', r.ok && approx(r.perBox, 25.95));
ok('6mo boxes 6', r.ok && r.boxes === 6);
ok('6mo savings vs monthly', r.ok && approx(r.savingsVsMonthly, 28.95 * 6 - 155.70));

r = calc.compute({ plan: 'twelve' });
ok('12mo upfront total', r.ok && approx(r.total, 275.40));
ok('12mo perBox 22.95', r.ok && approx(r.perBox, 22.95));
ok('12mo savings vs monthly', r.ok && approx(r.savingsVsMonthly, 72.00));

r = calc.compute({ plan: 'twelve', promo3free: true });
ok('12mo + 3FREE boxes stay 12', r.ok && r.boxes === 12);
ok('12mo + 3FREE total 206.55', r.ok && approx(r.total, 206.55));
ok('12mo + 3FREE perBox 17.21', r.ok && approx(r.perBox, 206.55 / 12));
ok('12mo + 3FREE savings 140.85', r.ok && approx(r.savingsVsMonthly, 28.95 * 12 - 206.55));

r = calc.compute({ plan: 'six', sibling: true });
ok('6mo + sibling total', r.ok && approx(r.total, 155.70 + 30));
ok('sibling cancels in savings', r.ok && approx(r.savingsVsMonthly, 28.95 * 6 - 155.70));

r = calc.compute({ plan: 'twelve', sibling: true, promo3free: true });
ok('12mo + sibling + 3FREE total', r.ok && approx(r.total, 206.55 + 60));

// Promo on wrong plan is ignored, not an error
r = calc.compute({ plan: 'six', promo3free: true });
ok('3FREE ignored on 6mo', r.ok && r.boxes === 6 && r.promo3free === false && approx(r.total, 155.70));

// Edge inputs (monthly plan)
ok('blank months rejected', !calc.compute({ plan: 'monthly', months: '' }).ok);
ok('missing months rejected', !calc.compute({ plan: 'monthly' }).ok);
ok('zero months rejected', !calc.compute({ plan: 'monthly', months: 0 }).ok);
ok('negative months rejected', !calc.compute({ plan: 'monthly', months: -3 }).ok);
ok('fractional months rejected', !calc.compute({ plan: 'monthly', months: 2.5 }).ok);
ok('1e308 rejected (bounds)', !calc.compute({ plan: 'monthly', months: 1e308 }).ok);
ok('1e999 rejected (Infinity)', !calc.compute({ plan: 'monthly', months: 1e999 }).ok);
ok('"Infinity" string rejected', !calc.compute({ plan: 'monthly', months: 'Infinity' }).ok);
ok('text months rejected', !calc.compute({ plan: 'monthly', months: 'six' }).ok);
ok('above max rejected', !calc.compute({ plan: 'monthly', months: 37 }).ok);
ok('max bound 36 ok', calc.compute({ plan: 'monthly', months: 36 }).ok);

r = calc.compute({ plan: 'monthly', months: 36 });
ok('36mo total finite', r.ok && isFinite(r.total) && isFinite(r.perBox));
ok('36mo monthly total 1042.20', r.ok && approx(r.total, 1042.20));

// Bad plan
ok('missing plan rejected', !calc.compute({}).ok);
ok('unknown plan rejected', !calc.compute({ plan: 'yearly' }).ok);

// validateMonths unit checks
ok('validate blank', calc.validateMonths('') !== null);
ok('validate 0', calc.validateMonths('0') !== null);
ok('validate 2.5', calc.validateMonths('2.5') !== null);
ok('validate 12 ok', calc.validateMonths('12') === null);
ok('validate "abc"', calc.validateMonths('abc') !== null);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
