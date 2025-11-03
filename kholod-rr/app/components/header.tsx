import clsx from "clsx";
import { Link } from "react-router";
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
  const hasChildren = item.items && item.items.length > 0;

  const className = clsx(
    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
    {
      "text-lg font-medium": level === 0,
      "text-base": level > 0,
    },
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

export default function Header({ navigationItems }: HeaderProps) {
  return (
    <div className="border-b">
      <div className="container mx-auto">
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((item) => {
              const hasChildren = item.items && item.items.length > 0;

              return (
                <NavigationMenuItem key={item.documentId}>
                  {hasChildren ? (
                    <>
                      <Link to={item.path} className="block">
                        <NavigationMenuTrigger className={itemClassName}>
                          {item.title}
                        </NavigationMenuTrigger>
                      </Link>
                      <NavigationMenuContent>
                        <ul className="grid gap-4 p-2 md:w-[400px] lg:w-[500px]">
                          {item.items?.map((subItem) => (
                            <NestedNavigationItem
                              key={subItem.documentId}
                              item={subItem}
                              level={0}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild className={itemClassName}>
                      <Link to={item.path}>{item.title}</Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
