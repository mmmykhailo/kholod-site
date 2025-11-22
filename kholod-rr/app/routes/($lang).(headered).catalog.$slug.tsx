import { useCallback, useMemo } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/($lang).(headered).catalog.$slug";
import { fetchCategoryBySlug } from "~/lib/http";
import Container from "~/components/ui/container";
import { ProductCard } from "~/components/product-card";
import { CategoryCard } from "~/components/category-card";
import { Breadcrumbs, type BreadcrumbItem } from "~/components/breadcrumbs";
import { strapiUrl } from "~/lib/urls";
import { Button } from "~/components/ui/button";
import { ProductFilter } from "~/components/product-filter";
import type { SpecificationFilter } from "~/lib/types/specification";
import type { Product } from "~/lib/types/product";
import { getLanguageFromRequest, buildLocalizedPath } from "~/lib/i18n";
import { useLanguage } from "~/lib/language-context";

type ActiveFilterState = Record<
  string,
  {
    values?: string[];
    min?: string;
    max?: string;
  }
>;

type FilterChip = {
  key: string;
  slug: string;
  label: string;
  value?: string;
  isRange?: boolean;
};

const parseActiveFilters = (
  filters: SpecificationFilter[],
  searchParams: URLSearchParams
): ActiveFilterState => {
  const result: ActiveFilterState = {};

  filters.forEach(({ slug }) => {
    const values = searchParams.getAll(`spec.${slug}`);
    const min = searchParams.get(`spec.${slug}.min`);
    const max = searchParams.get(`spec.${slug}.max`);

    if (values.length || (min && min.length) || (max && max.length)) {
      result[slug] = {};

      if (values.length) {
        result[slug].values = values;
      }

      if (min) {
        result[slug].min = min;
      }

      if (max) {
        result[slug].max = max;
      }
    }
  });

  return result;
};

const extractNumericValue = (raw: string | undefined): number | undefined => {
  if (!raw) return undefined;
  const normalized = raw.replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/);
  if (!normalized) return undefined;
  const parsed = parseFloat(normalized[0]);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const productMatchesFilters = (
  product: Product,
  filters: SpecificationFilter[],
  activeFilters: ActiveFilterState
) => {
  const specifications = product.specifications ?? [];

  return Object.entries(activeFilters).every(([slug, state]) => {
    const filterDefinition = filters.find((filter) => filter.slug === slug);
    if (!filterDefinition) return true;

    const spec = specifications.find((item) => item.slug === slug);
    if (!spec) return false;

    const normalizedSpecValue = spec.value?.toLowerCase?.() ?? "";

    switch (filterDefinition.type) {
      case "select": {
        const selectedValues = state.values ?? [];
        if (!selectedValues.length) return true;
        return selectedValues.some(
          (value) => normalizedSpecValue === value.toLowerCase()
        );
      }
      case "text": {
        const searchValues = state.values ?? [];
        if (!searchValues.length) return true;
        return searchValues.every((value) =>
          normalizedSpecValue.includes(value.toLowerCase())
        );
      }
      case "boolean": {
        const selected = state.values?.[0];
        if (!selected) return true;
        return normalizedSpecValue === selected.toLowerCase();
      }
      case "number": {
        const min = extractNumericValue(state.min);
        const max = extractNumericValue(state.max);
        if (min == null && max == null) return true;

        const specNumber = extractNumericValue(spec.value);
        if (specNumber == null) return false;

        if (min != null && specNumber < min) return false;
        if (max != null && specNumber > max) return false;
        return true;
      }
      default:
        return true;
    }
  });
};

