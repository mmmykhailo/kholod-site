import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { Category } from "~/lib/types/category";
import { CatalogDialogContent } from "./catalog-dialog-content";

type CatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
};

export default function CatalogDialog({
  open,
  onOpenChange,
  categories,
}: CatalogDialogProps) {
  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen h-screen overflow-y-auto rounded-none sm:rounded-none">
        <div>
          <DialogHeader className="mb-6">
            <DialogTitle>Каталог</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CatalogDialogContent
              categories={categories}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
