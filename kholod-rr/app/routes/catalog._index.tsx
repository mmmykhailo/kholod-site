import { fetchTopLevelCategories, fetchNavigation } from "~/lib/http";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { CategoryCard } from "~/components/category-card";
import { useLoaderData } from "react-router";

export async function loader() {
  const [categories, nav] = await Promise.all([
    fetchTopLevelCategories(),
    fetchNavigation(),
  ]);

  return { categories, nav };
}

export default function CatalogPage() {
  const { categories, nav } = useLoaderData<typeof loader>();

  // Filter to get only top-level categories (without parent)
  const topLevelCategories = categories.filter((cat) => !cat.parentCategory);

  console.log({ categories });

  return (
    <>
      <Header navigationItems={nav} />
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Каталог</h1>
          <p className="text-muted-foreground text-lg">
            Оберіть категорію для перегляду товарів
          </p>
        </div>

        {topLevelCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              На даний момент категорії відсутні
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topLevelCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
