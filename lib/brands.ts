/**
 * Phone brands common in the Pakistani market, with a few current models each
 * used as typing suggestions. `models` are hints only — the model field stays
 * free text so an unlisted phone is never a dead end.
 */
export interface PhoneBrand {
  name: string;
  models: readonly string[];
}

export const PHONE_BRANDS: readonly PhoneBrand[] = [
  {
    name: 'Samsung',
    models: ['Galaxy A15', 'Galaxy A05s', 'Galaxy A34', 'Galaxy S23', 'Galaxy M14'],
  },
  { name: 'Infinix', models: ['Hot 40i', 'Note 30', 'Smart 8', 'Zero 30'] },
  { name: 'Tecno', models: ['Spark 20', 'Camon 20', 'Pova 5', 'Spark Go'] },
  { name: 'Xiaomi', models: ['Redmi Note 13', 'Redmi 13C', 'Poco X6', 'Redmi Note 12'] },
  { name: 'Vivo', models: ['Y17s', 'Y27', 'Y36', 'V29e'] },
  { name: 'Oppo', models: ['A18', 'A78', 'A58', 'Reno 11'] },
  { name: 'Apple', models: ['iPhone 11', 'iPhone 13', 'iPhone 15', 'iPhone XR'] },
  { name: 'Realme', models: ['C53', 'Note 50', 'C55', '11x'] },
  { name: 'Itel', models: ['A70', 'P55', 'Vision 3'] },
  { name: 'Nokia', models: ['C32', 'G21', '105'] },
  { name: 'Huawei', models: ['Nova 11', 'Y9 Prime', 'P30 Lite'] },
  { name: 'Honor', models: ['X8b', 'X9b', '90 Lite'] },
  { name: 'OnePlus', models: ['Nord CE 3', '11R', 'Nord 3'] },
  { name: 'Google', models: ['Pixel 7a', 'Pixel 8', 'Pixel 6'] },
  { name: 'QMobile', models: ['i8i Pro', 'Z14'] },
];

export function findBrand(name: string): PhoneBrand | undefined {
  const needle = name.trim().toLowerCase();
  for (const brand of PHONE_BRANDS) {
    if (brand.name.toLowerCase() === needle) return brand;
  }
  return undefined;
}

export function searchBrands(query: string): readonly PhoneBrand[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PHONE_BRANDS;
  return PHONE_BRANDS.filter((brand) => brand.name.toLowerCase().includes(needle));
}

/** Translation keys for the tappable quick-symptom chips. */
export const SYMPTOM_KEYS = [
  'crackedScreen',
  'batteryDrain',
  'noCharging',
  'overheating',
  'waterDamage',
  'noSound',
  'cameraBlurry',
  'slowPhone',
  'noSignal',
  'deadPhone',
] as const;
