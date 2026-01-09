export type Block = {
  __component: string;
  id: number;
  [key: string]: any; // for additional dynamic fields like `body`
};

export type Page = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  showPageTitle: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  blocks: Block[];
};
