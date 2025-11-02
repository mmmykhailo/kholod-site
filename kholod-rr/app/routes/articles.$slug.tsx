import { Link, useLoaderData, data } from "react-router";
import type { Route } from "./+types/articles.$slug";
import { getArticleBySlug } from "~/lib/strapi";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.article) {
    return [{ title: "Article Not Found" }];
  }
  return [
    { title: data.article.title },
    { name: "description", content: data.article.title },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    throw data({ message: "Article not found" }, { status: 404 });
  }

  return { article };
}

export default function Article({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-block mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back to Articles
        </Link>

        <article className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {article.title}
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Published on {new Date(article.publishedAt).toLocaleDateString()}
          </p>

          {/*<div className="prose prose-lg max-w-none">
            {article.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>*/}
        </article>
      </div>
    </div>
  );
}
