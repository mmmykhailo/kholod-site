import type { Schema, Struct } from '@strapi/strapi';

export interface SharedHoverableBannersGrid extends Struct.ComponentSchema {
  collectionName: 'components_shared_hoverable_banners_grids';
  info: {
    displayName: 'HoverableBannersGrid';
  };
  attributes: {
    banners: Schema.Attribute.Component<'shared.hoverable-image-banner', true> &
      Schema.Attribute.Required;
  };
}

export interface SharedHoverableImageBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_hoverable_image_banners';
  info: {
    displayName: 'HoverableImageBanner';
  };
  attributes: {
    description: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface SharedImageBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_banners';
  info: {
    displayName: 'ImageBanner';
  };
  attributes: {
    description: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSpecification extends Struct.ComponentSchema {
  collectionName: 'components_shared_specifications';
  info: {
    description: 'Single product specification item';
    displayName: 'Specification';
    icon: 'list';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSpecificationFilter extends Struct.ComponentSchema {
  collectionName: 'components_shared_specification_filters';
  info: {
    description: 'Defines how a specification can be filtered within a category';
    displayName: 'Specification Filter';
    icon: 'filter';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.JSON;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      ['text', 'number', 'select', 'boolean']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'text'>;
    unit: Schema.Attribute.String;
  };
}

export interface SharedThreeImagesBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_three_images_banners';
  info: {
    displayName: 'ThreeImagesBanner';
  };
  attributes: {
    firstBanner: Schema.Attribute.Component<'shared.image-banner', false> &
      Schema.Attribute.Required;
    secondBanner: Schema.Attribute.Component<'shared.image-banner', false> &
      Schema.Attribute.Required;
    thirdBanner: Schema.Attribute.Component<'shared.image-banner', false> &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.hoverable-banners-grid': SharedHoverableBannersGrid;
      'shared.hoverable-image-banner': SharedHoverableImageBanner;
      'shared.image-banner': SharedImageBanner;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.specification': SharedSpecification;
      'shared.specification-filter': SharedSpecificationFilter;
      'shared.three-images-banner': SharedThreeImagesBanner;
    }
  }
}
