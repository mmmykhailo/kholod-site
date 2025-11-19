import type { Route } from "./+types/product.$slug";
import { useState } from "react";
import { fetchProductBySlug, fetchNavigation } from "~/lib/http";
import Header from "~/components/header";
import Container from "~/components/ui/container";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { strapiUrl } from "~/lib/urls";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { marked } from "marked";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SpecificationTable } from "~/components/specification-table";

export function meta({ loaderData }: Route.MetaArgs) {
  const { product } = loaderData;
  const title = product.seo?.metaTitle || product.name;
  const description =
    product.seo?.metaDescription || product.description || product.name;
  const image = product.images?.[0]?.url
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : `${strapiUrl}${product.images[0].url}`
    : null;

  return [
    { title },
    { name: "description", content: description },
    ...(image ? [{ property: "og:image", content: image }] : []),
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const [product, navigation] = await Promise.all([
    fetchProductBySlug(params.slug),
    fetchNavigation(),
  ]);

  return { product, navigation };
}

export default function ProductPage({ loaderData }: Route.ComponentProps) {
  const { product, navigation } = loaderData;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log({product})

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: "/placeholder-product.png", alternativeText: product.name }];

  const selectedImage = images[selectedImageIndex];
  const imageUrl = selectedImage.url.startsWith("http")
    ? selectedImage.url
    : `${strapiUrl}${selectedImage.url}`;

  const price = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
  }).format(product.price);

  const descriptionHtml = product.description
    ? marked.parse(product.description)
    : "";

  // Build category hierarchy from bottom to top
  const buildCategoryHierarchy = () => {
    const categories = [];
    let currentCategory: typeof product.category | null | undefined =
      product.category;

    while (currentCategory) {
      categories.unshift({
        label: currentCategory.name,
        href: `/catalog/${currentCategory.slug}`,
      });
      currentCategory = currentCategory.parentCategory;
    }

    return categories;
  };

  const breadcrumbs = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...buildCategoryHierarchy(),
    { label: product.name },
  ];

  return (
    <>
      <Header navigationItems={navigation} />
      <Container className="py-12">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <img
                src={imageUrl}
                alt={selectedImage.alternativeText || product.name}
                className="h-full w-full object-cover"
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-lg bg-white px-4 py-2 text-lg font-semibold">
                    Немає в наявності
                  </span>
                </div>
              )}
              {product.featured && (
                <div className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                  Популярне
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => {
                  const thumbUrl = image.url.startsWith("http")
                    ? image.url
                    : `${strapiUrl}${image.url}`;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                        }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={
                          image.alternativeText ||
                          `${product.name} ${index + 1}`
                        }
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  Артикул: {product.sku}
                </p>
              )}
            </div>

            <div>
              <p className="text-4xl font-bold">{price}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.inStock ? (
                  <span className="text-green-600 font-medium">
                    В наявності
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Немає в наявності
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full" disabled={!product.inStock}>
                {product.inStock ? "Замовити" : "Немає в наявності"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Зв'яжіться з нами для оформлення замовлення
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Категорія</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/catalog/${product.category.slug}`}
                  className="text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              </CardContent>
            </Card>

            {product.seo?.keywords && (
              <Card>
                <CardHeader>
                  <CardTitle>Ключові слова</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {product.seo.keywords}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Опис товару</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-neutral max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {product.specifications?.length ? (
          <div className="mt-12">
            <SpecificationTable specifications={product.specifications} />
          </div>
        ) : null}
      </Container>
    </>
  );
}
