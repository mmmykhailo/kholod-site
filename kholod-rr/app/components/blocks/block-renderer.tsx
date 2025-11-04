import Container from "~/components/ui/container";
import RichTextBlock, { type RichTextBlockProps } from "./rich-text-block";
import ThreeImagesBannerBlock, {
  type ThreeImagesBannerBlockProps,
} from "./three-images-banner-block";
import ImageBannerBlock, {
  type ImageBannerBlockProps,
} from "./image-banner-block";

type Component =
  | RichTextBlockProps
  | ImageBannerBlockProps
  | ThreeImagesBannerBlockProps;

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
    default:
      return null;
  }
}
