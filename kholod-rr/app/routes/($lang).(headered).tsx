import { Outlet, useLoaderData } from "react-router";
import Header from "~/components/header";
import { fetchNavigation, fetchGeneralSiteInfo } from "~/lib/http";
import { getLanguageFromRequest, type Language } from "~/lib/i18n";
import { LanguageProvider } from "~/lib/language-context";

export async function loader({ request }: { request: Request }) {
  const language: Language = getLanguageFromRequest(request);

  const [nav, generalInfo] = await Promise.all([
    fetchNavigation(language),
    fetchGeneralSiteInfo(language),
  ]);

  const contactPhoneNumbers = generalInfo?.contactPhoneNumbers ?? "";

  const phoneNumbers = contactPhoneNumbers
    .split("\n")
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  return { nav, phoneNumbers, language };
}

export default function HeaderedLayout() {
  const { nav, phoneNumbers, language } = useLoaderData<typeof loader>();

  return (
    <LanguageProvider language={language}>
      <Header navigationItems={nav} phoneNumbers={phoneNumbers} />
      <Outlet />
    </LanguageProvider>
  );
}
