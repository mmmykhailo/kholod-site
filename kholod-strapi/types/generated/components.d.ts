import type { Schema, Struct } from '@strapi/strapi';

export interface CalculatorCorniceType extends Struct.ComponentSchema {
  collectionName: 'components_calculator_cornice_types';
  info: {
    description: 'A cornice (curtain rod) option with pricing';
    displayName: 'Cornice Type';
  };
  attributes: {
    hasPlank: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    itemFractionToCeil: Schema.Attribute.Decimal & Schema.Attribute.Required;
    itemLength: Schema.Attribute.Decimal & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    pricePerItem: Schema.Attribute.Decimal & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CalculatorMagnetCalculatorSettings
  extends Struct.ComponentSchema {
  collectionName: 'components_calculator_magnet_settings';
  info: {
    description: 'All options for the magnetic curtain calculator';
    displayName: 'Magnet Calculator Settings';
  };
  attributes: {
    addExtraStrip: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    corniceType: Schema.Attribute.Component<'calculator.cornice-type', false> &
      Schema.Attribute.Required;
    defaultOverlap: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    plankTypes: Schema.Attribute.Component<'calculator.plank-type', true> &
      Schema.Attribute.Required;
    stripTypes: Schema.Attribute.Component<'calculator.strip-type', true> &
      Schema.Attribute.Required;
  };
}

export interface CalculatorPlankType extends Struct.ComponentSchema {
  collectionName: 'components_calculator_plank_types';
  info: {
    description: 'A mounting plank with material, compatible strip width, and price per piece';
    displayName: 'Plank Type';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    stripWidth: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface CalculatorRegularCalculatorSettings
  extends Struct.ComponentSchema {
  collectionName: 'components_calculator_regular_settings';
  info: {
    description: 'All options for the standard curtain calculator';
    displayName: 'Regular Calculator Settings';
  };
  attributes: {
    corniceTypes: Schema.Attribute.Component<'calculator.cornice-type', true> &
      Schema.Attribute.Required;
    defaultCorniceType: Schema.Attribute.String;
    defaultOverlap: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    defaultPlankType: Schema.Attribute.String;
    overlapOptions: Schema.Attribute.JSON & Schema.Attribute.Required;
    plankTypes: Schema.Attribute.Component<'calculator.plank-type', true> &
      Schema.Attribute.Required;
    stripTypes: Schema.Attribute.Component<'calculator.strip-type', true> &
      Schema.Attribute.Required;
  };
}

export interface CalculatorStripType extends Struct.ComponentSchema {
  collectionName: 'components_calculator_strip_types';
  info: {
    description: 'A PVC strip with width and price per meter';
    displayName: 'Strip Type';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    pricePerMeter: Schema.Attribute.Decimal & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface SharedContact extends Struct.ComponentSchema {
  collectionName: 'components_shared_contacts';
  info: {
    description: 'Contact information with type (address, phone, email)';
    displayName: 'Contact';
    icon: 'phone';
  };
  attributes: {
    type: Schema.Attribute.Enumeration<['address', 'phone', 'email']> &
      Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedContactsBlock extends Struct.ComponentSchema {
  collectionName: 'components_shared_contacts_blocks';
  info: {
    description: 'Block with heading, description and contact information';
    displayName: 'Contacts Block';
    icon: 'phone';
  };
  attributes: {
    contacts: Schema.Attribute.Component<'shared.contact', true> &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedGallery extends Struct.ComponentSchema {
  collectionName: 'components_shared_galleries';
  info: {
    description: 'A gallery of images displayed in a grid layout';
    displayName: 'Gallery';
  };
  attributes: {
    images: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
  };
}

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
      'calculator.cornice-type': CalculatorCorniceType;
      'calculator.magnet-calculator-settings': CalculatorMagnetCalculatorSettings;
      'calculator.plank-type': CalculatorPlankType;
      'calculator.regular-calculator-settings': CalculatorRegularCalculatorSettings;
      'calculator.strip-type': CalculatorStripType;
      'shared.contact': SharedContact;
      'shared.contacts-block': SharedContactsBlock;
      'shared.gallery': SharedGallery;
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
