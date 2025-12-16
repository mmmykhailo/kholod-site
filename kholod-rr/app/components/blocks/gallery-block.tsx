import { cn } from "~/lib/utils";
import type { Image } from "~/lib/types/image";
import { url } from "~/lib/urls";
import Container from "../ui/container";

export type GalleryBlockProps = {
  __component: "shared.gallery";
  id: number;
  images: Image[];
};

export default function GalleryBlock({ block }: { block: GalleryBlockProps }) {
  const getImageUrl = (image: Image) => {
    return url(image.formats?.large?.url || image.url);
  };

  // Split images into sections for the grid layout
  // Alternating pattern: 1 image, then 4 images in grid, then 1 image, then 4 images, etc.
  const sections: { type?: string; images: Image[] }[] = [];

  let i = 0;
  let isSingle = true; // Start with a single image

  while (i < block.images.length) {
    if (isSingle) {
      // Add single image
      sections.push({ images: [block.images[i]] });
      i += 1;
    } else {
      // Add group of 4 images
      const group = block.images.slice(i, i + 4);
      if (group.length === 4) {
        sections.push({ type: "grid", images: group });
        i += 4;
      } else {
        // If less than 4 images remain, add them as single images
        sections.push({ images: group });
        i += group.length;
      }
    }
    isSingle = !isSingle; // Alternate between single and grid
  }

  return (
    <section className="py-8 sm:py-16 lg:py-24">
      <Container>
        {/* Gallery Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={cn({
                "grid grid-cols-2 gap-6": section.type === "grid",
              })}
            >
              {section.images.map((image, imageIndex) => (
                <img
                  key={imageIndex}
                  src={getImageUrl(image)}
                  alt={
                    image.alternativeText || `Gallery image ${imageIndex + 1}`
                  }
                  className="rounded-lg object-cover w-full h-full"
                />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
