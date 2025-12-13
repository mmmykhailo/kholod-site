import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { Category } from "~/lib/types/category";
import { CatalogSheetContent } from "./catalog-sheet-content";

type CatalogSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerHeight: number;
  categories: Category[];
};

export default function CatalogSheet({
  open,
  onOpenChange,
  headerHeight,
  categories,
}: CatalogSheetProps) {
  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        overlayClassName="z-[19]"
        className="z-[19] overflow-y-auto"
        style={{
          maxHeight: `calc(90vh - ${headerHeight}px)`,
          paddingTop: `${headerHeight}px`,
        }}
      >
        <CatalogSheetContent
          categories={categories}
          onNavigate={handleNavigate}
        />
      </SheetContent>
    </Sheet>
  );
}
