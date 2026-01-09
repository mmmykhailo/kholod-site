import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import BlockRenderer from "~/components/blocks/block-renderer";
import type { Route } from "./+types/$";
import type { Page } from "~/lib/types/page";
import { fetchPage } from "~/lib/http";
import Container from "~/components/ui/container";
import clsx from "clsx";

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

  return (
    <div
      className={clsx("min-h-screen pb-16", {
        "pt-8": !page.showPageTitle,
      })}
    >
      {page.showPageTitle && (
        <Container className="mt-8">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
        </Container>
      )}
      <div className="grid gap-8">
        {(page.blocks as Array<unknown>)?.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
