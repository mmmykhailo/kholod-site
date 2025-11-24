import clsx from "clsx";
import { LayoutGridIcon } from "lucide-react";
import { Link } from "react-router";
import { NavigationMenuLink } from "~/components/ui/navigation-menu";
import type {
  MainNavigationItem,
  MainNavigationItems,
} from "~/lib/types/main-navigation";
import { cn } from "~/lib/utils";

const itemClassName =
  "group inline-flex h-9 w-max items-center justify-center bg-background py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent group min-h-16 px-8 rounded-none gap-2 cursor-pointer";

// Recursive component for nested navigation items within dropdowns
function NestedNavigationItem({
  item,
  level,
}: {
  item: MainNavigationItem;
  level: number;
}) {
  const hasChildren = item.items && item.items.length > 0;

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
          <Link to={item.path} className={className}>
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
        <Link to={item.path} className={className}>
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
  const cleanPhoneNumbers = (phoneNumbers ?? [])
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  const formatTelHref = (number: string) =>
    "tel:" + number.replace(/[^\d+]/g, "");

  return (
    <div>
      <div className="border-b">
        <div className="container mx-auto flex justify-end items-center gap-6 px-4 py-2">
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
      <div className="border-b">
        <div className="container mx-auto flex items-center flex-wrap">
          <button
            className={cn(
              itemClassName,
              "border border-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/20 disabled:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg font-semibold mr-2"
            )}
          >
            <LayoutGridIcon className="w-6 h-6" />
            Каталог
          </button>
          {navigationItems.map((item) => {
            return (
              <Link
                key={item.documentId}
                to={item.path}
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
