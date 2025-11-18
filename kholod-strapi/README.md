# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## 📡 API Endpoints

### Categories

**Standard REST API:**
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories` - Create category

**Custom Endpoints:**
- `GET /api/categories/slug/:slug` - Find category by slug (bypasses locale requirement)
- `GET /api/categories/path/:path*` - Find category by hierarchical path (e.g., `/api/categories/path/parent/child`)

**Query Parameters:**
- `populate=*` - Populate all relations
- `populate[childrenCategories]=true` - Populate child categories
- `populate[products][populate][images]=true` - Populate products with images
- `locale=en` - Filter by locale (required for localized content)

### Products

**Standard REST API:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products` - Create product

**Custom Endpoints:**
- `GET /api/products/slug/:slug` - Find product by slug (bypasses locale requirement)
- `GET /api/products/path/:path*` - Find product by category path and slug (e.g., `/api/products/path/category/subcategory/product-slug`)

**Query Parameters:**
- `populate=*` - Populate all relations
- `populate[category]=true` - Populate category
- `populate[images]=true` - Populate images
- `filters[category][slug][$eq]=category-slug` - Filter by category slug
- `locale=en` - Filter by locale (required for localized content)

**Example Requests:**

```bash
# Get all categories with nested children and products
GET /api/categories?populate[childrenCategories]=true&populate[products][populate][images]=true&populate[image]=true

# Get category by slug (custom endpoint - no locale needed)
GET /api/categories/slug/refrigerators

# Get nested category by path (custom endpoint)
GET /api/categories/path/appliances/refrigerators

# Get all products with category and images
GET /api/products?populate[category]=true&populate[images]=true&populate[seo]=true

# Get product by slug (custom endpoint - no locale needed)
GET /api/products/slug/samsung-fridge

# Get product by full category path (custom endpoint)
GET /api/products/path/appliances/refrigerators/samsung-fridge

# Filter products by category
GET /api/products?filters[category][slug][$eq]=refrigerators&populate=*

# Get category by slug with locale (standard endpoint)
GET /api/categories?filters[slug][$eq]=refrigerators&locale=en&populate=*
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
