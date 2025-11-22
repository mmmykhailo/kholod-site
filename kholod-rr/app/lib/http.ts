import { data } from "react-router";
import type { Page } from "./types/page";
import type { MainNavigationItems } from "./types/main-navigation";
import type { CategoriesResponse, Category } from "./types/category";
import type { ProductsResponse, Product } from "./types/product";
import type { Language } from "./i18n";
import { strapiUrl } from "./urls";

const baseURL = `${strapiUrl}/api`;

type GeneralSiteInfo = {
  id: number;
  documentId: string;
  contactPhoneNumbers: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
};

type GeneralSiteInfoResponse = {
  data: GeneralSiteInfo;
  meta: unknown;
};

export async function fetchPage(splat: string | undefined, language?: Language) {
  const url = new URL(`${baseURL}/pages/${splat || "home"}`);
  url.searchParams.set("populate[blocks][*]", "true");
  if (language) {
    url.searchParams.set("locale", language);
  }

  console.log({language})
  const pageResponse = await fetch(url.toString());

  if (!pageResponse.ok) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  const page: Page = await pageResponse.json();

  return page;
}

export async function fetchNavigation(language?: Language) {
  const url = new URL(
    `${baseURL}/navigation/render/agxhqhpkugvgtalcztlckvzm`,
  );
  url.searchParams.set("type", "TREE");
  if (language) {
    url.searchParams.set("locale", language);
  }

  const navResponse = await fetch(url.toString());

  const nav: MainNavigationItems = await navResponse.json();

  return nav || [];
}

export async function fetchGeneralSiteInfo(language?: Language) {
  const url = new URL(`${baseURL}/general-site-info`);
  if (language) {
    url.searchParams.set("locale", language);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  const json: GeneralSiteInfoResponse = await response.json();

  return json.data;
}

export async function fetchTopLevelCategories(language?: Language) {
  const url = new URL(`${baseURL}/categories`);
  url.searchParams.set("populate[childrenCategories]", "true");
  url.searchParams.set("populate[image]", "true");
  url.searchParams.set("filters[parentCategory][$null]", "true");
  if (language) {
    url.searchParams.set("locale", language);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw data({ message: "Categories not found" }, { status: 404 });
  }

  const categories: CategoriesResponse = await response.json();

  return categories.data;
}

export async function fetchCategoryBySlug(slug: string, language?: Language) {
  const url = new URL(`${baseURL}/categories/slug/${slug}`);
  if (language) {
    url.searchParams.set("locale", language);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw data({ message: "Category not found" }, { status: 404 });
  }

  const category: Category = await response.json();

  return category;
}

export async function fetchProducts(categorySlug?: string, language?: Language) {
  const url = new URL(`${baseURL}/products`);
  url.searchParams.set("populate[category]", "true");
  url.searchParams.set("populate[images]", "true");
  if (language) {
    url.searchParams.set("locale", language);
  } else {
    url.searchParams.set("locale", "all");
  }

  if (categorySlug) {
    url.searchParams.set("filters[category][slug][$eq]", categorySlug);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw data({ message: "Products not found" }, { status: 404 });
  }

  const products: ProductsResponse = await response.json();

  return products.data;
}

export async function fetchProductBySlug(slug: string, language?: Language) {
  const url = new URL(`${baseURL}/products/slug/${slug}`);
  if (language) {
    url.searchParams.set("locale", language);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw data({ message: "Product not found" }, { status: 404 });
  }

  const product: Product = await response.json();

  return product;
}
