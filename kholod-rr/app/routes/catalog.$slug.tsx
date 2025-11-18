import type { Route } from "./+types/catalog.$slug";
import { fetchCategoryBySlug, fetchNavigation } from "~/lib/http";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { ProductCard } from "~/components/product-card";
import { CategoryCard } from "~/components/category-card";
import { strapiUrl } from "~/lib/urls";
import { Link, useLoaderData } from "react-router";

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

  return (
    <>
      <Header navigationItems={navigation} />
      <Container className="py-12">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Головна
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to="/catalog"
                className="hover:text-foreground transition-colors"
              >
                Каталог
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{category.name}</li>
          </ol>
        </nav>

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
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Товари {products.length > 0 && `(${products.length})`}
          </h2>

          {products.length === 0 ? (
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
      </Container>
    </>
  );
}
