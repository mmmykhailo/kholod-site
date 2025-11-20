import { Link } from "react-router";
import type { Product } from "~/lib/types/product";
import { strapiUrl } from "~/lib/urls";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]
    ? `${strapiUrl}${product.images[0].url}`
    : "/placeholder-product.png";

  const price = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
  }).format(product.price);

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alternativeText || product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg bg-white px-3 py-1 text-sm font-semibold">
                Немає в наявності
              </span>
            </div>
          )}
          {product.featured && (
            <div className="absolute left-2 top-2 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              Популярне
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link
            to={`/product/${product.slug}`}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-2xl font-bold">{price}</p>
        {product.sku && (
          <p className="mt-2 text-xs text-muted-foreground">
            Артикул: {product.sku}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          asChild
          size="lg"
          className="w-full"
          disabled={!product.inStock}
        >
          <Link to={`/product/${product.slug}`}>
            {product.inStock ? "Детальніше" : "Немає в наявності"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
