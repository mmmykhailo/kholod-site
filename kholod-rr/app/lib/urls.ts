export const strapiUrl = "http://localhost:1337";

export function url(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }
  return `${strapiUrl}${path}`;
}
