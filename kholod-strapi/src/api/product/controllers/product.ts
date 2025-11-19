import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;
      if (!slug) return ctx.badRequest("Missing slug parameter");

      const product = await strapi.db.query("api::product.product").findOne({
        where: { slug },
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

      // Navigate through the category hierarchy
      for (const slug of categorySegments) {
        const category = await strapi.db
          .query("api::category.category")
          .findOne({
            where: {
              slug,
              ...(currentParent
                ? { parentCategory: currentParent.id }
                : { parentCategory: null }),
            },
          });

        if (!category)
          return ctx.notFound(`Category not found: ${slug}`);

        targetCategory = category;
        currentParent = category;
      }

      // Find the product by slug and category
      const product = await strapi.db.query("api::product.product").findOne({
        where: {
          slug: productSlug,
          ...(targetCategory ? { category: targetCategory.id } : {}),
        },
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
