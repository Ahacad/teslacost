import { money } from '@state/format';
import { useCountUp } from '../hooks';

/**
 * A base-currency amount, animated as it changes and formatted in the active
 * currency. `money()` subscribes this to currency/FX changes automatically.
 */
export function AnimatedMoney({ value, suffix = '' }: { value: number; suffix?: string }) {
  const current = useCountUp(value);
  return (
    <>
      {money(current)}
      {suffix}
    </>
  );
}
