import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import BlockRenderer from "~/components/blocks/block-renderer";
import type { Route } from "./+types/$";
import type { Page } from "~/lib/types/page";
import { fetchPage } from "~/lib/http";
import Container from "~/components/ui/container";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.page) {
    return [{ title: "Page Not Found" }];
  }
  const page = loaderData.page as unknown as Page;
  return [{ title: page.title }, { name: "description", content: page.title }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const splat = params["*"];

  const page = await fetchPage(splat);

  return { page };
}

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  console.log(page);

  return (
    <div className="min-h-screen pb-16">
      <div className="grid gap-8 mt-8">
        {(page.blocks as Array<unknown>)?.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
