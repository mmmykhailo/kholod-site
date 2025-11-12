import { regularCalculator, magnetCalculator } from "~/lib/constants/calculator";
import { ceilToFraction } from "~/lib/ceilToFraction";

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

export function calculateCurtainPrice(input: CalculationInput): CalculationResult {
  const { width, height, stripType, overlap, addExtraStrip, corniceType, plankType } = input;

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

  // Calculate total ribbon length
  const totalRibbonLength = numberOfStrips * height;

  // Calculate ribbon price
  const ribbonPrice = (totalRibbonLength / 1000) * ribbonPricePerMeter;

  // Calculate planks price
  const numberOfPlanks = numberOfStrips;
  let plankPricePerPiece = 0;

  // Check if using magnet calculator (алюміній)
  if (plankType === magnetCalculator.plankType.value) {
    plankPricePerPiece = magnetCalculator.plankType.price;
  } else {
    const plankData = regularCalculator.plankTypes.find(
      (pt) => pt.value === plankType,
    );
    plankPricePerPiece = plankData?.price || 0;
  }
  const planksPrice = numberOfPlanks * plankPricePerPiece;

  // Calculate cornice price
  let cornicePricePerItem = 0;
  let corniceItemLength = 0;

  // Check if using magnet calculator (алюміній)
  if (corniceType === magnetCalculator.corniceType.value) {
    cornicePricePerItem = magnetCalculator.corniceType.pricePerItem;
    corniceItemLength = magnetCalculator.corniceType.itemLength;
  } else {
    const corniceData = regularCalculator.corniceTypes.find(
      (ct) => ct.value === corniceType,
    );
    cornicePricePerItem = corniceData?.pricePerItem || 0;
    corniceItemLength = corniceData?.itemLength || 0;
  }
  const cornicePricePerMeter = cornicePricePerItem / corniceItemLength;

  let corniceMeters = width / 1000;
  if (corniceMeters < corniceItemLength) {
    corniceMeters = corniceItemLength;
  }

  corniceMeters = ceilToFraction(corniceMeters, corniceItemLength / 2);

  const cornicePrice = corniceMeters * cornicePricePerMeter;
  const numberOfCorniceItems = corniceMeters / corniceItemLength;

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
