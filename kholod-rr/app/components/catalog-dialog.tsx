import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type CatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CatalogDialog({
  open,
  onOpenChange,
}: CatalogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen h-screen overflow-y-auto rounded-none sm:rounded-none">
        <div>
          <DialogHeader>
            <DialogTitle>Каталог</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Catalog content will go here */}
            <p className="text-muted-foreground">Каталог товарів</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
