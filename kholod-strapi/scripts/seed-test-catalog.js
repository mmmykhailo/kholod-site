'use strict';

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const os = require('os');
const { rand, randParagraph, randProductName, randNumber, randBoolean } = require('@ngneat/falso');
const { randomUUID } = require('crypto');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const LOCALE = 'en';
const PLACEHOLDER_BASE = 'https://placeholderimage.io/api/640/480/objects';
const PLACEHOLDER_THEME = '333333/4A90E2/FFFFFF/jpg';
const DEFAULT_PRODUCT_IMAGES = 2;

const categoryTemplates = [
  {
    name: 'Refrigerators',
    slug: 'refrigerators',
    productNamePrefix: 'Frost',
    description: () => `Keep it cool with our latest refrigeration tech. ${randParagraph()}`,
    priceRange: { min: 35000, max: 190000 },
    specificationFilters: [
      {
        label: 'Total capacity',
        slug: 'total-capacity',
        type: 'number',
        unit: 'L',
        options: { min: 200, max: 800, step: 10 },
      },
      {
        label: 'Energy rating',
        slug: 'energy-rating',
        type: 'select',
        options: { values: ['A+++', 'A++', 'A+', 'A'] },
      },
      {
        label: 'Has freezer',
        slug: 'has-freezer',
        type: 'boolean',
      },
      {
        label: 'Finish color',
        slug: 'finish-color',
        type: 'select',
        options: { values: ['Stainless steel', 'Black', 'White', 'Graphite'] },
      },
    ],
    productsToCreate: 8,
  },
  {
    name: 'Air Conditioners',
    slug: 'air-conditioners',
    productNamePrefix: 'Breeze',
    description: () => `Precision climate control for modern interiors. ${randParagraph()}`,
    priceRange: { min: 25000, max: 150000 },
    specificationFilters: [
      {
        label: 'Cooling capacity',
        slug: 'cooling-capacity',
        type: 'number',
        unit: 'BTU',
        options: { min: 5000, max: 24000, step: 500 },
      },
      {
        label: 'Inverter motor',
        slug: 'inverter-motor',
        type: 'boolean',
      },
      {
        label: 'Noise level',
        slug: 'noise-level',
        type: 'number',
        unit: 'dB',
        options: { min: 18, max: 60, step: 1 },
      },
      {
        label: 'Wi-Fi connectivity',
        slug: 'wifi-connectivity',
        type: 'boolean',
      },
    ],
    productsToCreate: 6,
  },
  {
    name: 'Washing Machines',
    slug: 'washing-machines',
    productNamePrefix: 'Hydro',
    description: () => `Laundry programs for every fabric on your list. ${randParagraph()}`,
    priceRange: { min: 22000, max: 120000 },
    specificationFilters: [
      {
        label: 'Load capacity',
        slug: 'load-capacity',
        type: 'number',
        unit: 'kg',
        options: { min: 5, max: 15, step: 1 },
      },
      {
        label: 'Spin speed',
        slug: 'spin-speed',
        type: 'number',
        unit: 'RPM',
        options: { min: 800, max: 2000, step: 100 },
      },
      {
        label: 'Steam care',
        slug: 'steam-care',
        type: 'boolean',
      },
      {
        label: 'Control panel',
        slug: 'control-panel',
        type: 'select',
        options: { values: ['Touch', 'Dial', 'Hybrid'] },
      },
    ],
    productsToCreate: 7,
  },
];

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildPlaceholderUrl = (seed) => `${PLACEHOLDER_BASE}/${seed}/${PLACEHOLDER_THEME}`;

const asDecimalString = (value) => (Math.round(value * 100) / 100).toFixed(2);

const pickNumberFromRange = (options = {}) => {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const num = randNumber({ min, max });
  return options.step ? Math.round(num / options.step) * options.step : num;
};

const buildSpecificationFilters = (filters) =>
  filters.map((filter) => ({
    label: filter.label,
    slug: filter.slug,
    type: filter.type,
    unit: filter.unit || null,
    options: filter.options || null,
  }));

const generateSpecValue = (filter) => {
  switch (filter.type) {
    case 'number': {
      const raw = pickNumberFromRange(filter.options);
      return raw.toString();
    }
    case 'select': {
      const values = filter.options?.values || ['Generic'];
      return rand(values);
    }
    case 'boolean':
      return randBoolean() ? 'Yes' : 'No';
    default:
      return randParagraph();
  }
};

