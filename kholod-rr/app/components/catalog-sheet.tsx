import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

type CatalogSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerHeight: number;
};

export default function CatalogSheet({
  open,
  onOpenChange,
  headerHeight,
}: CatalogSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        overlayClassName="z-[19]"
        className="z-[19] overflow-y-auto"
        style={{
          paddingTop: `${headerHeight + 24}px`,
          maxHeight: `calc(90vh - ${headerHeight}px)`,
        }}
      >
        <SheetHeader>
          <SheetTitle>Каталог</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          {/* Catalog content will go here */}
          <p className="text-muted-foreground">Каталог товарів</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
