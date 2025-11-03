export default {
  routes: [
    {
      method: "GET",
      path: "/pages/:path*", // catch all nested path
      handler: "page.findByPath",
      config: { auth: false },
    },
  ],
};
