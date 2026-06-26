import {
  selectedTermQuotes,
  selectedScenario,
  financeTermOverride,
  activeMarket,
} from '@state/settings';
import { money } from '@state/format';
import { COL } from '../colors';
import { BarChart } from '../charts/BarChart';
import { Legend } from '../components/Legend';

/** "60" → "5 yr"; keeps an odd term in months. */
const yrs = (m: number) => (m % 12 === 0 ? `${m / 12} yr` : `${m} mo`);

/**
 * Rate-by-term comparison for the selected car. Tesla CA prices the APR by loan
 * length, so a longer term buys a lower monthly at a higher rate AND more months
 * of interest — this lays that trade-off out instead of defaulting to 8 years.
 */
export function FinanceTerms() {
  const quotes = selectedTermQuotes.value;
  const car = selectedScenario.value.vehicle;
  const cfg = activeMarket.value.config;
  const longest = quotes[quotes.length - 1]; // the 8-yr plan
  const activeTerm = financeTermOverride.value ?? cfg.finance.termMonths;
  const anyEst = quotes.some((q) => !q.confirmed);

  // Headline: a realistic 5-yr plan vs the 8-yr default it's compared against.
  const ref = quotes.find((q) => q.months === 60) ?? quotes[0];
  const monthlyGap = Math.round(ref.monthly - longest.monthly); // more $/mo on the shorter term
  const interestSaved = longest.interest - ref.interest;

  const groups = quotes.map((q) => ({
    label: yrs(q.months),
    full: `${car.name} · ${q.months} mo @ ${q.apr.toFixed(2)}%`,
    vals: [q.interest],
  }));

  return (
    <div class="card pad reveal">
      <Legend items={[['Total interest over the term', COL.lse]]} />
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th title="Loan length. Tesla's configurator defaults to 96 mo (8 yr).">Term</th>
              <th title="Standard Tesla Canada finance rate for that term. It rises with length.">
                APR <span class="q">?</span>
              </th>
              <th title="Monthly payment for the selected car at that term, on the same tax basis as the main table.">
                Payment/mo <span class="q">?</span>
              </th>
              <th title="Total interest handed to the lender over the whole term.">
                Total interest <span class="q">?</span>
              </th>
              <th title="Interest saved versus the 8-year (96 mo) plan. Shorter term = less interest at a lower rate.">
                vs 8 yr <span class="q">?</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const delta = q.interest - longest.interest; // negative = saved vs 8 yr
              const isActive = q.months === activeTerm;
              const isLongest = q.months === longest.months;
              return (
                <tr class={isActive ? 'grp' : ''}>
                  <td>
                    <span class="vname">{yrs(q.months)}</span>
                    <span class="swsub"> · {q.months} mo</span>
                    {isLongest && <span class="tag">Tesla default</span>}
                  </td>
                  <td class="num">
                    {q.apr.toFixed(2)}%{!q.confirmed && <span class="tag">est</span>}
                  </td>
                  <td class="num allin">{money(q.monthly)}</td>
                  <td class={`num ${isLongest ? 'worst' : ''}`}>{money(q.interest)}</td>
                  <td class={`num ${delta < 0 ? 'best' : ''}`}>
                    {delta < 0 ? `−${money(-delta)}` : delta > 0 ? money(delta) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div class="ssub" style={{ paddingLeft: 0, marginTop: '12px' }}>
        Take the <b>{yrs(ref.months)}</b> plan over the <b>8-yr</b> default and you pay{' '}
        <b>{money(monthlyGap)}/mo</b> more but hand the lender{' '}
        <b>{money(interestSaved)}</b> less in interest — at {ref.apr.toFixed(2)}% instead of{' '}
        {longest.apr.toFixed(2)}%. Lowest monthly ≠ cheapest car.
        {anyEst && (
          <>
            {' '}
            Rungs tagged <span class="tag">est</span> are estimated from Tesla CA's published
            rate-by-term shape; only 96 mo = {longest.apr.toFixed(2)}% is read directly off
            tesla.com.
          </>
        )}
      </div>

      <BarChart groups={groups} series={[{ name: 'Total interest', color: COL.lse }]} height={300} />
    </div>
  );
}
