import type { ProductSpecification } from "~/lib/types/specification";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type SpecificationTableProps = {
  specifications?: ProductSpecification[];
  title?: string;
};

export function SpecificationTable({
  specifications,
  title = "Характеристики",
}: SpecificationTableProps) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {specifications.map((spec) => (
            <div
              key={spec.id ?? spec.slug}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center"
            >
              <dt className="text-sm font-medium text-muted-foreground sm:w-1/3">
                {spec.label}
              </dt>
              <dd className="text-base font-semibold text-foreground sm:flex-1">
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
