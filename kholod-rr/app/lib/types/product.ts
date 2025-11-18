import type { Image } from "./image";
import type { Category } from "./category";

export type Product = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: Category;
  images?: Image[];
  featured: boolean;
  inStock: boolean;
  sku?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type ProductResponse = {
  data: Product;
};
