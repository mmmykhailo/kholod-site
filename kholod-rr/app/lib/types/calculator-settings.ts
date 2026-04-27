export type StripType = {
  id: number;
  slug: string;
  label: string;
  width: number;
  pricePerMeter: number;
};

export type PlankType = {
  id: number;
  slug: string;
  label: string;
  stripWidth: number;
  price: number;
};

export type CorniceType = {
  id: number;
  slug: string;
  label: string;
  pricePerItem: number;
  itemLength: number;
  itemFractionToCeil: number;
  hasPlank?: boolean;
};

export type RegularCalculatorSettings = {
  stripTypes: StripType[];
  overlapOptions: number[];
  plankTypes: PlankType[];
  corniceTypes: CorniceType[];
  defaultOverlap: number;
  defaultPlankType: string | null;
  defaultCorniceType: string | null;
};

export type MagnetCalculatorSettings = {
  stripTypes: StripType[];
  plankTypes: PlankType[];
  corniceType: CorniceType;
  defaultOverlap: number;
  addExtraStrip: boolean;
};

export type CalculatorSettings = {
  id: number;
  regularCalculator: RegularCalculatorSettings;
  magnetCalculator: MagnetCalculatorSettings;
};
