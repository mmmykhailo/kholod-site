import { data } from "react-router";
import type { Page } from "./types/page";
import type { MainNavigationItems } from "./types/main-navigation";
import { strapiUrl } from "./urls";

const baseURL = `${strapiUrl}/api`;

export async function fetchPage(splat: string | undefined) {
  const pageResponse = await fetch(
    `${baseURL}/pages/${splat || "home"}?populate[blocks][*]=true`,
  );

  console.log(`${baseURL}/pages/${splat || "home"}?populate[blocks][*]=true`);

  if (!pageResponse.ok) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  const page: Page = await pageResponse.json();

  return page;
}

export async function fetchNavigation() {
  const navResponse = await fetch(
    `${baseURL}/navigation/render/agxhqhpkugvgtalcztlckvzm?type=TREE`,
  );

  const nav: MainNavigationItems = await navResponse.json();

  return nav || [];
}
