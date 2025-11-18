import type { Route } from "./+types/catalog.$slug";
import { fetchCategoryBySlug, fetchNavigation } from "~/lib/http";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { ProductCard } from "~/components/product-card";
import { CategoryCard } from "~/components/category-card";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { strapiUrl } from "~/lib/urls";
import { useLoaderData } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const [category, navigation] = await Promise.all([
    fetchCategoryBySlug(params.slug),
    fetchNavigation(),
  ]);

  return { category, navigation };
}

export default function CategoryPage() {
  const { category, navigation } = useLoaderData<typeof loader>();

  console.log({ category });

  const imageUrl = category.image ? `${strapiUrl}${category.image.url}` : null;
  const products = category.products;

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

  const breadcrumbs = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...buildParentHierarchy(),
    { label: category.name },
  ];

  return (
    <>
      <Header navigationItems={navigation} />
      <Container className="py-12">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Category Header */}
        <div className="mb-12">
          {imageUrl && (
            <div className="relative mb-6 aspect-21/9 overflow-hidden rounded-xl bg-muted">
              <img
                src={imageUrl}
                alt={category.image?.alternativeText || category.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategories */}
        {category.childrenCategories &&
          category.childrenCategories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Підкатегорії</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.childrenCategories.map((subCategory) => (
                  <CategoryCard key={subCategory.id} category={subCategory} />
                ))}
              </div>
            </div>
          )}

        {/* Products */}
        {(!category.childrenCategories || !!products?.length) && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Товари {!!products?.length && `(${products.length})`}
            </h2>

            {!products?.length ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  В цій категорії поки немає товарів
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
