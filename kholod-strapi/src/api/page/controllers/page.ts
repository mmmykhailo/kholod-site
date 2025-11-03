import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    async findByPath(ctx) {
      const path = ctx.params.path;

      if (!path) return ctx.badRequest("Missing path parameter");

      const segments = path.split("/").filter(Boolean);

      let currentParent = null;
      let currentPage = null;

      // Use populate from query if provided, otherwise empty object
      const populate = ctx.query.populate || {};
      console.log(populate);

      for (const slug of segments) {
        const page = await strapi.db.query("api::page.page").findOne({
          where: {
            slug,
            ...(currentParent
              ? { parentPage: currentParent.id }
              : { parentPage: null }), // use correct relation attribute
          },
          populate, // forward populate instructions from query
        });

        if (!page) {
          return ctx.notFound(`Page not found: ${slug}`);
        }

        currentPage = page;
        currentParent = page;
      }

      ctx.body = currentPage;
    },
  }),
);