export function meta({ loaderData }: Route.MetaArgs) {
  const { category } = loaderData;
  const title = category.name;
  const description = category.description || `Category ${category.name}`;
  const image = category.image ? `${strapiUrl}${category.image.url}` : null;

  return [
    { title },
    { name: "description", content: description },
    ...(image ? [{ property: "og:image", content: image }] : []),
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const language = getLanguageFromRequest(request);
  const category = await fetchCategoryBySlug(params.slug, language);

  return { category };
}

export default function CategoryPage() {
  const { category } = useLoaderData<typeof loader>();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtersConfig = category.specificationFilters ?? [];
  const products = category.products ?? [];
  const totalProductsCount = products.length;

  console.log({ filtersConfig });

  const activeFilters = useMemo(
    () => parseActiveFilters(filtersConfig, searchParams),
    [filtersConfig, searchParams]
  );

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const filteredProducts = useMemo(() => {
    if (!hasActiveFilters) {
      return products;
    }

    return products.filter((product) =>
      productMatchesFilters(product, filtersConfig, activeFilters)
    );
  }, [products, filtersConfig, activeFilters, hasActiveFilters]);

  const filterChips = useMemo<FilterChip[]>(() => {
    return Object.entries(activeFilters).flatMap(([slug, state]) => {
      const chips: FilterChip[] = [];
      const definition = filtersConfig.find((filter) => filter.slug === slug);
      const label = definition?.label ?? slug;

      state.values?.forEach((value) => {
        chips.push({
          key: `${slug}-${value}`,
          slug,
          label: `${label}: ${value}`,
          value,
        });
      });

      if ((state.min && state.min.length) || (state.max && state.max.length)) {
        const unitSuffix = definition?.unit ? ` ${definition.unit}` : "";
        const rangeLabel = `${label}: ${state.min ?? "…"} – ${state.max ?? "…"}${unitSuffix}`;
        chips.push({
          key: `${slug}-range`,
          slug,
          label: rangeLabel,
          isRange: true,
        });
      }

      return chips;
    });
  }, [activeFilters, filtersConfig]);

  const updateSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutator(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const toggleMultiValue = (slug: string, value: string) => {
    updateSearchParams((params) => {
      const key = `spec.${slug}`;
      const current = new Set(params.getAll(key));
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }

      params.delete(key);
      current.forEach((entry) => params.append(key, entry));
    });
  };

  const setSingleValue = (slug: string, value: string) => {
    updateSearchParams((params) => {
      const key = `spec.${slug}`;
      params.delete(key);
      const trimmed = value.trim();
      if (trimmed) {
        params.append(key, trimmed);
      }
    });
  };

  const setBooleanValue = (slug: string, value: string | null) => {
    updateSearchParams((params) => {
      const key = `spec.${slug}`;
      params.delete(key);
      if (value) {
        params.append(key, value);
      }
    });
  };

  const setNumericValue = (
    slug: string,
    type: "min" | "max",
    value: string
  ) => {
    updateSearchParams((params) => {
      const key = `spec.${slug}.${type}`;
      params.delete(key);
      const trimmed = value.trim();
      if (trimmed) {
        params.set(key, trimmed);
      }
    });
  };

  const removeFilter = (chip: FilterChip) => {
    updateSearchParams((params) => {
      if (chip.isRange) {
        params.delete(`spec.${chip.slug}.min`);
        params.delete(`spec.${chip.slug}.max`);
        return;
      }

      const key = `spec.${chip.slug}`;
      if (!chip.value) {
        params.delete(key);
        return;
      }

      const remaining = params
        .getAll(key)
        .filter((value) => value !== chip.value);
      params.delete(key);
      remaining.forEach((value) => params.append(key, value));
    });
  };

  const resetAllFilters = () => {
    updateSearchParams((params) => {
      [...params.keys()] // spread to avoid mutation issues while iterating
        .filter((key) => key.startsWith("spec."))
        .forEach((key) => params.delete(key));
    });
  };

  // Build category hierarchy from bottom to top, excluding current category
  const buildParentHierarchy = () => {
    const categories = [];
    let currentCategory = category.parentCategory;

    while (currentCategory) {
      categories.unshift({
        label: currentCategory.name,
        href: `/catalog/${currentCategory.slug}`,
      });
      currentCategory = currentCategory.parentCategory;
    }

    return categories;
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...buildParentHierarchy(),
    { label: category.name },
  ];

  const localizedBreadcrumbs: BreadcrumbItem[] = breadcrumbs.map(
    (item: BreadcrumbItem): BreadcrumbItem =>
      item.href
        ? { ...item, href: buildLocalizedPath(language, item.href) }
        : item
  );

  return (
    <Container className="py-12">
      <Breadcrumbs items={localizedBreadcrumbs} className="mb-6" />

      {/* Category Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground text-lg max-w-3xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Filters + Content */}
      <div className="space-y-6">
        {filtersConfig.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {filtersConfig.map((filter) => (
              <ProductFilter
                key={filter.slug}
                filter={filter}
                activeState={activeFilters[filter.slug] || {}}
                onToggleMulti={toggleMultiValue}
                onBooleanChange={setBooleanValue}
                onNumericChange={setNumericValue}
                onTextChange={setSingleValue}
              />
            ))}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetAllFilters}>
                Скинути
              </Button>
            )}
          </div>
        )}

        <div className="space-y-10">
          {/* Subcategories */}
          {category.childrenCategories &&
            category.childrenCategories.length > 0 && (
              <div className="mb-2">
                <h2 className="text-2xl font-bold mb-6">Підкатегорії</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.childrenCategories.map((subCategory) => (
                    <CategoryCard key={subCategory.id} category={subCategory} />
                  ))}
                </div>
              </div>
            )}

          {/* Active filter chips */}
          {filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeFilter(chip)}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {chip.label}
                  <span className="ml-2 text-xs">✕</span>
                </button>
              ))}
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={resetAllFilters}
              >
                Очистити все
              </button>
            </div>
          )}

          {/* Products */}
          {(!category.childrenCategories || products.length > 0) && (
            <div>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold">Товари</h2>
                {hasActiveFilters && filteredProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Немає товарів, що відповідають вибраним фільтрам
                  </p>
                )}
              </div>

              {!filteredProducts.length ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    {hasActiveFilters
                      ? "Змініть значення фільтрів, щоб побачити товари"
                      : "В цій категорії поки немає товарів"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
