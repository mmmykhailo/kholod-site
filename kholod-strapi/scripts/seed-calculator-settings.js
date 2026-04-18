"use strict";

const { createStrapi, compileStrapi } = require("@strapi/strapi");

const UID = "api::calculator-settings.calculator-settings";

const STRIP_TYPES = [
  { slug: "200x1-7", label: "200×1.7", width: 200, pricePerMeter: 77 },
  { slug: "300x2", label: "300×2", width: 300, pricePerMeter: 140 },
];

const DATA = {
  regularCalculator: {
    stripTypes: STRIP_TYPES,
    overlapOptions: [0, 25, 50, 75, 100, 125, 150],
    plankTypes: [
      { slug: "200-stainless", label: "Нержавійка", stripWidth: 200, price: 27 },
      { slug: "200-galvanized", label: "Оцинковка",  stripWidth: 200, price: 20 },
      { slug: "300-stainless", label: "Нержавійка", stripWidth: 300, price: 35 },
      { slug: "300-galvanized", label: "Оцинковка",  stripWidth: 300, price: 28 },
    ],
    corniceTypes: [
      {
        slug: "cornice-stainless",
        label: "Нержавійка",
        pricePerItem: 240,
        itemLength: 1.25,
        itemFractionToCeil: 0.5,
      },
      {
        slug: "cornice-galvanized",
        label: "Оцинковка",
        pricePerItem: 156,
        itemLength: 1.25,
        itemFractionToCeil: 0.5,
      },
    ],
  },
  magnetCalculator: {
    stripTypes: STRIP_TYPES,
    plankTypes: [
      { slug: "200-aluminum", label: "Алюміній", stripWidth: 200, price: 0 },
      { slug: "300-aluminum", label: "Алюміній", stripWidth: 300, price: 0 },
    ],
    corniceType: {
      slug: "cornice-aluminum",
      label: "Алюміній",
      pricePerItem: 0,
      itemLength: 1.25,
      itemFractionToCeil: 0.5,
    },
    defaultOverlap: 0,
    addExtraStrip: false,
  },
};

async function seedCalculatorSettings() {
  // Single types always have at most one entry.
  // findOne with null id returns the existing record, or null if not yet saved.
  const existing = await strapi.entityService.findOne(UID, null, {
    populate: {
      regularCalculator: {
        populate: { stripTypes: true },
      },
    },
  });

  if (existing?.regularCalculator?.stripTypes?.length > 0) {
    console.log("Calculator settings already populated — skipping migration.");
    return;
  }

  if (existing) {
    await strapi.entityService.update(UID, existing.id, { data: DATA });
    console.log("✅ Calculator settings updated with initial data.");
  } else {
    await strapi.entityService.create(UID, { data: DATA });
    console.log("✅ Calculator settings created with initial data.");
  }
}

(async () => {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    await seedCalculatorSettings();
  } catch (error) {
    console.error("Failed to seed calculator settings:", error);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
