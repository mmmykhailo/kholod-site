export type Language = "uk" | "en";

export const defaultLanguage: Language = "uk";
export const supportedLanguages: Language[] = ["uk", "en"];

/**
 * Derive language from the current pathname.
 *
 * - Paths starting with `/en` are treated as English.
 * - Everything else is treated as Ukrainian.
 */
export function getLanguageFromPath(pathname: string): Language {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "en") {
    return "en";
  }
  return "uk";
}

/**
 * Convenience helper to derive language from a Request object.
 */
export function getLanguageFromRequest(request: Request): Language {
  const url = new URL(request.url);
  return getLanguageFromPath(url.pathname);
}

/**
 * Remove a leading `/en` language segment from the pathname, if present.
 */
export function stripLanguagePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "en") {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname || "/";
}

/**
 * Build a localized pathname for the given language, based on a base (language-agnostic) path.
 *
 * Examples:
 * - basePath `/product/foo`, lang `uk` -> `/product/foo`
 * - basePath `/product/foo`, lang `en` -> `/en/product/foo`
 * - basePath `/`, lang `en` -> `/en`
 */
export function buildLocalizedPath(
  language: Language,
  basePathname: string,
): string {
  const normalizedBase = stripLanguagePrefix(basePathname);

  if (language === "uk") {
    return normalizedBase || "/";
  }

  if (normalizedBase === "/") {
    return "/en";
  }

  if (normalizedBase.startsWith("/")) {
    return `/en${normalizedBase}`;
  }

  return `/en/${normalizedBase}`;
}

/**
 * Switch language for a full path (pathname + optional search).
 */
export function switchLanguageInPath(
  fullPath: string,
  targetLanguage: Language,
): string {
  const [pathname, search = ""] = fullPath.split("?");
  const localizedPath = buildLocalizedPath(targetLanguage, pathname || "/");
  return search ? `${localizedPath}?${search}` : localizedPath;
}
