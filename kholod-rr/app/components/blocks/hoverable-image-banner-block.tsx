import clsx from "clsx";
import { Link } from "react-router";
import type { Image } from "~/lib/types/image";
import { url } from "~/lib/urls";

export type HoverableImageBannerBlockProps = {
  __component: "shared.hoverable-image-banner";
  id: number;
  title: string;
  description: string;
  image?: Image;
  url?: string;
};

export default function HoverableImageBannerBlock({
  block,
  className,
}: {
  block: HoverableImageBannerBlockProps;
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
      <div className="relative min-h-full bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white transition-all duration-300">
        <h2 className="text-3xl font-bold transition-all duration-300 group-hover:mb-2 group-focus:mb-2">
          {block.title}
        </h2>
        <p className="text-lg transition-all duration-300 ease-in-out max-h-0 opacity-0 overflow-hidden group-hover:max-h-96 group-hover:opacity-100 group-focus:max-h-96 group-focus:opacity-100">
          {block.description}
        </p>
      </div>
    </>
  );

  return block.url ? (
    <Link
      to={block.url}
      className={clsx(
        "relative overflow-hidden rounded-lg group min-h-[320px]",
        className,
      )}
    >
      {content}
    </Link>
  ) : (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg group min-h-[320px]",
        className,
      )}
    >
      {content}
    </div>
  );
}
