import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;
      if (!slug) return ctx.badRequest("Missing slug parameter");

      const locale = ctx.query?.locale as string | undefined;

      const populate = {
        childrenCategories: {
          populate: {
            image: true,
          },
        },
        products: {
          populate: {
            images: true,
            category: true,
            specifications: true,
          },
        },
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
        seo: true,
        specificationFilters: true,
      };

      const where: any = { slug };

      if (locale) {
        where.locale = locale;
      }

      const category = await strapi.db
        .query("api::category.category")
        .findOne({
          where,
          populate,
        });

      if (!category) return ctx.notFound(`Category not found: ${slug}`);

      ctx.body = category;
    },

    async findByPath(ctx) {
      const path = ctx.params.path;
      if (!path) return ctx.badRequest("Missing path parameter");

      const segments = path.split("/").filter(Boolean);
      let currentParent = null;
      let currentCategory = null;

      const locale = ctx.query?.locale as string | undefined;

      const populate = {
        childrenCategories: {
          populate: {
            image: true,
          },
        },
        products: {
          populate: {
            images: true,
            category: false,
            specifications: true,
          },
        },
        image: true,
        seo: true,
        specificationFilters: true,
      };

      for (const slug of segments) {
        const where: any = {
          slug,
          ...(currentParent
            ? { parentCategory: currentParent.id }
            : { parentCategory: null }),
        };

        if (locale) {
          where.locale = locale;
        }

        const category = await strapi.db
          .query("api::category.category")
          .findOne({
            where,
            populate,
          });

        if (!category) return ctx.notFound(`Category not found: ${slug}`);

        currentCategory = category;
        currentParent = category;
      }

      ctx.body = currentCategory;
    },
  }),
);
