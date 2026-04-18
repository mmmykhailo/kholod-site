import { useState } from "react";
import { Form } from "react-router";
import { Field, FieldContent, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import type { MagnetCalculatorSettings } from "~/lib/types/calculator-settings";

interface Props {
  settings: MagnetCalculatorSettings;
}

export default function MagnetCalculatorForm({ settings }: Props) {
  const [selectedStripType, setSelectedStripType] = useState<string>(
    settings.stripTypes[0]?.slug ?? "",
  );

  const selectedStripData = settings.stripTypes.find(
    (st) => st.slug === selectedStripType,
  );
  const selectedStripWidth = selectedStripData?.width ?? 200;

  const availablePlankTypes = settings.plankTypes.filter(
    (pt) => pt.stripWidth === selectedStripWidth,
  );

  return (
    <Form method="post">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-y-7 gap-x-4">
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

          <Field>
            <FieldLabel htmlFor="width">Ширина (мм)</FieldLabel>
            <FieldContent>
              <Input required id="width" name="width" type="number" step="1" />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="stripType">Тип смуги</FieldLabel>
          <FieldContent>
            <Select
              name="stripType"
              value={selectedStripType}
              onValueChange={setSelectedStripType}
            >
              <SelectTrigger id="stripType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settings.stripTypes.map((type) => (
                  <SelectItem key={type.slug} value={type.slug}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </FieldGroup>

      {/* Hidden fields with default values from Strapi */}
      <input type="hidden" name="overlap" value={settings.defaultOverlap} />
      <input
        type="hidden"
        name="addExtraStrip"
        value={settings.addExtraStrip.toString()}
      />
      <input
        type="hidden"
        name="corniceType"
        value={settings.corniceType.slug}
      />
      <input
        type="hidden"
        name="plankType"
        value={availablePlankTypes[0]?.slug ?? ""}
      />

      <Button type="submit" className="mt-6 w-full">
        Розрахувати
      </Button>
    </Form>
  );
}
