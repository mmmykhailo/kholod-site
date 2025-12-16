import {
  regularCalculator,
  magnetCalculator,
} from "~/lib/constants/calculator";

function metersToCornicePieces(value: number): number {
  if (value <= 1.25) return 1;
  if (value <= 1.4) return 1.1;
  if (value <= 1.5) return 1.2;
  if (value <= 1.6) return 1.3;
  if (value <= 1.7) return 1.4;
  if (value <= 1.8) return 1.5;
  if (value <= 1.9) return 1.6;

  if (value <= 2.5) return 2;
  if (value <= 2.7) return 2.2;
  if (value <= 2.9) return 2.4;
  if (value <= 3.1) return 2.5;
  if (value <= 3.3) return 2.7;

  if (value <= 3.75) return 3;
  if (value <= 4.4) return 3.5;
  if (value <= 5) return 4;
  if (value <= 5.6) return 4.5;
  if (value <= 6.3) return 5;

  // 6.3+ → кожні 1.25 = +1 шт, без пропорцій
  return Math.ceil(value / 1.25);
}

export interface CalculationResult {
  width: number;
  height: number;
  stripWidth: number;
  stripType: string;
  overlap: number;
  addExtraStrip: boolean;
  corniceType: string;
  plankType: string;
  numberOfStrips: number;
  realCurtainWidth: number;
  totalRibbonLength: number;
  ribbonPrice: number;
  ribbonPricePerMeter: number;
  numberOfPlanks: number;
  planksPrice: number;
  plankPricePerPiece: number;
  cornicePrice: number;
  numberOfCorniceItems: number;
  cornicePricePerItem: number;
  totalPrice: number;
}

export interface CalculationInput {
  width: number;
  height: number;
  stripType: string;
  overlap: number;
  addExtraStrip: boolean;
  corniceType: string;
  plankType: string;
}

export function calculateCurtainPrice(
  input: CalculationInput,
): CalculationResult {
  const {
    width,
    height,
    stripType,
    overlap,
    addExtraStrip,
    corniceType,
    plankType,
  } = input;

  // Get strip type data and extract width (same for both calculators)
  const stripTypeData = regularCalculator.stripTypes.find(
    (st) => st.value === stripType,
  );
  const stripWidth = stripTypeData?.width || 200;
  const ribbonPricePerMeter = stripTypeData?.pricePerMeter || 0;

  // Calculate number of strips
  const effectiveStripWidth = stripWidth - overlap;
  let numberOfStrips = Math.max(
    1,
    Math.ceil(width / effectiveStripWidth - overlap / effectiveStripWidth),
  );
  if (addExtraStrip) {
    numberOfStrips += 1;
  }

  // Calculate real curtain width
  const realCurtainWidth =
    numberOfStrips * stripWidth - (numberOfStrips - 1) * overlap;

  // Calculate total ribbon length
  const totalRibbonLength = numberOfStrips * height;

  // Calculate ribbon price
  const ribbonPrice = (totalRibbonLength / 1000) * ribbonPricePerMeter;

  // Calculate planks price
  const numberOfPlanks = numberOfStrips;
  let plankPricePerPiece = 0;

  // Try to find plank in regular calculator first, then magnetic calculator
  let plankData = regularCalculator.plankTypes.find(
    (pt) => pt.value === plankType,
  );

  if (!plankData) {
    plankData = magnetCalculator.plankTypes.find(
      (pt) => pt.value === plankType,
    );
  }

  plankPricePerPiece = plankData?.price || 0;
  const planksPrice = numberOfPlanks * plankPricePerPiece;

  // Calculate cornice price
  let cornicePricePerItem = 0;

  // Check if using magnet calculator (алюміній)
  if (corniceType === magnetCalculator.corniceType.value) {
    cornicePricePerItem = magnetCalculator.corniceType.pricePerItem;
  } else {
    const corniceData = regularCalculator.corniceTypes.find(
      (ct) => ct.value === corniceType,
    );
    cornicePricePerItem = corniceData?.pricePerItem || 0;
  }

  const corniceMeters = width / 1000;
  const numberOfCorniceItems = metersToCornicePieces(corniceMeters);
  const cornicePrice = numberOfCorniceItems * cornicePricePerItem;

  // Calculate total price
  const totalPrice = ribbonPrice + planksPrice + cornicePrice;

  return {
    width,
    height,
    stripWidth,
    stripType,
    overlap,
    addExtraStrip,
    corniceType,
    plankType,
    numberOfStrips,
    realCurtainWidth,
    totalRibbonLength,
    ribbonPrice,
    ribbonPricePerMeter,
    numberOfPlanks,
    planksPrice,
    plankPricePerPiece,
    cornicePrice,
    numberOfCorniceItems,
    cornicePricePerItem,
    totalPrice,
  };
}
