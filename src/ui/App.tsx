import { currencyCode } from '@state/settings';
import { MarketTabs } from './components/MarketTabs';
import { Masthead } from './components/Masthead';
import { Hero } from './components/Hero';
import { Decide } from './components/Decide';
import { Controls } from './components/Controls';
import { Takeaways } from './components/Takeaways';
import { ScenarioTable } from './components/ScenarioTable';
import { WhatIf } from './components/WhatIf';
import { Glossary } from './components/Glossary';
import { Footer } from './components/Footer';
import { Legend } from './components/Legend';
import { SectionHead } from './components/SectionHead';
import { MonthlyByTrim } from './sections/MonthlyByTrim';
import { CumulativeChart } from './sections/CumulativeChart';
import { EightYearChart } from './sections/EightYearChart';
import { Tooltip } from './charts/Tooltip';
import { COL } from './colors';

/** Active currency code, reactively (scoped subscription for inline labels). */
const Cur = () => <b>{currencyCode.value}</b>;

export function App() {
  return (
    <>
      <div class="wrap">
        <MarketTabs />
        <Masthead />
        <Hero />
        <Decide />

        <SectionHead no="⚙" title="Your situation" kicker="set the dials once" />
        <div class="ssub">
          Market, tax region, down payment and which running costs to count — the whole page follows.
        </div>
        <Controls />

        <SectionHead no="★" title="The bottom line" kicker="recomputes live" />
        <div class="ssub">Four answers most people actually want, pulled from the full table below.</div>
        <Takeaways />

        <section>
          <SectionHead no="1" title="Every scenario" kicker="monthly & total" />
        </section>
        <div class="ssub">
          Each row builds left → right to your true <b>all-in monthly</b>. Greenest cell in the last
          column = cheapest way to own that car. Hover a header for what it means. Figures in <Cur />.
        </div>
        <Legend items={[
          ['Finance · own it', COL.fin],
          ['Lease · return it', COL.lse],
          ['Cash · outright', COL.csh],
        ]} />
        <ScenarioTable />
        <div class="ssub" style={{ paddingLeft: 0 }}>
          The <b>8-yr net</b> column is the fairest one-look comparison. Lease rarely wins on pure
          cost — you're buying flexibility + a lower monthly. Running / insurance / FSD are excluded
          there because they're identical no matter how you pay.
        </div>

        <section>
          <SectionHead no="2" title="All-in monthly by trim" kicker="finance vs lease" />
        </section>
        <div class="ssub">
          What actually leaves your account each month, with your toggles folded in. Hover any bar.{' '}
          <Cur />.
        </div>
        <MonthlyByTrim />

        <section>
          <SectionHead no="3" title="Cumulative cash over 8 years" kicker="where the lines cross" />
        </section>
        <div class="ssub">
          How much has left your pocket as time passes. <b>Move your cursor across the chart</b> for
          the exact figure at any month.
        </div>
        <CumulativeChart />
        <div class="ssub" style={{ paddingLeft: 0 }}>
          <b>Cash</b> = one step then flat. <b>Finance</b> climbs until the loan is paid off, then
          stops — you own it. <b>Lease</b> climbs forever (a fresh lease begins each term, the little
          step) and owns nothing. Hollow ○ = net of resale.
        </div>

        <section>
          <SectionHead no="4" title="8-year total cost" kicker="net, apples to apples" />
        </section>
        <div class="ssub">
          The bottom line per trim over a shared 8 years. Lower = cheaper. Hover a bar. <Cur />.
        </div>
        <EightYearChart />

        <section>
          <SectionHead no="5" title="Custom what-if" kicker="tweak one deal" />
        </section>
        <div class="ssub">
          Your own numbers, with Tesla's live equation shown so you can see <i>why</i> the payment is
          what it is. Inputs in <Cur />.
        </div>
        <WhatIf />

        <Glossary />
        <Footer />
      </div>
      <Tooltip />
    </>
  );
}
