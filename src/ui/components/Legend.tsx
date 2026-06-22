export function Legend({ items }: { items: Array<[string, string]> }) {
  return (
    <div class="legend">
      {items.map(([label, color]) => (
        <span>
          <i class="dot" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
