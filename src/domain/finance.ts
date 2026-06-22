import type { FinanceResult } from './types';

/**
 * Tesla-style finance (amortizing loan). Provincial tax, when present, is
 * rolled into the financed principal — matching tesla.com's finplat engine.
 *
 * @param priceWithFees base price + mandatory fees, pre-tax
 * @param down          down payment
 * @param incentive     any rebate applied up front
 * @param apr           annual rate in percent (e.g. 5.03)
 * @param termMonths    loan length
 * @param taxRate       provincial sales-tax rate (0 for a pre-tax figure)
 */
export function financeMonthly(
  priceWithFees: number,
  down: number,
  incentive: number,
  apr: number,
  termMonths: number,
  taxRate = 0,
): FinanceResult {
  const tax = taxRate * priceWithFees;
  const principal = priceWithFees + tax - down - incentive;
  const preTaxPrincipal = priceWithFees - down - incentive;
  const i = apr / 100 / 12;

  const amortize = (p: number) =>
    i ? (p * i) / (1 - Math.pow(1 + i, -termMonths)) : p / termMonths;

  return {
    monthly: amortize(principal),
    monthlyPreTax: amortize(preTaxPrincipal),
    principal,
    tax,
  };
}
