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
import type { RegularCalculatorSettings } from "~/lib/types/calculator-settings";

interface Props {
  settings: RegularCalculatorSettings;
}

export default function RegularCalculatorForm({ settings }: Props) {
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

  const defaultPlankSlug =
    availablePlankTypes.find((pt) => pt.slug === settings.defaultPlankType)?.slug ??
    availablePlankTypes[0]?.slug;

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

        <div className="grid md:grid-cols-2 gap-y-7 gap-x-4">
          <Field>
            <FieldLabel htmlFor="overlap">Нахлист (мм)</FieldLabel>
            <FieldContent>
              <Select name="overlap" defaultValue={settings.defaultOverlap.toString()}>
                <SelectTrigger id="overlap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.overlapOptions.map((overlap) => (
                    <SelectItem key={overlap} value={overlap.toString()}>
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
                defaultValue={settings.defaultCorniceType ?? settings.corniceTypes[0]?.slug}
              >
                <SelectTrigger id="corniceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.corniceTypes.map((type) => (
                    <SelectItem key={type.slug} value={type.slug}>
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
                defaultValue={defaultPlankSlug}
                key={selectedStripType}
              >
                <SelectTrigger id="plankType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlankTypes.map((type) => (
                    <SelectItem key={type.slug} value={type.slug}>
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
  );
}
