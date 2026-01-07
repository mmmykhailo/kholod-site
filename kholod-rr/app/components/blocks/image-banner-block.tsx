import clsx from "clsx";
import { Link } from "react-router";
import type { Image } from "~/lib/types/image";
import { url } from "~/lib/urls";

export type ImageBannerBlockProps = {
  __component: "shared.image-banner";
  id: number;
  title: string;
  description: string;
  image?: Image;
  url?: string;
};

export default function ImageBannerBlock({
  block,
  className,
}: {
  block: ImageBannerBlockProps;
  className?: string;
}) {
  const getImageUrl = (image: Image | undefined) => {
    if (!image) return "";
    return url(image.formats?.large?.url || image.url);
  };

  const content = (
    <>
      {block.image && (
        <img
          src={getImageUrl(block.image)}
          alt={block.image.alternativeText}
          className="absolute inset-0 object-cover object-center w-full h-full"
        />
      )}
      <div className="relative min-h-full bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">{block.title}</h2>
        <p className="text-lg">{block.description}</p>
      </div>
    </>
  );

  return block.url ? (
    <Link
      to={block.url}
      className={clsx(
        "relative overflow-hidden rounded-lg min-h-64",
        className,
      )}
    >
      {content}
    </Link>
  ) : (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg min-h-64",
        className,
      )}
    >
      {content}
    </div>
  );
}
