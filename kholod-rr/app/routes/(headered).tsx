import { Outlet, useLoaderData } from "react-router";
import Header from "~/components/header";
import { fetchNavigation, fetchGeneralSiteInfo } from "~/lib/http";

export async function loader() {
  const [nav, generalInfo] = await Promise.all([
    fetchNavigation(),
    fetchGeneralSiteInfo(),
  ]);

  const contactPhoneNumbers = generalInfo?.contactPhoneNumbers ?? "";

  const phoneNumbers = contactPhoneNumbers
    .split("\n")
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  return { nav, phoneNumbers };
}

export default function HeaderedLayout() {
  const { nav, phoneNumbers } = useLoaderData<typeof loader>();

  return (
    <>
      <Header navigationItems={nav} phoneNumbers={phoneNumbers} />
      <div id="main-content relative">
        <Outlet />
      </div>
    </>
  );
}
