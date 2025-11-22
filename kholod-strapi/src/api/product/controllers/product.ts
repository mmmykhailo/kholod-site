import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;
      if (!slug) return ctx.badRequest("Missing slug parameter");

      const locale = ctx.query?.locale as string | undefined;

      const where: any = { slug };

      if (locale) {
        where.locale = locale;
      }

      const product = await strapi.db.query("api::product.product").findOne({
        where,
        populate: {
          images: true,
          category: {
            populate: {
              parentCategory: {
                populate: {
                  parentCategory: {
                    populate: {
                      parentCategory: {
                        populate: {
                          parentCategory: {
                            populate: {
                              parentCategory: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              image: true,
            },
          },
          seo: true,
          specifications: true,
        },
      });

      if (!product) return ctx.notFound(`Product not found: ${slug}`);

      ctx.body = product;
    },

    async findByPath(ctx) {
      const path = ctx.params.path;
      if (!path) return ctx.badRequest("Missing path parameter");

      const segments = path.split("/").filter(Boolean);

      if (segments.length === 0) {
        return ctx.badRequest("Path cannot be empty");
      }

      // Last segment is the product slug
      const productSlug = segments[segments.length - 1];
      // All other segments are category slugs
      const categorySegments = segments.slice(0, -1);

      let currentParent = null;
      let targetCategory = null;

      const locale = ctx.query?.locale as string | undefined;

      // Navigate through the category hierarchy
      for (const slug of categorySegments) {
        const whereCategory: any = {
          slug,
          ...(currentParent
            ? { parentCategory: currentParent.id }
            : { parentCategory: null }),
        };

        if (locale) {
          whereCategory.locale = locale;
        }

        const category = await strapi.db
          .query("api::category.category")
          .findOne({
            where: whereCategory,
          });

        if (!category)
          return ctx.notFound(`Category not found: ${slug}`);

        targetCategory = category;
        currentParent = category;
      }

      // Find the product by slug and category
      const whereProduct: any = {
        slug: productSlug,
        ...(targetCategory ? { category: targetCategory.id } : {}),
      };

      if (locale) {
        whereProduct.locale = locale;
      }

      const product = await strapi.db.query("api::product.product").findOne({
        where: whereProduct,
        populate: {
          images: true,
          category: {
            populate: {
              parentCategory: {
                populate: {
                  parentCategory: true,
                },
              },
              image: true,
            },
          },
          seo: true,
          specifications: true,
        },
      });

      if (!product) {
        return ctx.notFound(`Product not found: ${productSlug}`);
      }

      ctx.body = product;
    },
  }),
);
