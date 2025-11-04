import type { Schema, Struct } from '@strapi/strapi';

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
    body: Schema.Attribute.RichText;
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

export interface SharedThreeImagesBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_three_images_banners';
  info: {
    displayName: 'ThreeImagesBanner';
  };
  attributes: {
    firstBanner: Schema.Attribute.Component<'shared.image-banner', false>;
    secondBanner: Schema.Attribute.Component<'shared.image-banner', false>;
    thirdBanner: Schema.Attribute.Component<'shared.image-banner', false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.image-banner': SharedImageBanner;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.three-images-banner': SharedThreeImagesBanner;
    }
  }
}
