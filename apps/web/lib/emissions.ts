import type { OnboardingAnswers } from './store';

// ─── Emission Factors ─────────────────────────────────────────────────────────
// kg CO₂e per unit. Sources: DEFRA 2023, EPA EEIO, Climatiq data.

export const DIET_KG_PER_YEAR: Record<OnboardingAnswers['dietType'], number> = {
  vegan:       1_500,
  vegetarian:  1_700,
  flexitarian: 2_200,
  omnivore:    2_800,
  heavy_meat:  3_300,
};

export const TRANSPORT_KG_PER_YEAR: Record<OnboardingAnswers['transportMode'], number> = {
  walk_bike:       100,
  public_transit:  600,
  hybrid_ev:     1_200,
  gas_car:       3_500,
  frequent_flyer: 6_000,
};

export const ENERGY_KG_PER_YEAR: Record<OnboardingAnswers['energySource'], number> = {
  renewable:  400,
  mixed:    1_200,
  fossil:   2_400,
};

export const HOME_SIZE_MULTIPLIER: Record<OnboardingAnswers['homeSqFt'], number> = {
  small:  0.7,
  medium: 1.0,
  large:  1.5,
};

// Peer group average by income bracket (kg CO₂e/year) — UK/US average adjusted
export const PEER_AVERAGE_BY_INCOME: Record<string, number> = {
  under_30k:  5_800,
  '30_60k':   7_200,
  '60_100k':  9_100,
  '100_200k': 12_400,
  over_200k:  18_000,
};

// MCC category → kg CO₂e per $100 spent (spend-based EEIO factors)
export const MCC_EMISSION_FACTORS: Record<string, { co2ePerDollar: number; category: string; label: string }> = {
  '5411': { co2ePerDollar: 0.28, category: 'food',     label: 'Groceries' },
  '5812': { co2ePerDollar: 0.72, category: 'food',     label: 'Restaurants' },
  '5541': { co2ePerDollar: 0.82, category: 'transport', label: 'Gas Station' },
  '4111': { co2ePerDollar: 0.15, category: 'transport', label: 'Transit' },
  '4511': { co2ePerDollar: 0.00, category: 'transport', label: 'Airlines (use manual)' },
  '5940': { co2ePerDollar: 0.45, category: 'shopping',  label: 'Sporting Goods' },
  '5600': { co2ePerDollar: 0.52, category: 'shopping',  label: 'Clothing' },
  '5732': { co2ePerDollar: 0.31, category: 'shopping',  label: 'Electronics' },
  '4900': { co2ePerDollar: 0.19, category: 'energy',    label: 'Utilities' },
  '5310': { co2ePerDollar: 0.35, category: 'shopping',  label: 'Discount Stores' },
};

// Manual entry factors
export const MANUAL_FACTORS = {
  flight_short:       { co2eKg: 255,   label: 'Short-haul flight (<3h)',  category: 'transport' as const },
  flight_long:        { co2eKg: 1_100, label: 'Long-haul flight (>6h)',   category: 'transport' as const },
  car_trip_100km:     { co2eKg: 18.4,  label: 'Car trip (100 km)',        category: 'transport' as const },
  beef_kg:            { co2eKg: 27,    label: 'Beef (1 kg)',               category: 'food'      as const },
  chicken_kg:         { co2eKg: 6.9,   label: 'Chicken (1 kg)',           category: 'food'      as const },
  gas_heating_month:  { co2eKg: 142,   label: 'Natural gas heating (mo)', category: 'energy'    as const },
  electricity_kwh:    { co2eKg: 0.233, label: 'Electricity (1 kWh, grid)', category: 'energy'   as const },
};

// ─── Calculation Functions ────────────────────────────────────────────────────

export function computeBaselineFootprint(answers: OnboardingAnswers): number {
  const diet      = DIET_KG_PER_YEAR[answers.dietType] ?? 2_800;
  const transport = TRANSPORT_KG_PER_YEAR[answers.transportMode] ?? 3_500;
  const energy    = ENERGY_KG_PER_YEAR[answers.energySource] ?? 1_200;
  const sizeMulti = HOME_SIZE_MULTIPLIER[answers.homeSqFt] ?? 1.0;

  return Math.round((diet + transport + energy * sizeMulti) * 10) / 10;
}

export function getMonthlyRecords(records: { date: string; co2eKg: number }[], monthsBack = 6) {
  const now = new Date();
  const buckets: Record<string, number> = {};

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = 0;
  }

  for (const r of records) {
    const key = r.date.slice(0, 7);
    if (key in buckets) buckets[key] += r.co2eKg;
  }

  return Object.entries(buckets).map(([month, co2eKg]) => ({ month, co2eKg: Math.round(co2eKg * 10) / 10 }));
}

export function getCategoryTotals(records: { category: string; co2eKg: number }[]) {
  const totals: Record<string, number> = { food: 0, transport: 0, energy: 0, shopping: 0 };
  for (const r of records) {
    totals[r.category] = (totals[r.category] ?? 0) + r.co2eKg;
  }
  return Object.entries(totals).map(([category, co2eKg]) => ({
    category,
    co2eKg: Math.round(co2eKg * 10) / 10,
  }));
}

export function co2eToTrees(kg: number) { return Math.round(kg / 21); }
export function co2eToFlights(kg: number) { return Math.round((kg / 1_100) * 10) / 10; }
export function co2eToDrivingKm(kg: number) { return Math.round(kg / 0.184); }

export function peerPercentile(userKgYear: number, bracket: string): number {
  const avg = PEER_AVERAGE_BY_INCOME[bracket] ?? 9_000;
  // Simple normal-distribution percentile approximation
  const sigma = avg * 0.35;
  const z = (userKgYear - avg) / sigma;
  return Math.max(1, Math.min(99, Math.round(50 * (1 + ((Math as any).erf ? (Math as any).erf(z / Math.sqrt(2)) : z * 0.4)))));
}

// Seed demo data for the demo dashboard
export function generateDemoRecords() {
  const now = new Date();
  const records = [];
  const categories = [
    { cat: 'food'     as const, sub: 'Restaurants',  label: 'Eating out',     co2e: 2.1 },
    { cat: 'food'     as const, sub: 'Groceries',    label: 'Weekly shop',    co2e: 0.8 },
    { cat: 'transport' as const, sub: 'Gas Station', label: 'Fill-up',        co2e: 12.4 },
    { cat: 'transport' as const, sub: 'Airlines',    label: 'Flight NYC-LAX', co2e: 255  },
    { cat: 'energy'   as const, sub: 'Electricity',  label: 'Monthly bill',   co2e: 38.2 },
    { cat: 'energy'   as const, sub: 'Gas',          label: 'Heating',        co2e: 62.1 },
    { cat: 'shopping' as const, sub: 'Clothing',     label: 'Online order',   co2e: 4.3 },
    { cat: 'shopping' as const, sub: 'Electronics',  label: 'Laptop repair',  co2e: 8.7 },
  ];

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 15);
    for (const c of categories) {
      const jitter = 0.7 + Math.random() * 0.6;
      records.push({
        id: `demo-${monthsAgo}-${c.cat}-${c.sub}`,
        category: c.cat,
        subCategory: c.sub,
        co2eKg: Math.round(c.co2e * jitter * 10) / 10,
        source: 'plaid' as const,
        label: c.label,
        date: d.toISOString().slice(0, 10),
      });
    }
  }
  return records;
}
