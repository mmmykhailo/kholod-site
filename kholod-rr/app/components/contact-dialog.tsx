import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type ContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ActionData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default function ContactDialog({
  open,
  onOpenChange,
}: ContactDialogProps) {
  const [formKey, setFormKey] = useState(0);
  const fetcher = useFetcher<ActionData>({ key: `contact-${formKey}` });
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = fetcher.state === "submitting";
  const actionData = fetcher.data;

  // Reset form and close dialog on success
  useEffect(() => {
    if (actionData?.success) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [actionData?.success, onOpenChange]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset after dialog animation completes
      const timer = setTimeout(() => {
        formRef.current?.reset();
        setFormKey((prev) => prev + 1); // Force fetcher to reset by changing key
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Замовити дзвінок</DialogTitle>
          <DialogDescription>
            Залиште свої контактні дані, і ми зателефонуємо вам найближчим часом
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form
          key={formKey}
          ref={formRef}
          method="post"
          action="/api/contact"
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              Ім'я <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ваше ім'я"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Телефон <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+380 (XX) XXX-XX-XX"
              pattern="^(\+?38)?0\d{9}$|^(\+?38)?\(0\d{2}\)\s?\d{3}-?\d{2}-?\d{2}$|^(\+?38)?0\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$"
              title="Введіть номер телефону (наприклад: +380XXXXXXXXX або 0XXXXXXXXX)"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Формат: +380XXXXXXXXX або 0XXXXXXXXX
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Повідомлення</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Ваше повідомлення (необов'язково)..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {actionData?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {actionData.error}
            </div>
          )}

          {actionData?.success && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              {actionData.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || actionData?.success}
            >
              {isSubmitting ? "Відправка..." : "Надіслати"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
