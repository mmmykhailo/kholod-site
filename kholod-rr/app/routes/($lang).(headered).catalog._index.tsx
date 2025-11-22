import { fetchTopLevelCategories } from "~/lib/http";
import Container from "~/components/ui/container";
import { CategoryCard } from "~/components/category-card";
import { useLoaderData } from "react-router";
import { getLanguageFromRequest } from "~/lib/i18n";

export function meta() {
  return [
    { title: "Каталог" },
    { name: "description", content: "Каталог товарів" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const language = getLanguageFromRequest(request);

  const categories = await fetchTopLevelCategories(language);

  return { categories };
}

export default function CatalogPage() {
  const { categories } = useLoaderData<typeof loader>();

  // Filter to get only top-level categories (without parent)
  const topLevelCategories = categories.filter((cat) => !cat.parentCategory);

  console.log({ categories });

  return (
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
  );
}
