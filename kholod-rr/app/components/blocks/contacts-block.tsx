import { MapPin, Phone, Mail } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  containerPaddingClassName,
  negativeContainerMarginClassName,
} from "../ui/container";
import GridBackground from "../ui/grid-background";

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
      <GridBackground />

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
