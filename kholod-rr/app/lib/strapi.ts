import { strapi } from "@strapi/client";

const strapiClient = strapi({
  baseURL: "http://localhost:1337/api",
});

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export async function getArticles() {
  const response = await strapiClient.collection("articles").find({
    fields: ["title", "slug", "createdAt", "publishedAt"],
    sort: ["createdAt:desc"],
  });
  return response.data;
}

export async function getArticleBySlug(slug: string) {
  const response = await strapiClient.collection("articles").find({
    filters: {
      slug: {
        $eq: slug,
      },
    },
  });
  return response.data?.[0] || null;
}
