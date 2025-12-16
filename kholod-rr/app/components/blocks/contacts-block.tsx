import { MapPin, Phone, Mail } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  containerPaddingClassName,
  negativeContainerMarginClassName,
} from "../ui/container";

export type ContactType = "address" | "phone" | "email";

export type Contact = {
  id: number;
  type: ContactType;
  value: string;
};

export type ContactsBlockProps = {
  __component: "shared.contacts-block";
  id: number;
  heading: string;
  description?: string;
  contacts: Contact[];
};

const getContactIcon = (type: ContactType) => {
  switch (type) {
    case "address":
      return MapPin;
    case "phone":
      return Phone;
    case "email":
      return Mail;
  }
};

const getContactHref = (type: ContactType, value: string) => {
  switch (type) {
    case "phone":
      return `tel:${value.replace(/[^\d+]/g, "")}`;
    case "email":
      return `mailto:${value}`;
    default:
      return undefined;
  }
};

export default function ContactsBlock({
  block,
}: {
  block: ContactsBlockProps;
}) {
  return (
    <div className={cn("relative py-16 md:py-24")}>
      {/* Background grid effect */}
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 opacity-50 border-t border-b border-slate-400",
          "before:bg-slate-100 before:content-[''] before:absolute before:inset-0 before:opacity-30",
        )}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "160px 160px",
          backgroundPosition: "20px 20px",
        }}
      />

      <div className="relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{block.heading}</h2>
        {block.description && (
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            {block.description}
          </p>
        )}
        <div className="space-y-6">
          {block.contacts.map((contact) => {
            const Icon = getContactIcon(contact.type);
            const href = getContactHref(contact.type, contact.value);
            const content = (
              <>
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg">{contact.value}</span>
              </>
            );

            return (
              <div key={contact.id} className="flex items-center gap-4">
                {href ? (
                  <a
                    href={href}
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center gap-4">{content}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
