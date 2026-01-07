import type { ImageBannerBlockProps } from "./image-banner-block";
import ImageBannerBlock from "./image-banner-block";

export type ThreeImagesBannerBlockProps = {
  __component: "shared.three-images-banner";
  id: number;
  firstBanner: ImageBannerBlockProps;
  secondBanner: ImageBannerBlockProps;
  thirdBanner: ImageBannerBlockProps;
};

export default function ThreeImagesBannerBlock({
  block,
}: {
  block: ThreeImagesBannerBlockProps;
}) {
  const { firstBanner, secondBanner, thirdBanner } = block;

  return (
    <div className="grid grid-cols-3 gap-4 w-full md:aspect-video">
      {/* Left side - 2/3 width */}
      <ImageBannerBlock block={firstBanner} className="col-span-2" />

      {/* Right side - 1/3 width */}
      <div className="col-span-1 grid gap-4">
        {/* Second banner - top half */}
        <ImageBannerBlock block={secondBanner} />

        {/* Third banner - bottom half */}
        <ImageBannerBlock block={thirdBanner} />
      </div>
    </div>
  );
}
