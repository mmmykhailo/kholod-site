export type ProductSpecification = {
  id?: number;
  label: string;
  slug: string;
  value: string;
  unit?: string;
};

export type SpecificationFilterType = "text" | "number" | "select" | "boolean";

type SelectOptions = {
  values: string[];
};

type NumberOptions = {
  min?: number;
  max?: number;
  step?: number;
};

export type SpecificationFilter = {
  id?: number;
  label: string;
  slug: string;
  type: SpecificationFilterType;
  unit?: string;
  options?: SelectOptions | NumberOptions | null;
};
