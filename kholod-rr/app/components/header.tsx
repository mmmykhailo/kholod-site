import { LayoutGridIcon, MenuIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import CatalogDialog from "~/components/catalog-dialog";
import CatalogSheet from "~/components/catalog-sheet";
import ContactDialog from "~/components/contact-dialog";
import MobileMenuSheet from "~/components/mobile-menu-sheet";
import { useMediaQuery } from "~/hooks/use-media-query";
import type { MainNavigationItems } from "~/lib/types/main-navigation";
import type { Category } from "~/lib/types/category";
import { cn } from "~/lib/utils";

const itemClassName =
  "group inline-flex w-max items-center justify-center bg-background py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent group min-h-10 md:min-h-16 px-4 md:px-8 rounded-none gap-2 cursor-pointer";

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
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div ref={headerRef} className="relative z-20 bg-white pointer-events-auto">
      <div className="border-b hidden md:block">
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
        <div className="container mx-auto px-4 flex items-center flex-wrap py-3 md:py-0">
          <button
            onClick={() => setCatalogOpen(true)}
            className={cn(
              itemClassName,
              "border border-primary bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/20 disabled:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg font-semibold mr-2",
              {
                "pointer-events-none": catalogOpen,
              },
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
                className={cn(itemClassName, "hidden md:inline-flex")}
              >
                {item.title}
              </Link>
            );
          })}
          <button
            onClick={() => setContactOpen(true)}
            className={cn(
              itemClassName,
              "ml-auto border border-primary rounded-full text-base my-1 py-3 px-5 h-auto md:min-h-0 hidden md:inline-flex",
            )}
          >
            Замовити дзвінок
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(itemClassName, "ml-auto relative md:hidden", {
              "pointer-events-none": mobileMenuOpen,
            })}
          >
            <MenuIcon
              className={cn(
                "w-6 h-6 absolute transition-opacity duration-300",
                mobileMenuOpen ? "opacity-0" : "opacity-100",
              )}
            />
            <XIcon
              className={cn(
                "w-6 h-6 absolute transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="opacity-0 w-6 h-6">Menu</span>
          </button>
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
        <CatalogDialog
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          categories={categories}
        />
      )}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      {!isDesktop && (
        <MobileMenuSheet
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          headerHeight={headerHeight}
          navigationItems={navigationItems}
          phoneNumbers={phoneNumbers}
          onContactClick={() => setContactOpen(true)}
        />
      )}
    </div>
  );
}
