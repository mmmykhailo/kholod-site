import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Link } from "react-router";
import type { MainNavigationItems } from "~/lib/types/main-navigation";
import { cn } from "~/lib/utils";

type MobileMenuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerHeight: number;
  navigationItems: MainNavigationItems;
  phoneNumbers?: string[];
  onContactClick: () => void;
};

export default function MobileMenuSheet({
  open,
  onOpenChange,
  headerHeight,
  navigationItems,
  phoneNumbers,
  onContactClick,
}: MobileMenuSheetProps) {
  const handleNavigate = () => {
    onOpenChange(false);
  };

  const handleContactClick = () => {
    onOpenChange(false);
    onContactClick();
  };

  const cleanPhoneNumbers = (phoneNumbers ?? [])
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  const formatTelHref = (number: string) =>
    "tel:" + number.replace(/[^\d+]/g, "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        overlayClassName="z-[19]"
        className="z-[19] overflow-y-auto"
        style={{
          maxHeight: `calc(90vh - ${headerHeight}px)`,
          paddingTop: `${headerHeight - 1}px`,
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Меню</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.documentId}
                to={item.path}
                onClick={handleNavigate}
                className="py-4 px-4 text-lg font-medium hover:bg-accent rounded-lg transition-colors"
              >
                {item.title}
              </Link>
            ))}

            <button
              onClick={handleContactClick}
              className="mt-4 w-max max-w-full border border-primary rounded-full text-base py-3 px-5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Замовити дзвінок
            </button>
          </nav>

          {cleanPhoneNumbers.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Зв'язатися з нами:
              </p>
              <div className="flex flex-col gap-2">
                {cleanPhoneNumbers.map((number) => (
                  <a
                    key={number}
                    href={formatTelHref(number)}
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    {number}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
