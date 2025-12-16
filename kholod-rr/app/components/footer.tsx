type FooterProps = {
  phoneNumbers?: string[];
};

export default function Footer({ phoneNumbers }: FooterProps) {
  const cleanPhoneNumbers = (phoneNumbers ?? [])
    .map((number) => number.trim())
    .filter((number) => number.length > 0);

  const formatTelHref = (number: string) =>
    "tel:" + number.replace(/[^\d+]/g, "");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Phone numbers - first on mobile, right on desktop */}
          <div className="flex flex-col gap-2 order-first md:order-last">
            {cleanPhoneNumbers.length > 0 &&
              cleanPhoneNumbers.map((number) => (
                <a
                  key={number}
                  href={formatTelHref(number)}
                  className="font-medium text-sm text-center md:text-right hover:text-primary transition-colors"
                >
                  {number}
                </a>
              ))}
          </div>

          {/* Copyright - second on mobile, left on desktop */}
          <div className="text-center md:text-left text-sm text-muted-foreground">
            © {currentYear} Всі права захищені
          </div>
        </div>
      </div>
    </footer>
  );
}
