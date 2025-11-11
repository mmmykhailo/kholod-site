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
import { magnetCalculator } from "~/lib/constants/calculator";

export default function MagnetCalculatorForm() {
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
              defaultValue={magnetCalculator.stripTypes[0].value}
            >
              <SelectTrigger id="stripType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {magnetCalculator.stripTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </FieldGroup>

      {/* Hidden fields with default values */}
      <input type="hidden" name="overlap" value={magnetCalculator.overlap} />
      <input
        type="hidden"
        name="addExtraStrip"
        value={magnetCalculator.addExtraStrip.toString()}
      />
      <input
        type="hidden"
        name="corniceType"
        value={magnetCalculator.corniceType.value}
      />
      <input
        type="hidden"
        name="plankType"
        value={magnetCalculator.plankType.value}
      />

      <Button type="submit" className="mt-6 w-full">
        Розрахувати
      </Button>
    </Form>
  );
}
