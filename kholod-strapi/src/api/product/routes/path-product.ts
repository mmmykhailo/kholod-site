export default {
  routes: [
    {
      method: "GET",
      path: "/products/slug/:slug",
      handler: "product.findBySlug",
      config: {
        policies: [], // no auth
      },
    },
    {
      method: "GET",
      path: "/products/path/:path*",
      handler: "product.findByPath",
      config: {
        policies: [], // no auth
      },
    },
  ],
};
