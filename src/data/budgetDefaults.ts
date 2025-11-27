export interface IncomeBucket {
  id: string;
  min: number;
  max: number;
  representative: number;
  defaults: {
    rent: number;
    utilities: number;
    internet: number;
    mobile: number;
    car: number;
    insurance: number;
    kids: number;
    savings: number;
    subscriptions: number;
    variable_expenses: number;
    debt_repayment: number;
  };
}

export const INCOME_BUCKETS: IncomeBucket[] = [
  {
    id: 'A',
    min: 0,
    max: 150000,
    representative: 150000,
    defaults: {
      rent: 50000,
      utilities: 7000,
      internet: 3000,
      mobile: 3000,
      car: 0,
      insurance: 3000,
      kids: 0,
      savings: 0,
      subscriptions: 2000,
      variable_expenses: 30000,
      debt_repayment: 0,
    },
  },
  {
    id: 'B',
    min: 150000,
    max: 250000,
    representative: 200000,
    defaults: {
      rent: 60000,
      utilities: 10000,
      internet: 4000,
      mobile: 4000,
      car: 10000,
      insurance: 5000,
      kids: 5000,
      savings: 5000,
      subscriptions: 3000,
      variable_expenses: 50000,
      debt_repayment: 10000,
    },
  },
  {
    id: 'C',
    min: 250000,
    max: 350000,
    representative: 300000,
    defaults: {
      rent: 80000,
      utilities: 12000,
      internet: 5000,
      mobile: 5000,
      car: 15000,
      insurance: 7000,
      kids: 10000,
      savings: 10000,
      subscriptions: 5000,
      variable_expenses: 70000,
      debt_repayment: 15000,
    },
  },
  {
    id: 'D',
    min: 350000,
    max: 450000,
    representative: 400000,
    defaults: {
      rent: 100000,
      utilities: 15000,
      internet: 5000,
      mobile: 6000,
      car: 20000,
      insurance: 10000,
      kids: 15000,
      savings: 15000,
      subscriptions: 7000,
      variable_expenses: 90000,
      debt_repayment: 20000,
    },
  },
  {
    id: 'E',
    min: 450000,
    max: 600000,
    representative: 500000,
    defaults: {
      rent: 120000,
      utilities: 20000,
      internet: 6000,
      mobile: 7000,
      car: 25000,
      insurance: 15000,
      kids: 20000,
      savings: 20000,
      subscriptions: 10000,
      variable_expenses: 120000,
      debt_repayment: 25000,
    },
  },
  {
    id: 'F',
    min: 600000,
    max: 10000000,
    representative: 800000,
    defaults: {
      rent: 150000,
      utilities: 25000,
      internet: 6000,
      mobile: 8000,
      car: 30000,
      insurance: 20000,
      kids: 30000,
      savings: 30000,
      subscriptions: 15000,
      variable_expenses: 150000,
      debt_repayment: 30000,
    },
  },
];

export const INCOME_PRESETS = [
  50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 600000, 800000, 1000000,
];

export function getIncomeBucket(income: number): IncomeBucket {
  for (const bucket of INCOME_BUCKETS) {
    if (income >= bucket.min && income < bucket.max) {
      return bucket;
    }
  }
  return INCOME_BUCKETS[INCOME_BUCKETS.length - 1];
}

export function getDefaultValue(income: number, category: keyof IncomeBucket['defaults']): number {
  const bucket = getIncomeBucket(income);
  return bucket.defaults[category];
}
