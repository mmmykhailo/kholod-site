import type { HoverableImageBannerBlockProps } from "./hoverable-image-banner-block";
import HoverableImageBannerBlock from "./hoverable-image-banner-block";

export type HoverableBannersGridProps = {
  __component: "shared.hoverable-banners-grid";
  id: number;
  banners: HoverableImageBannerBlockProps[];
};

export default function HoverableBannersGrid({
  block,
}: {
  block: HoverableBannersGridProps;
}) {
  const { banners } = block;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      {banners.map((banner) => (
        <HoverableImageBannerBlock key={banner.id} block={banner} />
      ))}
    </div>
  );
}
