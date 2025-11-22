import clsx from "clsx";
import { Link, useLocation, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import type {
  MainNavigationItem,
  MainNavigationItems,
} from "~/lib/types/main-navigation";
import { useLanguage } from "~/lib/language-context";
import {
  switchLanguageInPath,
  buildLocalizedPath,
  type Language,
} from "~/lib/i18n";

const itemClassName =
  "group inline-flex h-9 w-max items-center justify-center bg-background py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent group min-h-16 px-8 rounded-none gap-2 cursor-pointer";

// Recursive component for nested navigation items within dropdowns
function NestedNavigationItem({
  item,
  level,
}: {
  item: MainNavigationItem;
  level: number;
}) {
  const { language } = useLanguage();
  const hasChildren = item.items && item.items.length > 0;

  const targetPath = buildLocalizedPath(language, item.path);

  const className = clsx(
    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
    {
      "text-lg font-medium": level === 0,
      "text-base": level > 0,
    }
  );

  if (hasChildren) {
    return (
      <li key={item.documentId}>
        <div className="space-y-1">
          <Link to={targetPath} className={className}>
            {item.title}
          </Link>
          <ul className="space-y-1 pl-3">
            {item.items?.map((subItem) => (
              <NestedNavigationItem
                key={subItem.documentId}
                item={subItem}
                level={level + 1}
              />
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li key={item.documentId}>
      <NavigationMenuLink asChild>
        <Link to={targetPath} className={className}>
          {item.title}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

type HeaderProps = {
  navigationItems: MainNavigationItems;
};

export default function Header({
  navigationItems,
  phoneNumbers,
}: HeaderProps & { phoneNumbers?: string[] }) {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const cleanPhoneNumbers = (phoneNumbers ?? [])
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  const formatTelHref = (number: string) =>
    "tel:" + number.replace(/[^\d+]/g, "");

  const handleLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage === language) return;

    const fullPath = `${location.pathname}${location.search}`;
    const target = switchLanguageInPath(fullPath || "/", nextLanguage);
    navigate(target);
  };

  return (
    <div>
      <div className="border-b">
        <div className="container mx-auto flex justify-between items-center gap-6 px-4 py-2">
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide">
            <button
              type="button"
              onClick={() => handleLanguageChange("uk")}
              className={clsx(
                "transition-colors",
                language === "uk"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              UA
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={clsx(
                "transition-colors",
                language === "en"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
          </div>
          <div className="flex items-center gap-6">
            {cleanPhoneNumbers.length > 0 ? (
              cleanPhoneNumbers.map((number) => (
                <a
                  key={number}
                  href={formatTelHref(number)}
                  className="font-medium"
                >
                  {number}
                </a>
              ))
            ) : (
              <>
                <a href="tel:+380504000817" className="font-medium">
                  +38(050)400-08-17
                </a>
                <a href="tel:+380673889948" className="font-medium">
                  +38(067)388-99-48
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="container mx-auto">
          {navigationItems.map((item) => {
            const targetPath = buildLocalizedPath(language, item.path);
            return (
              <Link
                key={item.documentId}
                to={targetPath}
                className={itemClassName}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
