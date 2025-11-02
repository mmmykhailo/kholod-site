import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { getArticles, type Article } from "~/lib/strapi";

export function meta() {
  return [
    { title: "Articles" },
    { name: "description", content: "Browse our articles" },
  ];
}

export async function loader() {
  const articles = await getArticles();
  return { articles };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Articles</h1>

        {articles.length === 0 ? (
          <p className="text-gray-600">No articles found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.slug}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
