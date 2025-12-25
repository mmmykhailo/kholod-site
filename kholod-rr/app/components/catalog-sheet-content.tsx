import { useState } from "react";
import { Link } from "react-router";
import type { Category } from "~/lib/types/category";
import { CategoryCard } from "./category-card";
import { cn } from "~/lib/utils";
import { ChevronRight } from "lucide-react";

type CatalogSheetContentProps = {
  categories: Category[];
  onNavigate?: () => void;
};

export function CatalogSheetContent({
  categories,
  onNavigate,
}: CatalogSheetContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories[0] || null,
  );

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left side - Top level categories list */}
      <div className="w-64 flex-shrink-0 flex flex-col">
        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group",
                selectedCategory?.id === category.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{category.name}</span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  selectedCategory?.id === category.id
                    ? "text-primary"
                    : "text-muted-foreground group-hover:translate-x-0.5",
                )}
              />
            </button>
          ))}
        </nav>
        <Link
          to="/catalog"
          onClick={onNavigate}
          className="mt-auto block px-4 py-3 text-center text-sm font-medium text-primary hover:underline"
        >
          Переглянути весь каталог
        </Link>
      </div>

      {/* Right side - Subcategories grid */}
      <div className="flex-1 min-w-0">
        {selectedCategory ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {selectedCategory.name}
            </h3>
            {selectedCategory.childrenCategories &&
            selectedCategory.childrenCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCategory.childrenCategories.map((subCategory) => (
                  <CategoryCard
                    key={subCategory.id}
                    category={subCategory}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  В цій категорії немає підкатегорій
                </p>
                <Link
                  to={`/catalog/${selectedCategory.slug}`}
                  onClick={onNavigate}
                  className="mt-4 inline-block text-primary font-medium hover:underline"
                >
                  Переглянути товари
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Оберіть категорію зі списку</p>
          </div>
        )}
      </div>
    </div>
  );
}
