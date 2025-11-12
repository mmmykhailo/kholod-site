const STRIP_TYPES = [
  { value: "200×1.7", label: "200×1.7", pricePerMeter: 77, width: 200 },
  { value: "300×2", label: "300×2", pricePerMeter: 140, width: 300 },
] as const;

export const regularCalculator = {
  stripTypes: STRIP_TYPES,
  overlapOptions: [0, 25, 50, 75, 100, 125, 150] as const,
  plankTypes: [
    {
      value: "200-stainless",
      stripWidth: 200,
      label: "Нержавійка",
      price: 27,
    },
    {
      value: "200-galvanized",
      stripWidth: 200,
      label: "Оцинковка",
      price: 20,
    },
    {
      value: "300-stainless",
      stripWidth: 300,
      label: "Нержавійка",
      price: 35,
    },
    {
      value: "300-galvanized",
      stripWidth: 300,
      label: "Оцинковка",
      price: 28,
    },
  ] as const,
  corniceTypes: [
    {
      value: "нержавійка",
      label: "Нержавійка",
      pricePerItem: 240,
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
  plankTypes: [
    {
      value: "200-aluminum",
      stripWidth: 200,
      label: "Алюміній",
      price: 0,
    },
    {
      value: "300-aluminum",
      stripWidth: 300,
      label: "Алюміній",
      price: 0,
    },
  ] as const,
  corniceType: {
    value: "алюміній",
    label: "Алюміній",
    pricePerItem: 0,
    itemLength: 1.25,
    itemFractionToCeil: 0.5,
  } as const,
  overlap: 0,
  addExtraStrip: false,
} as const;
