import type { LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";
import { fetchNavigation } from "~/lib/http";
import {
  regularCalculator,
  magnetCalculator,
} from "~/lib/constants/calculator";
import type { Route } from "./+types/calculator";
import { ceilToFraction } from "~/lib/ceilToFraction";
import MagnetCalculatorForm from "~/components/calculator/MagnetCalculatorForm";

export function meta() {
  return [
    { title: "Розрахунок вартості штор" },
    { name: "description", content: "Калькулятор розрахунку шторів" },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const nav = await fetchNavigation();
  return { nav };
}

interface CalculationResult {
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const width = parseFloat(formData.get("width") as string);
  const height = parseFloat(formData.get("height") as string);
  const stripType = formData.get("stripType") as string;
  const overlap = parseInt(formData.get("overlap") as string);
  const addExtraStrip = formData.get("addExtraStrip") === "true";
  const corniceType = formData.get("corniceType") as string;
  const plankType = formData.get("plankType") as string;

  // Get strip type data and extract width (same for both calculators)
  const stripTypeData = regularCalculator.stripTypes.find(
    (st) => st.value === stripType,
  );
  const stripWidth = stripTypeData?.width || 200;
  const ribbonPricePerMeter = stripTypeData?.pricePerMeter || 0;

  // Calculate number of strips
  const effectiveStripWidth = stripWidth - overlap;
  let numberOfStrips = Math.ceil(width / effectiveStripWidth);
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
  } as CalculationResult;
}

export default function Calculator() {
  const { nav } = useLoaderData<typeof loader>();
  const result = useActionData<CalculationResult>();

  return (
    <div className="min-h-screen pb-16">
      <Header navigationItems={nav} />
      <Container className="mt-8">
        <h1 className="text-4xl font-bold mb-8">
          Розрахунок вартості магнітних штор
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Параметри розрахунку</CardTitle>
              </CardHeader>
              <CardContent>
                <MagnetCalculatorForm />
              </CardContent>
            </Card>
          </div>

          {result && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Результати розрахунку</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemGroup>
                    <Item>
                      <ItemContent>
                        <ItemTitle>Кількість смуг</ItemTitle>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>{result.numberOfStrips} шт</ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item>
                      <ItemContent>
                        <ItemTitle>Загальна довжина стрічки</ItemTitle>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>
                          {result.totalRibbonLength.toFixed(2)} мм
                        </ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item>
                      <ItemContent>
                        <ItemTitle>Вартість стрічки</ItemTitle>
                        <div className="text-xs text-muted-foreground">
                          ({(result.totalRibbonLength / 1000).toFixed(2)}м ×{" "}
                          {result.ribbonPricePerMeter.toFixed(2)} грн/м)
                        </div>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>
                          {result.ribbonPrice.toFixed(2)} грн
                        </ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item>
                      <ItemContent>
                        <ItemTitle>Кількість планок</ItemTitle>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>{result.numberOfPlanks} шт</ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item>
                      <ItemContent>
                        <ItemTitle>Вартість планок</ItemTitle>
                        <div className="text-xs text-muted-foreground">
                          ({result.numberOfPlanks} шт ×{" "}
                          {result.plankPricePerPiece.toFixed(2)} грн/шт)
                        </div>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>
                          {result.planksPrice.toFixed(2)} грн
                        </ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item>
                      <ItemContent>
                        <ItemTitle>Вартість карнізу</ItemTitle>
                        <div className="text-xs text-muted-foreground">
                          ({result.width}мм ={" "}
                          {result.numberOfCorniceItems.toFixed(1)} штук ×{" "}
                          {result.cornicePricePerItem.toFixed(2)} грн)
                        </div>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>
                          {result.cornicePrice.toFixed(2)} грн
                        </ItemTitle>
                      </ItemContent>
                    </Item>

                    <ItemSeparator />

                    <Item variant="muted">
                      <ItemContent>
                        <ItemTitle className="text-lg font-bold">
                          Загальна вартість
                        </ItemTitle>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle className="text-lg font-bold">
                          {result.totalPrice.toFixed(2)} грн
                        </ItemTitle>
                      </ItemContent>
                    </Item>
                  </ItemGroup>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
