import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, data, Link } from "react-router";
import BlockRenderer from "~/lib/block-renderer";
import type { Route } from "./+types/$";
import Header from "~/components/header";
import type { MainNavigationItems } from "~/lib/types/main-navigation";
import type { Page } from "~/lib/types/page";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.page) {
    return [{ title: "Page Not Found" }];
  }
  const page = loaderData.page as unknown as Page;
  return [{ title: page.title }, { name: "description", content: page.title }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const splat = params["*"];

  const baseURL = "http://localhost:1337/api";

  const pageResponse = await fetch(
    `${baseURL}/pages/${splat || "home"}?populate[blocks]=true`,
  );

  if (!pageResponse.ok) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  const page: Page = await pageResponse.json();

  const navResponse = await fetch(
    `${baseURL}/navigation/render/agxhqhpkugvgtalcztlckvzm?type=TREE`,
  );

  const nav: MainNavigationItems = await navResponse.json();

  if (!page) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  console.log(page.blocks);

  return { page, nav };
}

export default function Page() {
  const { page, nav } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      <Header navigationItems={nav} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          {(page.blocks as Array<unknown>)?.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
