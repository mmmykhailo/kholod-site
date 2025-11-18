import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;
      if (!slug) return ctx.badRequest("Missing slug parameter");

      const populate = {
        childrenCategories: true,
        products: {
          populate: {
            images: true,
            category: true,
          },
        },
        image: true,
        seo: true,
      };

      const category = await strapi.db.query("api::category.category").findOne({
        where: { slug },
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

      const populate = {
        childrenCategories: true,
        products: {
          populate: {
            images: true,
            category: false,
          },
        },
        image: true,
        seo: true,
      };

      for (const slug of segments) {
        const category = await strapi.db
          .query("api::category.category")
          .findOne({
            where: {
              slug,
              ...(currentParent
                ? { parentCategory: currentParent.id }
                : { parentCategory: null }),
            },
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
