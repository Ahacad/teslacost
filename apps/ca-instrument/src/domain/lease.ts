import type { LeaseResult } from './types';

/**
 * Money factor from an APR in percent. The 2400 absorbs both the /100
 * (percent→fraction) and the /24 lease convention. Dividing by 100 again is the
 * classic bug that makes the payment come out far too low.
 */
export const aprToMoneyFactor = (apr: number): number => apr / 2400;

/**
 * Tesla-style lease. Payment = depreciation + rent charge, then sales tax is
 * applied per payment (never on the residual). Reproduces tesla.com's finplat.
 *
 * Takes the money factor directly so per-trim US rates (read straight off
 * Tesla's lease schedule) and CA's single APR (via {@link aprToMoneyFactor})
 * share one code path.
 *
 * @param priceWithFees base price + mandatory fees, pre-tax
 * @param down          capitalized cost reduction (down payment)
 * @param incentive     any rebate applied up front
 * @param residual      Tesla's predicted end-of-lease value, in dollars
 * @param moneyFactor   lease money factor (apr / 2400)
 * @param termMonths    lease length
 * @param taxRate       sales-tax rate applied per payment (0 for a pre-tax figure)
 */
export function leaseMonthly(
  priceWithFees: number,
  down: number,
  incentive: number,
  residual: number,
  moneyFactor: number,
  termMonths: number,
  taxRate = 0,
): LeaseResult {
  const adjustedCap = priceWithFees - down - incentive;
  const depreciation = (adjustedCap - residual) / termMonths;
  const rent = (adjustedCap + residual) * moneyFactor;
  const monthlyPreTax = depreciation + rent;

  return {
    monthly: monthlyPreTax * (1 + taxRate),
    monthlyPreTax,
    depreciation,
    rent,
    moneyFactor,
    adjustedCap,
    taxOnDown: down * taxRate,
  };
}
