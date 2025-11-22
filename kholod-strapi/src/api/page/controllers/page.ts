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
      const locale = ctx.query?.locale as string | undefined;

      const getFullPopulate = async (
        uid: string,
        visited = new Set<string>(),
        depth = 0,
        maxDepth = 3,
      ): Promise<any> => {
        if (depth > maxDepth) return {};
        visited.add(uid);

        const model = strapi.getModel(uid as any);
        if (!model || !model.attributes) return {};

        const populate: Record<string, any> = {};

        for (const [fieldName, attrRaw] of Object.entries(model.attributes)) {
          const attr = attrRaw as any;
          switch (attr.type) {
            case "component": {
              populate[fieldName] = {
                populate: await getFullPopulate(
                  attr.component,
                  visited,
                  depth + 1,
                  maxDepth,
                ),
              };
              break;
            }
            case "dynamiczone": {
              // attr.components is an array of component UIDs (e.g. "sections.hero", "sections.features")
              const onObj: Record<string, any> = {};
              for (const comp of attr.components) {
                onObj[comp] = {
                  populate: await getFullPopulate(
                    comp,
                    visited,
                    depth + 1,
                    maxDepth,
                  ),
                };
              }
              populate[fieldName] = { on: onObj };
              break;
            }
            case "media": {
              populate[fieldName] = true;
              break;
            }
            // handle other types if needed
          }
        }

        return populate;
      };

      const populate = await getFullPopulate("api::page.page");

      // const populate = ctx.query.populate || {};
      console.log(JSON.stringify(populate));

      for (const slug of segments) {
        const where: any = {
          slug,
          ...(currentParent
            ? { parentPage: currentParent.id }
            : { parentPage: null }),
        };

        if (locale) {
          where.locale = locale;
        }

        const page = await strapi.db.query("api::page.page").findOne({
          where,
          populate,
        });

        if (!page) return ctx.notFound(`Page not found: ${slug}`);

        currentPage = page;
        currentParent = page;
      }

      ctx.body = currentPage;
    },
  }),
);
