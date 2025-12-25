export const strapiUrl =
  import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export function url(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }
  return `${strapiUrl}${path}`;
}
