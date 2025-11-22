import { Link } from "react-router";
import type { Category } from "~/lib/types/category";
import { strapiUrl } from "~/lib/urls";
import { useLanguage } from "~/lib/language-context";
import { buildLocalizedPath } from "~/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();
  const imageUrl = category.image
    ? `${strapiUrl}${category.image.url}`
    : "/placeholder-category.png";

  const categoryPath = buildLocalizedPath(
    language,
    `/catalog/${category.slug}`
  );

  return (
    <Link to={categoryPath}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={category.image?.alternativeText || category.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{category.name}</CardTitle>
        </CardHeader>
        {category.description && (
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
