import { LayoutGridIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import CatalogDialog from "~/components/catalog-dialog";
import CatalogSheet from "~/components/catalog-sheet";
import { useMediaQuery } from "~/hooks/use-media-query";
import type { MainNavigationItems } from "~/lib/types/main-navigation";
import type { Category } from "~/lib/types/category";
import { cn } from "~/lib/utils";

const itemClassName =
  "group inline-flex h-9 w-max items-center justify-center bg-background py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent group min-h-16 px-8 rounded-none gap-2 cursor-pointer";

type HeaderProps = {
  navigationItems: MainNavigationItems;
  phoneNumbers?: string[];
  categories: Category[];
};

export default function Header({
  navigationItems,
  phoneNumbers,
  categories,
}: HeaderProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const updateHeight = () => {
      setHeaderHeight(headerElement.offsetHeight);
    };

    // Initial measurement
    updateHeight();

    // Observe size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(headerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const cleanPhoneNumbers = (phoneNumbers ?? [])
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  const formatTelHref = (number: string) =>
    "tel:" + number.replace(/[^\d+]/g, "");

  return (
    <div ref={headerRef} className="relative z-20 bg-white">
      <div className="border-b">
        <div className="container mx-auto flex justify-end items-center gap-6 px-4 py-2">
          {cleanPhoneNumbers.length > 0 &&
            cleanPhoneNumbers.map((number) => (
              <a
                key={number}
                href={formatTelHref(number)}
                className="font-medium"
              >
                {number}
              </a>
            ))}
        </div>
      </div>
      <div className="border-b">
        <div className="container mx-auto px-4 flex items-center flex-wrap">
          <button
            onClick={() => setCatalogOpen(true)}
            className={cn(
              itemClassName,
              "border border-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/20 disabled:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg font-semibold mr-2",
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
      {isDesktop ? (
        <CatalogSheet
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          headerHeight={headerHeight}
          categories={categories}
        />
      ) : (
        <CatalogDialog open={catalogOpen} onOpenChange={setCatalogOpen} categories={categories} />
      )}
    </div>
  );
}
