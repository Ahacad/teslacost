/**
 * Inline SVG country flags for the market switch.
 *
 * Emoji flags (🇨🇦 / 🇺🇸) don't render on Windows/Chrome — the regional-indicator
 * pair falls back to the bare letters "CA" / "US" — so we draw the flags as
 * vectors, which downscale crisply at chip sizes. Artwork from flag-icons
 * (github.com/lipis/flag-icons, MIT); the flags themselves are public domain.
 */

// The US flag defines an SVG <marker> for its stars; ids must be unique per
// instance, since several flags can share the document at once.
let usSeq = 0;

export function Flag({ code, class: cls }: { code: string; class?: string }) {
  const className = cls ? `flag-svg ${cls}` : 'flag-svg';

  if (code === 'CA') {
    return (
      <svg class={className} viewBox="0 0 640 480" role="img" aria-hidden="true">
        <path fill="#fff" d="M150.1 0h339.7v480H150z" />
        <path
          fill="#d52b1e"
          d="M-19.7 0h169.8v480H-19.7zm509.5 0h169.8v480H489.9zM201 232l-13.3 4.4 61.4 54c4.7 13.7-1.6 17.8-5.6 25l66.6-8.4-1.6 67 13.9-.3-3.1-66.6 66.7 8c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8 3.8-32.6 5.6-48.9 0 0-35.7 12.3-38 5.8l-9.2-17.5-32.6 35.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8 13.4q-3.2 1.3-5.2-2.2l-23-46-23.6 47.8q-2.8 2.5-5 .7L264 130.8l13.7 74.1c-1.1 3-3.7 3.8-6.7 2.2l-31.2-35.3c-4 6.5-6.8 17.1-12.2 19.5s-23.5-4.5-35.6-7c4.2 14.8 17 39.6 9 47.7"
        />
      </svg>
    );
  }

  const marker = `us-star-${usSeq++}`;
  return (
    <svg class={className} viewBox="0 0 640 480" role="img" aria-hidden="true">
      <path fill="#bd3d44" d="M0 0h640v480H0" />
      <path stroke="#fff" stroke-width="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640" />
      <path fill="#192f5d" d="M0 0h364.8v258.5H0" />
      <marker id={marker} markerHeight="30" markerWidth="30">
        <path fill="#fff" d="m14 0 9 27L0 10h28L5 27z" />
      </marker>
      <path
        fill="none"
        marker-mid={`url(#${marker})`}
        d="m0 0 16 11h61 61 61 61 60L47 37h61 61 60 61L16 63h61 61 61 61 60L47 89h61 61 60 61L16 115h61 61 61 61 60L47 141h61 61 60 61L16 166h61 61 61 61 60L47 192h61 61 60 61L16 218h61 61 61 61 60z"
      />
    </svg>
  );
}
