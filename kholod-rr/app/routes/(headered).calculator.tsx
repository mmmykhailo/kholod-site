import { useActionData } from "react-router";
import Container from "~/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";
import type { Route } from "./+types/(headered).calculator";
import RegularCalculatorForm from "~/components/calculator/RegularCalculatorForm";
import {
  calculateCurtainPrice,
  type CalculationResult,
} from "~/lib/calculateCurtainPrice";

export function meta() {
  return [
    { title: "Розрахунок вартості штор" },
    { name: "description", content: "Калькулятор розрахунку штор" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  return calculateCurtainPrice({
    width: parseFloat(formData.get("width") as string),
    height: parseFloat(formData.get("height") as string),
    stripType: formData.get("stripType") as string,
    overlap: parseInt(formData.get("overlap") as string),
    addExtraStrip: formData.get("addExtraStrip") === "true",
    corniceType: formData.get("corniceType") as string,
    plankType: formData.get("plankType") as string,
  });
}

export default function Calculator() {
  const result = useActionData<CalculationResult>();

  return (
    <div className="min-h-screen pb-16">
      <Container className="mt-8">
        <h1 className="text-4xl font-bold mb-8">Розрахунок вартості штор</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Параметри розрахунку</CardTitle>
              </CardHeader>
              <CardContent>
                <RegularCalculatorForm />
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
                        <ItemTitle>Реальна ширина штори</ItemTitle>
                      </ItemContent>
                      <ItemContent>
                        <ItemTitle>{result.realCurtainWidth} мм</ItemTitle>
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
