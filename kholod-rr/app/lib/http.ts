import { data } from "react-router";
import type { Page } from "./types/page";
import type { MainNavigationItems } from "./types/main-navigation";
import type { CategoriesResponse, Category } from "./types/category";
import type { ProductsResponse, Product } from "./types/product";
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

export async function fetchPage(splat: string | undefined) {
  const pageResponse = await fetch(
    `${baseURL}/pages/${splat || "home"}?populate[blocks][*]=true`,
  );

  console.log(`${baseURL}/pages/${splat || "home"}?populate[blocks][*]=true`);

  if (!pageResponse.ok) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  const page: Page = await pageResponse.json();

  return page;
}

export async function fetchNavigation() {
  const response = await fetch(
    `${baseURL}/navigation/render/vh4jom50euiqflxbs6a5mvdn?type=TREE`,
  );

  if (!response.ok) {
    return [];
  }

  const nav: MainNavigationItems = await response.json();

  return nav || [];
}

export async function fetchGeneralSiteInfo() {
  const response = await fetch(`${baseURL}/general-site-info`);

  if (!response.ok) {
    return null;
  }

  const json: GeneralSiteInfoResponse = await response.json();

  return json.data;
}

export async function fetchTopLevelCategories() {
  const response = await fetch(
    `${baseURL}/categories?populate[childrenCategories][populate][image]=true&populate[image]=true&filters[parentCategory][$null]=true`,
  );

  if (!response.ok) {
    throw data({ message: "Categories not found" }, { status: 404 });
  }

  const categories: CategoriesResponse = await response.json();

  return categories.data;
}

export async function fetchCategoryBySlug(slug: string) {
  const response = await fetch(`${baseURL}/categories/slug/${slug}`);

  if (!response.ok) {
    throw data({ message: "Category not found" }, { status: 404 });
  }

  const category: Category = await response.json();

  return category;
}

export async function fetchProducts(categorySlug?: string) {
  let url = `${baseURL}/products?populate[category]=true&populate[images]=true&locale=all`;

  if (categorySlug) {
    url += `&filters[category][slug][$eq]=${categorySlug}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw data({ message: "Products not found" }, { status: 404 });
  }

  const products: ProductsResponse = await response.json();

  return products.data;
}

export async function fetchProductBySlug(slug: string) {
  const response = await fetch(`${baseURL}/products/slug/${slug}`);

  if (!response.ok) {
    throw data({ message: "Product not found" }, { status: 404 });
  }

  const product: Product = await response.json();

  return product;
}
