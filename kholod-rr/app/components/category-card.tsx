import { Link } from "react-router";
import type { Category } from "~/lib/types/category";
import { strapiUrl } from "~/lib/urls";
import { cn } from "~/lib/utils";
import { Card, CardHeader, CardTitle } from "./ui/card";

type CategoryCardProps = {
  category: Category;
  variant?: "default" | "compact";
  onClick?: () => void;
};

export function CategoryCard({
  category,
  variant = "default",
  onClick,
}: CategoryCardProps) {
  const imageUrl = category.image
    ? `${strapiUrl}${category.image.url}`
    : "/placeholder-category.png";

  return (
    <Link className="flex" to={`/catalog/${category.slug}`} onClick={onClick}>
      <Card
        className={cn("overflow-hidden shadow-none w-full", {
          "transition-shadow shadow hover:shadow-lg": variant === "default",
        })}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={category.image?.alternativeText || category.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2 pb-px">{category.name}</CardTitle>
          {variant !== "compact" && category.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
