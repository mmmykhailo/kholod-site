import { useActionData, useLoaderData } from "react-router";
import Container from "~/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import type { Route } from "./+types/(headered).calculator";
import RegularCalculatorForm from "~/components/calculator/RegularCalculatorForm";
import MagnetCalculatorForm from "~/components/calculator/MagnetCalculatorForm";
import {
  calculateCurtainPrice,
  type CalculationResult,
} from "~/lib/calculateCurtainPrice";
import { fetchCalculatorSettings } from "~/lib/http";

export function meta() {
  return [
    { title: "Розрахунок вартості штор" },
    { name: "description", content: "Калькулятор розрахунку штор" },
  ];
}

export async function clientLoader() {
  const settings = await fetchCalculatorSettings();
  if (!settings) {
    throw new Error("Calculator settings unavailable");
  }
  return { settings };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const [formData, settings] = await Promise.all([
    request.formData(),
    fetchCalculatorSettings(),
  ]);

  if (!settings) {
    throw new Error("Calculator settings unavailable");
  }

  return calculateCurtainPrice(
    {
      width: parseFloat(formData.get("width") as string),
      height: parseFloat(formData.get("height") as string),
      stripType: formData.get("stripType") as string,
      overlap: parseInt(formData.get("overlap") as string),
      addExtraStrip: formData.get("addExtraStrip") === "true",
      corniceType: formData.get("corniceType") as string,
      plankType: formData.get("plankType") as string,
    },
    settings,
  );
}

export default function Calculator() {
  const { settings } = useLoaderData<typeof clientLoader>();
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
                <Tabs defaultValue="regular">
                  <TabsList className="grid w-full grid-cols-2 mb-5">
                    <TabsTrigger value="regular">Звичайні штори</TabsTrigger>
                    <TabsTrigger value="magnet">Магнітні штори</TabsTrigger>
                  </TabsList>
                  <TabsContent value="regular">
                    <RegularCalculatorForm settings={settings.regularCalculator} />
                  </TabsContent>
                  <TabsContent value="magnet">
                    <MagnetCalculatorForm settings={settings.magnetCalculator} />
                  </TabsContent>
                </Tabs>
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
