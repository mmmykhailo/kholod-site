import { strapi } from "@strapi/client";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, data } from "react-router";
import BlockRenderer from "~/lib/BlockRenderer";
import type { Route } from "./+types/_index";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.page) {
    return [{ title: "Page Not Found" }];
  }
  return [
    { title: loaderData.page.Title },
    { name: "description", content: loaderData.page.Title },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const strapiClient = strapi({
    baseURL: "http://localhost:1337/api",
  });

  const response = await strapiClient.collection("pages").find({
    filters: {
      slug: {
        $eq: params.slug || "home",
      },
    },
    populate: {
      blocks: true,
    },
  });

  const page = response.data?.[0] || null;

  console.log(page.blocks);

  if (!page) {
    throw data({ message: "Page not found" }, { status: 404 });
  }

  return { page };
}

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{page.Title}</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          {(page.blocks as Array<unknown>)?.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
