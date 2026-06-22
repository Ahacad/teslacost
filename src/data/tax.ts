/** Provincial sales-tax options (combined rate applied at checkout). */
export interface Province {
  code: string;
  label: string;
  rate: number;
}

export const PROVINCES: Province[] = [
  { code: 'ON', label: 'Ontario · 13% HST', rate: 0.13 },
  { code: 'AB', label: 'Alberta · 5% GST', rate: 0.05 },
  { code: 'BC', label: 'BC · 12%', rate: 0.12 },
  { code: 'QC', label: 'Quebec · ~15%', rate: 0.14975 },
  { code: 'NS', label: 'Maritimes · 15% HST', rate: 0.15 },
];

export const DEFAULT_PROVINCE = PROVINCES[0];
