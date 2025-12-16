import { Outlet, useLoaderData } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";
import {
  fetchNavigation,
  fetchGeneralSiteInfo,
  fetchTopLevelCategories,
} from "~/lib/http";

export async function loader() {
  const [nav, generalInfo, categories] = await Promise.all([
    fetchNavigation(),
    fetchGeneralSiteInfo(),
    fetchTopLevelCategories(),
  ]);

  const contactPhoneNumbers = generalInfo?.contactPhoneNumbers ?? "";

  const phoneNumbers = contactPhoneNumbers
    .split("\n")
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  return { nav, phoneNumbers, categories };
}

export default function HeaderedLayout() {
  const { nav, phoneNumbers, categories } = useLoaderData<typeof loader>();

  console.log({ categories });
  return (
    <>
      <Header
        navigationItems={nav}
        phoneNumbers={phoneNumbers}
        categories={categories}
      />
      <div id="main-content relative">
        <Outlet />
      </div>
      <Footer phoneNumbers={phoneNumbers} />
    </>
  );
}
