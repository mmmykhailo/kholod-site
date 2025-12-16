import Container from "~/components/ui/container";
import RichTextBlock, { type RichTextBlockProps } from "./rich-text-block";
import ThreeImagesBannerBlock, {
  type ThreeImagesBannerBlockProps,
} from "./three-images-banner-block";
import ImageBannerBlock, {
  type ImageBannerBlockProps,
} from "./image-banner-block";
import type { HoverableBannersGridProps } from "./hoverable-banners-grid";
import HoverableBannersGrid from "./hoverable-banners-grid";
import type { HoverableImageBannerBlockProps } from "./hoverable-image-banner-block";
import HoverableImageBannerBlock from "./hoverable-image-banner-block";
import ContactsBlock, { type ContactsBlockProps } from "./contacts-block";

type Component =
  | RichTextBlockProps
  | ImageBannerBlockProps
  | ThreeImagesBannerBlockProps
  | HoverableBannersGridProps
  | HoverableImageBannerBlockProps
  | ContactsBlockProps;

export default function BlockRenderer({ block }: { block: unknown }) {
  if (!block || typeof block !== "object" || !("__component" in block)) {
    return null;
  }

  const typedBlock = block as Component;

  switch (typedBlock.__component) {
    case "shared.rich-text":
      return (
        <Container>
          <RichTextBlock block={typedBlock} />
        </Container>
      );
    case "shared.three-images-banner":
      return (
        <Container>
          <ThreeImagesBannerBlock block={typedBlock} />
        </Container>
      );
    case "shared.image-banner":
      return (
        <Container>
          <ImageBannerBlock block={typedBlock} className="aspect-video" />
        </Container>
      );
    case "shared.hoverable-banners-grid":
      return (
        <Container>
          <HoverableBannersGrid block={typedBlock} />
        </Container>
      );
    case "shared.hoverable-image-banner":
      return (
        <Container>
          <HoverableImageBannerBlock block={typedBlock} />
        </Container>
      );
    case "shared.contacts-block":
      return (
        <Container>
          <ContactsBlock block={typedBlock} />
        </Container>
      );
    default:
      return null;
  }
}
