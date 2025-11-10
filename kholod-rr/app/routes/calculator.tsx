import type { LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { useState } from "react";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { fetchNavigation } from "~/lib/http";
import {
  STRIP_WIDTHS,
  STRIP_TYPES,
  OVERLAP_OPTIONS,
  PLANK_TYPES,
  CORNICE_TYPES,
} from "~/lib/constants/calculator";
import type { Route } from "./+types/calculator";
import { Input } from "~/components/ui/input";
import { ceilToFraction } from "~/lib/ceilToFraction";

export function meta() {
  return [
    { title: "Калькулятор" },
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
  numberOfPlanks: number;
  planksPrice: number;
  cornicePrice: number;
  totalPrice: number;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const width = parseFloat(formData.get("width") as string);
  const height = parseFloat(formData.get("height") as string);
  const stripWidth = parseInt(formData.get("stripWidth") as string) as
    | 200
    | 300;
  const stripType = formData.get("stripType") as string;
  const overlap = parseInt(formData.get("overlap") as string);
  const addExtraStrip = formData.get("addExtraStrip") === "true";
  const corniceType = formData.get("corniceType") as string;
  const plankType = formData.get("plankType") as string;

  // Calculate number of strips
  const effectiveStripWidth = stripWidth - overlap;
  let numberOfStrips = Math.ceil(width / effectiveStripWidth);
  if (addExtraStrip) {
    numberOfStrips += 1;
  }

  // Calculate total ribbon length
  const totalRibbonLength = numberOfStrips * height;

  // Get prices from constants
  const stripTypeData = STRIP_TYPES[stripWidth].find(
    (st) => st.value === stripType,
  );
  const ribbonPricePerMeter = stripTypeData?.pricePerMeter || 0;
  const ribbonPrice = (totalRibbonLength / 1000) * ribbonPricePerMeter;

  // Calculate planks price
  const numberOfPlanks = numberOfStrips;
  const plankData = PLANK_TYPES.find((pt) => pt.value === plankType);
  const plankPricePerPiece = plankData?.price || 0;
  const planksPrice = numberOfPlanks * plankPricePerPiece;

  // Calculate cornice price
  const corniceData = CORNICE_TYPES.find((ct) => ct.value === corniceType);
  const cornicePricePerItem = corniceData?.pricePerItem || 0;
  const corniceItemLength = corniceData?.itemLength || 0;
  const cornicePricePerMeter = cornicePricePerItem / corniceItemLength;

  let corniceMeters = width / 1000;
  if (corniceMeters < corniceItemLength) {
    corniceMeters = corniceItemLength;
  }

  corniceMeters = ceilToFraction(corniceMeters, corniceItemLength / 2);

  const cornicePrice = corniceMeters * cornicePricePerMeter;

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
    numberOfPlanks,
    planksPrice,
    cornicePrice,
    totalPrice,
  } as CalculationResult;
}

export default function Calculator() {
  const { nav } = useLoaderData<typeof loader>();
  const result = useActionData<CalculationResult>();
  const [stripWidth, setStripWidth] = useState<200 | 300>(200);

  return (
    <div className="min-h-screen pb-16">
      <Header navigationItems={nav} />
      <Container className="mt-8">
        <h1 className="text-4xl font-bold mb-8">Калькулятор</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Параметри розрахунку</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-y-7 gap-x-4">
                    <Field>
                      <FieldLabel htmlFor="width">Ширина (мм)</FieldLabel>
                      <FieldContent>
                        <Input
                          required
                          id="width"
                          name="width"
                          type="number"
                          step="1"
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="height">Висота (мм)</FieldLabel>
                      <FieldContent>
                        <Input
                          required
                          id="height"
                          name="height"
                          type="number"
                          step="1"
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="stripWidth">Ширина смуги</FieldLabel>
                    <FieldContent>
                      <Select
                        name="stripWidth"
                        value={stripWidth.toString()}
                        onValueChange={(value) =>
                          setStripWidth(parseInt(value) as 200 | 300)
                        }
                      >
                        <SelectTrigger id="stripWidth">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STRIP_WIDTHS.map((width) => (
                            <SelectItem key={width} value={width.toString()}>
                              {width} мм
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="stripType">Тип смуги</FieldLabel>
                    <FieldContent>
                      <Select
                        name="stripType"
                        defaultValue={STRIP_TYPES[stripWidth][0].value}
                        key={stripWidth}
                      >
                        <SelectTrigger id="stripType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STRIP_TYPES[stripWidth].map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <div className="grid grid-cols-2 gap-y-7 gap-x-4">
                    <Field>
                      <FieldLabel htmlFor="overlap">Нахлист (мм)</FieldLabel>
                      <FieldContent>
                        <Select name="overlap" defaultValue="0">
                          <SelectTrigger id="overlap">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OVERLAP_OPTIONS.map((overlap) => (
                              <SelectItem
                                key={overlap}
                                value={overlap.toString()}
                              >
                                {overlap} мм
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="addExtraStrip">
                        Додати додаткову смугу
                      </FieldLabel>
                      <FieldContent>
                        <Select name="addExtraStrip" defaultValue="false">
                          <SelectTrigger id="addExtraStrip" defaultValue="true">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">Ні</SelectItem>
                            <SelectItem value="true">Так</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-y-7 gap-x-4">
                    <Field>
                      <FieldLabel htmlFor="corniceType">Тип карнізу</FieldLabel>
                      <FieldContent>
                        <Select
                          name="corniceType"
                          defaultValue={CORNICE_TYPES[0].value}
                        >
                          <SelectTrigger id="corniceType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CORNICE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="plankType">Тип планки</FieldLabel>
                      <FieldContent>
                        <Select
                          name="plankType"
                          defaultValue={PLANK_TYPES[0].value}
                        >
                          <SelectTrigger id="plankType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLANK_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>

                <Button type="submit" className="mt-6 w-full">
                  Розрахувати
                </Button>
              </Form>
            </CardContent>
          </Card>

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
