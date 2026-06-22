import { signal } from '@preact/signals';

export interface TipState {
  html: string;
  x: number;
  y: number;
  show: boolean;
}

export const tip = signal<TipState>({ html: '', x: 0, y: 0, show: false });

export function showTip(html: string, x: number, y: number): void {
  tip.value = { html, x, y, show: true };
}

export function hideTip(): void {
  tip.value = { ...tip.value, show: false };
}
