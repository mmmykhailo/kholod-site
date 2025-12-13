import { useState } from "react";
import { Link } from "react-router";
import type { Category } from "~/lib/types/category";
import { CategoryCard } from "./category-card";
import { cn } from "~/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

type CatalogDialogContentProps = {
  categories: Category[];
  onNavigate?: () => void;
};

export function CatalogDialogContent({
  categories,
  onNavigate,
}: CatalogDialogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  // Show category details view
  if (selectedCategory) {
    return (
      <div className="flex flex-col h-full">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 self-start"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {/* Category header */}
        <h3 className="text-lg font-semibold mb-4">{selectedCategory.name}</h3>

        {/* Subcategories or empty state */}
        {selectedCategory.childrenCategories &&
        selectedCategory.childrenCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selectedCategory.childrenCategories.map((subCategory) => (
              <div key={subCategory.id} onClick={onNavigate}>
                <CategoryCard category={subCategory} variant="compact" />
              </div>
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
    );
  }

  // Show categories list view
  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-1 flex-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group",
              "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{category.name}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </nav>
      <Link
        to="/catalog"
        onClick={onNavigate}
        className="mt-12 block px-4 py-3 text-center text-sm font-medium text-primary hover:underline"
      >
        Переглянути весь каталог
      </Link>
    </div>
  );
}
