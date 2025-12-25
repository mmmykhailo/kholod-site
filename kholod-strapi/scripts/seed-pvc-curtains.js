"use strict";

const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const os = require("os");
const { randNumber } = require("@ngneat/falso");
const { randomUUID } = require("crypto");
const { createStrapi, compileStrapi } = require("@strapi/strapi");

const LOCALE = "en"; // Using 'en' locale with Ukrainian content (uk locale may not be enabled)
const PLACEHOLDER_BASE = "https://placeholderimage.io/api/640/480/objects";
const PLACEHOLDER_THEME = "333333/4A90E2/FFFFFF/jpg";

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    // Cyrillic to Latin transliteration
    .replace(/і/g, "i")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "h")
    .replace(/ґ/g, "g")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/є/g, "ie")
    .replace(/ж/g, "zh")
    .replace(/з/g, "z")
    .replace(/и/g, "y")
    .replace(/ї/g, "yi")
    .replace(/й/g, "y")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "kh")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "shch")
    .replace(/ь/g, "")
    .replace(/ю/g, "iu")
    .replace(/я/g, "ia")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildPlaceholderUrl = (seed) =>
  `${PLACEHOLDER_BASE}/${seed}/${PLACEHOLDER_THEME}`;

const persistTempFile = async (buffer, fileName) => {
  const tempPath = path.join(os.tmpdir(), `${randomUUID()}-${fileName}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
};

async function uploadPlaceholderImage(seed, label) {
  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch is required to download placeholder imagery (Node.js 18+).",
    );
  }

  const url = buildPlaceholderUrl(seed);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download placeholder image from ${url}: ${response.status}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const fileName = `${slugify(label)}-${seed}.jpg`;
  const uploadService = strapi.plugin("upload").service("upload");
  const tempPath = await persistTempFile(buffer, fileName);

  try {
    const [file] = await uploadService.upload({
      data: {
        fileInfo: {
          alternativeText: label,
          caption: `${label} зображення`,
          name: fileName,
        },
      },
      files: {
        path: tempPath,
        filepath: tempPath,
        tmpPath: tempPath,
        tmpFilePath: tempPath,
        name: fileName,
        type: "image/jpeg",
        size: buffer.byteLength,
        stream: () => fsSync.createReadStream(tempPath),
      },
    });

    return file;
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

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

// Category structure
const categoryStructure = [
  {
    name: "Стрічкові готові завіси",
    description: "Готові стрічкові ПВХ завіси для різних потреб",
    children: [
      {
        name: "Магнітні",
        description: "Магнітні стрічкові завіси для легкого доступу",
      },
      { name: "Стандартні", description: "Стандартні стрічкові завіси" },
    ],
  },
  {
    name: "Матеріал",
    description: "Різні типи матеріалів для ПВХ завіс",
    children: [
      { name: "Стандартна", description: "Стандартний ПВХ матеріал" },
      {
        name: "Морозостійка",
        description: "Морозостійкий ПВХ матеріал для холодних умов",
      },
      {
        name: "Ребриста стандартна",
        description: "Ребриста стандартна ПВХ стрічка",
      },
      {
        name: "Ребриста морозостійка",
        description: "Ребриста морозостійка ПВХ стрічка",
      },
      {
        name: "Кольорова",
        description: "Кольорові ПВХ завіси різних відтінків",
      },
      {
        name: "Магнітна",
        description: "ПВХ матеріал з магнітними властивостями",
      },
    ],
  },
  {
    name: "Кріплення",
    description: "Різні типи кріплень для ПВХ завіс",
    children: [
      { name: "Оцинковані", description: "Оцинковані металеві кріплення" },
      { name: "Нержавіючі", description: "Кріплення з нержавіючої сталі" },
      {
        name: "Алюмінієві для магнітних",
        description: "Алюмінієві кріплення для магнітних завіс",
      },
      {
        name: "Розсувна система для магнітних",
        description: "Розсувна система кріплення для магнітних завіс",
      },
      { name: "Пластикові", description: "Пластикові кріплення" },
    ],
  },
];

async function createCategory(name, description, parentCategory = null) {
  const coverSeed = randNumber({ min: 1, max: 999999 });
  const coverImage = await uploadPlaceholderImage(
    coverSeed,
    `${name} категорія`,
  );

  // Make slug unique by adding a random suffix
  const uniqueSlug = `${slugify(name)}-${randomUUID().slice(0, 6)}`;

  const payload = {
    name,
    slug: uniqueSlug,
    description,
    image: coverImage?.id,
    locale: LOCALE,
    publishedAt: new Date(),
  };

  if (parentCategory) {
    payload.parentCategory = connectSingleRelation(parentCategory);
  }

  return strapi.entityService.create("api::category.category", {
    data: payload,
  });
}

async function createProduct(name, description, category, price = "1500.00") {
  const gallerySeed = randNumber({ min: 1, max: 999999 });
  const image1 = await uploadPlaceholderImage(gallerySeed, `${name} фото 1`);
  const image2 = await uploadPlaceholderImage(
    gallerySeed + 1,
    `${name} фото 2`,
  );

  // Make slug unique by adding timestamp
  const uniqueSlug = `${slugify(name)}-${Date.now()}`;

  const payload = {
    name,
    slug: uniqueSlug,
    description,
    price,
    sku: `SKU-${randomUUID().slice(0, 8).toUpperCase()}`,
    featured: false,
    inStock: true,
    category: connectSingleRelation(category),
    images: [image1?.id, image2?.id].filter(Boolean),
    specifications: [
      { label: "Ширина", slug: "width", unit: "мм", value: "200" },
      { label: "Товщина", slug: "thickness", unit: "мм", value: "2" },
      { label: "Довжина рулону", slug: "roll-length", unit: "м", value: "50" },
    ],
    locale: LOCALE,
    publishedAt: new Date(),
  };

  return strapi.entityService.create("api::product.product", {
    data: payload,
  });
}

async function createPage(title, blocks) {
  const payload = {
    title,
    slug: slugify(title),
    blocks,
    locale: LOCALE,
    publishedAt: new Date(),
  };

  return strapi.entityService.create("api::page.page", {
    data: payload,
  });
}

async function clearPVCCatalog() {
  console.log("Clearing PVC curtains catalog...");

  // Get all PVC-related category slugs to delete (regardless of locale)
  const pvcCategorySlugs = [
    "strichkovi-hotovi-zavisy",
    "mahnitni",
    "standartni",
    "material",
    "standartna",
    "morozostiyka",
    "rebrista-standartna",
    "rebrista-morozostiyka",
    "kolyorova",
    "mahnitna",
    "kriplennya",
    "otsynkovani",
    "nerzhaviyuchi",
    "alyuminievi-dlya-mahnitnykh",
    "rozsuvna-systema-dlya-mahnitnykh",
    "plastykovi",
  ];

  // Delete all products in PVC categories
  for (const slug of pvcCategorySlugs) {
    const category = await strapi.db.query("api::category.category").findOne({
      where: { slug },
    });

    if (category) {
      // Delete products in this category
      await strapi.db.query("api::product.product").deleteMany({
        where: { category: category.documentId },
      });

      // Delete the category
      await strapi.db.query("api::category.category").deleteMany({
        where: { slug },
      });
    }
  }

  // Delete Ukrainian pages
  await strapi.db.query("api::page.page").deleteMany({
    where: {
      slug: { $in: ["holovna", "halereya", "vidhuk y", "kontakty"] },
    },
  });

  console.log("Previous PVC content cleared.");
}

async function seedPVCCurtains() {
  await clearPVCCatalog();

  console.log("Creating parent categories...");
  const createdCategories = [];

  for (const parentTemplate of categoryStructure) {
    console.log(
      `Creating parent category: ${parentTemplate.name} with slug: ${slugify(parentTemplate.name)}`,
    );
    const parent = await createCategory(
      parentTemplate.name,
      parentTemplate.description,
    );
    console.log(`Created parent category: ${parent.name}`);

    const childCategories = [];
    for (const childTemplate of parentTemplate.children) {
      console.log(
        `  Creating child category: ${childTemplate.name} with slug: ${slugify(childTemplate.name)}`,
      );
      const child = await createCategory(
        childTemplate.name,
        childTemplate.description,
        parent,
      );
      console.log(`  ✓ Created child category: ${child.name}`);
      childCategories.push(child);

      // Create a test product for each child category
      const productName = `Тестовий продукт ${child.name}`;
      const productDescription = `Це тестовий продукт для категорії "${child.name}". ${childTemplate.description}`;
      console.log(`    Creating product: ${productName}`);
      const product = await createProduct(
        productName,
        productDescription,
        child,
      );
      console.log(`    ✓ Created product: ${product.name}`);
    }

    createdCategories.push({ parent, children: childCategories });
  }

  console.log("\nCreating pages...");

  // Create Головна page with HoverableBannersGrid
  const banner1Seed = randNumber({ min: 1, max: 999999 });
  const banner2Seed = randNumber({ min: 1, max: 999999 });
  const banner3Seed = randNumber({ min: 1, max: 999999 });

  const banner1Image = await uploadPlaceholderImage(
    banner1Seed,
    "Стрічкові готові завіси банер",
  );
  const banner2Image = await uploadPlaceholderImage(
    banner2Seed,
    "Матеріал банер",
  );
  const banner3Image = await uploadPlaceholderImage(
    banner3Seed,
    "Кріплення банер",
  );

  await createPage("Головна", [
    {
      __component: "shared.image-banner",
      title: "Стрічкові ПВХ завіси",
      description: "Якісні рішення для вашого бізнесу",
      image: banner1Image?.id,
    },
    {
      __component: "shared.rich-text",
      body: "## Про стрічкові ПВХ завіси\n\nМи пропонуємо широкий вибір стрічкових ПВХ завіс для різних потреб. Наші завіси забезпечують:\n\n- Теплоізоляцію\n- Захист від пилу та комах\n- Зручний прохід\n- Довговічність\n\nОберіть варіант, який підходить саме вам:",
    },
    {
      __component: "shared.hoverable-banners-grid",
      banners: [
        {
          title: "Стрічкові готові завіси",
          description: "Готові рішення для швидкого монтажу",
          image: banner1Image?.id,
          url: `/catalog/${slugify("Стрічкові готові завіси")}`,
        },
        {
          title: "Матеріал",
          description: "Різні типи матеріалів для будь-яких умов",
          image: banner2Image?.id,
          url: `/catalog/${slugify("Матеріал")}`,
        },
        {
          title: "Кріплення",
          description: "Надійні кріплення для будь-яких завіс",
          image: banner3Image?.id,
          url: `/catalog/${slugify("Кріплення")}`,
        },
      ],
    },
  ]);
  console.log("Created page: Головна");

  // Create Галерея page
  const gallery1 = await uploadPlaceholderImage(
    randNumber({ min: 1, max: 999999 }),
    "Галерея 1",
  );
  const gallery2 = await uploadPlaceholderImage(
    randNumber({ min: 1, max: 999999 }),
    "Галерея 2",
  );
  const gallery3 = await uploadPlaceholderImage(
    randNumber({ min: 1, max: 999999 }),
    "Галерея 3",
  );

  await createPage("Галерея", [
    {
      __component: "shared.rich-text",
      body: "# Галерея наших робіт\n\nПодивіться на наші реалізовані проекти",
    },
    {
      __component: "shared.gallery",
      images: [gallery1?.id, gallery2?.id, gallery3?.id].filter(Boolean),
    },
  ]);
  console.log("Created page: Галерея");

  // Create Відгуки page
  await createPage("Відгуки", [
    {
      __component: "shared.rich-text",
      body: '# Відгуки клієнтів\n\n## Іван Петренко\n⭐⭐⭐⭐⭐\n\n"Відмінна якість завіс! Встановили на склад, дуже задоволені результатом. Тепер значно менше пилу та краща теплоізоляція."\n\n## Олена Коваленко\n⭐⭐⭐⭐⭐\n\n"Швидка доставка, професійний монтаж. Магнітні завіси працюють чудово, дуже зручно проходити з вантажем."\n\n## Микола Сидоренко\n⭐⭐⭐⭐⭐\n\n"Морозостійкі завіси справляються на відмінно навіть у холодну зиму. Рекомендую!"',
    },
  ]);
  console.log("Created page: Відгуки");

  // Create Контакти page
  await createPage("Контакти", [
    {
      __component: "shared.rich-text",
      body: "# Контакти\n\nЗв'яжіться з нами для замовлення або консультації",
    },
    {
      __component: "shared.contacts-block",
      heading: "Наші контакти",
      description: "Ми завжди раді відповісти на ваші запитання",
      contacts: [
        {
          type: "phone",
          value: "+380 (67) 123-45-67",
        },
        {
          type: "email",
          value: "info@pvc-zavisy.ua",
        },
        {
          type: "address",
          value: "м. Київ, вул. Промислова, 15",
        },
      ],
    },
  ]);
  console.log("Created page: Контакти");

  console.log("\n✅ PVC curtains catalog seeding completed!");
  console.log(`Created ${createdCategories.length} parent categories`);
  console.log(
    `Created ${createdCategories.reduce((sum, cat) => sum + cat.children.length, 0)} child categories`,
  );
  console.log("Created 13 test products");
  console.log("Created 4 pages");
}

(async () => {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    await seedPVCCurtains();
  } catch (error) {
    console.error("Failed to seed PVC curtains catalog:", error);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