const buildProductSpecs = (filters) =>
  filters.map((filter) => ({
    label: filter.label,
    slug: filter.slug,
    unit: filter.unit || null,
    value: generateSpecValue(filter),
  }));

const connectSingleRelation = (entry) => {
  if (!entry) return undefined;
  if (entry.documentId) {
    return {
      connect: [
        {
          documentId: entry.documentId,
          locale: entry.locale || LOCALE,
        },
      ],
    };
  }

  return { connect: [{ id: entry.id }] };
};

const persistTempFile = async (buffer, fileName) => {
  const tempPath = path.join(os.tmpdir(), `${randomUUID()}-${fileName}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
};

async function uploadPlaceholderImage(seed, label) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is required to download placeholder imagery (Node.js 18+).');
  }

  const url = buildPlaceholderUrl(seed);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download placeholder image from ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const fileName = `${slugify(label)}-${seed}.jpg`;
  const uploadService = strapi.plugin('upload').service('upload');
  const tempPath = await persistTempFile(buffer, fileName);

  try {
    const [file] = await uploadService.upload({
      data: {
        fileInfo: {
          alternativeText: label,
          caption: `${label} preview`,
          name: fileName,
        },
      },
      files: {
        path: tempPath,
        filepath: tempPath,
        tmpPath: tempPath,
        tmpFilePath: tempPath,
        name: fileName,
        type: 'image/jpeg',
        size: buffer.byteLength,
        stream: () => fsSync.createReadStream(tempPath),
      },
    });

    return file;
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

async function createProductGallery(baseName, count = DEFAULT_PRODUCT_IMAGES) {
  const uploads = [];
  for (let i = 0; i < count; i += 1) {
    const seed = randNumber({ min: 1, max: 999999 });
    const label = `${baseName} photo ${i + 1}`;
    const file = await uploadPlaceholderImage(seed, label);
    uploads.push(file);
  }

  return uploads;
}

async function clearCatalog() {
  await strapi.db.query('api::product.product').deleteMany({ where: {} });
  await strapi.db.query('api::category.category').deleteMany({ where: {} });
}

async function createCategory(template) {
  const coverSeed = randNumber({ min: 1, max: 999999 });
  const coverImage = await uploadPlaceholderImage(coverSeed, `${template.name} category hero`);

  const payload = {
    name: template.name,
    slug: slugify(template.slug || template.name),
    description: template.description ? template.description() : randParagraph(),
    specificationFilters: buildSpecificationFilters(template.specificationFilters),
    image: coverImage?.id,
    locale: LOCALE,
    publishedAt: new Date(),
  };

  return strapi.entityService.create('api::category.category', {
    data: payload,
  });
}

async function createProductsForCategory(category, template) {
  const products = [];
  const count = template.productsToCreate || 5;
  const minPrice = template.priceRange?.min ?? 25000;
  const maxPrice = template.priceRange?.max ?? 150000;

  for (let index = 0; index < count; index += 1) {
    const baseName = `${template.productNamePrefix} ${randProductName()}`;
    const price = asDecimalString(randNumber({ min: minPrice, max: maxPrice }) / 100);
    const gallery = await createProductGallery(baseName);

    const product = await strapi.entityService.create('api::product.product', {
      data: {
        name: baseName,
        slug: slugify(`${baseName}-${index + 1}`),
        description: randParagraph(),
        price,
        sku: `SKU-${randomUUID().slice(0, 8).toUpperCase()}`,
        featured: randBoolean(),
        inStock: randBoolean(),
        specifications: buildProductSpecs(template.specificationFilters),
        category: connectSingleRelation(category),
        images: gallery.map((file) => file.id),
        locale: LOCALE,
        publishedAt: new Date(),
      },
    });

    products.push(product);
  }

  return products;
}

async function seedTestCatalog() {
  console.log('Clearing previous catalog entries...');
  await clearCatalog();

  const createdCategories = [];
  for (const template of categoryTemplates) {
    const category = await createCategory(template);
    createdCategories.push({ template, category });
  }

  console.log(`Created ${createdCategories.length} categories with specification filters.`);

  let productCount = 0;
  for (const entry of createdCategories) {
    const products = await createProductsForCategory(entry.category, entry.template);
    productCount += products.length;
  }

  console.log(`Generated ${productCount} products with specifications linked to categories.`);
}

(async () => {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    await seedTestCatalog();
    console.log('Test catalog seeding completed.');
  } catch (error) {
    console.error('Failed to seed test catalog:', error);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
