import { cn } from "~/lib/utils";

export const negativeContainerMarginClassName = "-mx-4";
export const containerPaddingClassName = "px-4";

export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("container mx-auto", containerPaddingClassName, className)}
    >
      {children}
    </div>
  );
}
