import type { LeaseResult } from './types';

/**
 * Tesla-style lease. Payment = depreciation + rent charge, then sales tax is
 * applied per payment (never on the residual). Reproduces tesla.com's finplat.
 *
 * @param priceWithFees base price + mandatory fees, pre-tax
 * @param down          capitalized cost reduction (down payment)
 * @param incentive     any rebate applied up front
 * @param residual      Tesla's predicted end-of-lease value, in dollars
 * @param apr           annual rate in percent (e.g. 4.9272)
 * @param termMonths    lease length
 * @param taxRate       provincial sales-tax rate (0 for a pre-tax figure)
 */
export function leaseMonthly(
  priceWithFees: number,
  down: number,
  incentive: number,
  residual: number,
  apr: number,
  termMonths: number,
  taxRate = 0,
): LeaseResult {
  const adjustedCap = priceWithFees - down - incentive;
  // Money factor: APR (in percent) / 2400. The 2400 absorbs both the /100
  // (percent→fraction) and the /24 lease convention. Dividing by 100 again is
  // the classic bug that makes the payment come out far too low.
  const moneyFactor = apr / 2400;
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
