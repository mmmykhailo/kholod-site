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
import { regularCalculator } from "~/lib/constants/calculator";
import { Button } from "../ui/button";

export default function RegularCalculatorForm() {
  const [selectedStripType, setSelectedStripType] = useState<string>(
    regularCalculator.stripTypes[0].value,
  );

  // Get the strip width for the selected strip type
  const selectedStripData = regularCalculator.stripTypes.find(
    (st) => st.value === selectedStripType,
  );
  const selectedStripWidth = selectedStripData?.width || 200;

  // Filter plank types by strip width
  const availablePlankTypes = regularCalculator.plankTypes.filter(
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
                {regularCalculator.stripTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
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
              <Select name="overlap" defaultValue="0">
                <SelectTrigger id="overlap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regularCalculator.overlapOptions.map((overlap) => (
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
                defaultValue={regularCalculator.corniceTypes[0].value}
              >
                <SelectTrigger id="corniceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regularCalculator.corniceTypes.map((type) => (
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
                defaultValue={availablePlankTypes[0]?.value}
                key={selectedStripType}
              >
                <SelectTrigger id="plankType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlankTypes.map((type) => (
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
  );
}
