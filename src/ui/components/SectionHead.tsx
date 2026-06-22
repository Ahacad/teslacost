import type { ComponentChildren } from 'preact';

/** The repeated editorial section header: number/glyph, title, italic kicker. */
export function SectionHead({
  no,
  title,
  kicker,
}: {
  no: ComponentChildren;
  title: string;
  kicker?: string;
}) {
  return (
    <div class="sec">
      <div class="no">{no}</div>
      <h2>{title}</h2>
      {kicker && <span class="kk">{kicker}</span>}
    </div>
  );
}
