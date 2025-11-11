const STRIP_TYPES = [
  { value: "200×1.7", label: "200×1.7", pricePerMeter: 100, width: 200 },
  { value: "200×2", label: "200×2", pricePerMeter: 120, width: 200 },
  {
    value: "200×2 матова",
    label: "200×2 матова",
    pricePerMeter: 130,
    width: 200,
  },
  { value: "300×2", label: "300×2", pricePerMeter: 150, width: 300 },
  {
    value: "300×2 матова",
    label: "300×2 матова",
    pricePerMeter: 160,
    width: 300,
  },
  {
    value: "300×2 ребро",
    label: "300×2 ребро",
    pricePerMeter: 170,
    width: 300,
  },
] as const;

export const regularCalculator = {
  stripTypes: STRIP_TYPES,
  overlapOptions: [0, 25, 50, 75, 100] as const,
  plankTypes: [
    { value: "нержавійка", label: "Нержавійка", price: 50 },
    { value: "оцинковка", label: "Оцинковка", price: 30 },
  ] as const,
  corniceTypes: [
    {
      value: "нержавійка",
      label: "Нержавійка",
      pricePerItem: 264,
      itemLength: 1.25,
      itemFractionToCeil: 0.5,
    },
    {
      value: "оцинковка",
      label: "Оцинковка",
      pricePerItem: 156,
      itemLength: 1.25,
      itemFractionToCeil: 0.5,
    },
  ] as const,
} as const;

export const magnetCalculator = {
  stripTypes: STRIP_TYPES,
  plankType: { value: "алюміній", label: "Алюміній", price: 50 } as const,
  corniceType: {
    value: "алюміній",
    label: "Алюміній",
    pricePerItem: 264,
    itemLength: 1.25,
    itemFractionToCeil: 0.5,
  } as const,
  overlap: 0,
  addExtraStrip: false,
} as const;
