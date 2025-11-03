type RelatedPage = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
  __type: string;
};

export type MainNavigationItem = {
  id: number;
  documentId: string;
  title: string;
  menuAttached: boolean;
  order: number;
  path: string;
  type: "WRAPPER" | "INTERNAL";
  uiRouterKey: string;
  slug: string;
  items: MainNavigationItem[];
  collapsed: boolean;
  additionalFields: Record<string, unknown>;
  related?: RelatedPage;
};

export type MainNavigationItems = Array<MainNavigationItem>;
