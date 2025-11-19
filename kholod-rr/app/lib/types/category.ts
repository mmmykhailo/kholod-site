import type { Image } from "./image";
import type { Product } from "./product";
import type { SpecificationFilter } from "./specification";

export type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: Category;
  childrenCategories?: Category[];
  products?: Product[];
  image?: Image;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  specificationFilters?: SpecificationFilter[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
};

export type CategoriesResponse = {
  data: Category[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type CategoryResponse = {
  data: Category;
};
