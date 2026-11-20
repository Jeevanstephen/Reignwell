export interface NutrientTarget {
  name: string;
  amount: number;    // recommended daily amount
  unit: string;
  efsaMin: number;
  efsaMax: number;
}

export interface RegimenSupplement {
  name: string;
  dose: string;
}

export interface Regimen {
  id: string;
  emoji: string;
  title: string;
  goal: string;
  price: string;
  nutrients: NutrientTarget[];
  supplements: RegimenSupplement[];
}

export const regimens: Regimen[] = [
  {
    id: 'muscle',
    emoji: '💪',
    title: 'Muscle Gain',
    goal: 'Optimise protein synthesis, support recovery, and fuel progressive overload training.',
    price: '~€45/month',
    nutrients: [
      { name: 'Protein',    amount: 160, unit: 'g',  efsaMin: 50,  efsaMax: 210 },
      { name: 'Creatine',   amount: 5,   unit: 'g',  efsaMin: 0,   efsaMax: 5   },
      { name: 'Vitamin D',  amount: 25,  unit: 'µg', efsaMin: 10,  efsaMax: 100 },
      { name: 'Zinc',       amount: 15,  unit: 'mg', efsaMin: 7,   efsaMax: 25  },
      { name: 'Magnesium',  amount: 400, unit: 'mg', efsaMin: 150, efsaMax: 500 },
    ],
    supplements: [
      { name: 'Whey Protein Powder', dose: '30g post-workout' },
      { name: 'Creatine Monohydrate', dose: '5g daily' },
      { name: 'Vitamin D3 + K2', dose: '2000 IU daily' },
      { name: 'Zinc + Magnesium', dose: 'Before bed' },
    ],
  },
  {
    id: 'weightloss',
    emoji: '🔥',
    title: 'Weight Loss',
    goal: 'Support a sustainable calorie deficit while preserving muscle and energy levels.',
    price: '~€38/month',
    nutrients: [
      { name: 'Protein',   amount: 140, unit: 'g',  efsaMin: 50,  efsaMax: 210 },
      { name: 'Fibre',     amount: 30,  unit: 'g',  efsaMin: 20,  efsaMax: 40  },
      { name: 'Vitamin B12', amount: 4, unit: 'µg', efsaMin: 2,   efsaMax: 10  },
      { name: 'Iron',      amount: 14,  unit: 'mg', efsaMin: 6,   efsaMax: 25  },
      { name: 'Omega-3',   amount: 2,   unit: 'g',  efsaMin: 0.5, efsaMax: 3   },
    ],
    supplements: [
      { name: 'Whey Protein Isolate', dose: '25g between meals' },
      { name: 'Omega-3 Fish Oil', dose: '2g with meals' },
      { name: 'Green Tea Extract', dose: '500mg before exercise' },
      { name: 'Vitamin B Complex', dose: 'Morning with food' },
    ],
  },
  {
    id: 'heart',
    emoji: '❤️',
    title: 'Heart Health',
    goal: 'Support cardiovascular function, healthy cholesterol, and blood pressure balance.',
    price: '~€42/month',
    nutrients: [
      { name: 'Omega-3',   amount: 3,   unit: 'g',  efsaMin: 0.5, efsaMax: 5   },
      { name: 'CoQ10',     amount: 100, unit: 'mg', efsaMin: 0,   efsaMax: 300 },
      { name: 'Potassium', amount: 3500, unit: 'mg', efsaMin: 2000, efsaMax: 3500 },
      { name: 'Magnesium', amount: 350, unit: 'mg', efsaMin: 150, efsaMax: 500 },
      { name: 'Vitamin K2', amount: 90, unit: 'µg', efsaMin: 70,  efsaMax: 300 },
    ],
    supplements: [
      { name: 'Omega-3 EPA/DHA', dose: '3g daily with food' },
      { name: 'CoQ10 Ubiquinol', dose: '100mg with breakfast' },
      { name: 'Magnesium Glycinate', dose: '350mg at night' },
      { name: 'Vitamin K2 MK-7', dose: '90µg daily' },
    ],
  },
];
