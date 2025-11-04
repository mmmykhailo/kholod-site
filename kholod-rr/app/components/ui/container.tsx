export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`container mx-auto px-4 ${className ?? ""}`}>
      {children}
    </div>
  );
}
