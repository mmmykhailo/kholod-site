/**
 * category router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/categories/slug/:slug",
      handler: "category.findBySlug",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/categories/path/:path*",
      handler: "category.findByPath",
      config: {
        auth: false,
      },
    },
  ],
};
