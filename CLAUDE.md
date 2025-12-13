# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing two interconnected applications:
- **kholod-rr**: React Router 7 frontend (SSR-enabled) with shadcn/ui components
- **kholod-strapi**: Strapi 5 CMS backend serving content via REST API

**Package Manager**: This project uses **bun** instead of npm.

## Commands

### Frontend (kholod-rr)
```bash
cd kholod-rr
bun run dev        # Start dev server on port 3006
bun run build      # Build for production
bun run typecheck  # Type checking with React Router typegen
```

### Backend (kholod-strapi)
```bash
cd kholod-strapi
bun run develop    # Start Strapi with admin panel (port 1337)
bun run start      # Start without autoReload
bun run build      # Build admin panel

# Data seeding
bun run seed:test-catalog  # Populate with test categories and products
```

## Architecture

### Monorepo Structure
Both apps are independent but work together:
- Frontend fetches data from Strapi backend via REST API (`http://localhost:1337/api/*`)
- No shared code between apps; each has its own dependencies

### Frontend Architecture (kholod-rr)

**Routing System**: File-based routing using React Router v7
- `(headered)` layout group wraps routes with header/navigation
- Dynamic routes use `$` prefix: `product.$slug.tsx`
- Splat routes for catch-all pages: `$.tsx`
- SSR enabled by default via `react-router.config.ts`

**Data Fetching**: Direct REST API calls in `app/lib/http.ts`
- All Strapi queries centralized in this file
- Standard Strapi query structure with `populate` for relations
- Custom endpoints for slug-based and path-based lookups

**Component Organization**:
- `app/components/ui/` - shadcn/ui components (Button, Dialog, Sheet, etc.)
- `app/components/blocks/` - Dynamic content blocks from Strapi
  - `block-renderer.tsx` maps Strapi `__component` field to React components
  - Supports: RichText, ImageBanner, ThreeImagesBanner, HoverableBannersGrid
- Domain components: Header, ProductCard, CategoryCard, SpecificationTable

**Layout Pattern**:
- `(headered).tsx` layout fetches shared data once (navigation, categories, contact info)
- Nested routes avoid refetching via React Router's loader inheritance
- Uses Outlet pattern for route-specific content

### Backend Architecture (kholod-strapi)

**Content Types** (in `src/api/`):
- **Product**: name, slug, description, price, category (relation), images (media), specifications (component repeatable), seo, i18n enabled
- **Category**: Hierarchical structure with parent/child self-relations, products, specificationFilters
- **Page**: Dynamic content with blocks (dynamic zone), supports nested page hierarchies
- **General Site Info**: Singleton for global settings (contact info, etc.)

**Custom Endpoints**:
Each content type has custom routes beyond standard REST:
- `/api/products/slug/:slug` - Find product by slug (bypasses locale requirement)
- `/api/products/path/:path*` - Find by full category path + slug
- `/api/categories/slug/:slug` - Find category by slug
- `/api/categories/path/:path*` - Hierarchical category path lookup

**Shared Components** (in `src/components/shared/`):
Reusable content components used across content types:
- SEO (metaTitle, metaDescription, keywords)
- Specification (label, slug, unit, value)
- Specification Filter (for category filtering)
- Various banner types (ImageBanner, ThreeImagesBanner, HoverableImageBanner, HoverableBannersGrid)
- RichText blocks

**Data Seeding**:
`scripts/seed-test-catalog.js` generates realistic test data:
- Creates category hierarchy (3 templates: Refrigerators, Air Conditioners, Washing Machines)
- Generates 20+ products per category with specifications matching filter types
- Uploads placeholder images from placeholderimage.io
- Uses @ngneat/falso for realistic fake data
- **WARNING**: Clears existing categories/products before seeding

## Important Patterns

### Strapi Query Patterns
Population syntax for fetching related data:
```
?populate[childrenCategories][populate][image]=true
?populate[products][populate][images]=true
?populate[blocks][*]=true
```

### Type Safety
- Frontend types in `app/lib/types/` match Strapi schema
- All API responses should be validated against these types
- TypeScript strict mode enabled in both apps

### Component Rendering from Strapi
The frontend uses a block renderer pattern:
1. Strapi Page content has `blocks` field (dynamic zone)
2. Each block has `__component` field (e.g., "shared.rich-text")
3. `block-renderer.tsx` maps component names to React components
4. When adding new block types, update both Strapi schema AND block-renderer.tsx

### Image URLs
Strapi returns relative paths; frontend must construct full URLs:
```typescript
const imageUrl = `${strapiUrl}${image.url}`
```

### Category Hierarchies
Categories support parent/child relationships:
- Top-level categories: `filters[parentCategory][$null]=true`
- Path traversal: Custom `/categories/path/*` endpoint walks hierarchy
- Breadcrumbs built from parent chain

## Development Workflow

### Adding New Content Types in Strapi
1. Create schema in `src/api/[name]/content-types/[name]/schema.json`
2. Add controller in `src/api/[name]/controllers/[name].ts` (if custom logic needed)
3. Define routes in `src/api/[name]/routes/[name].ts`
4. Update frontend types in `kholod-rr/app/lib/types/`
5. Add fetch function in `kholod-rr/app/lib/http.ts`

### Adding New Dynamic Blocks
1. Create component schema in `kholod-strapi/src/components/shared/[name].json`
2. Add to Page dynamic zone in schema
3. Create React component in `kholod-rr/app/components/blocks/[name]-block.tsx`
4. Update `block-renderer.tsx` to map `__component` name to new component
5. Add TypeScript type to `app/lib/types/block.ts`

### Styling with shadcn/ui
- Uses New York style variant with neutral base color
- Component config in `kholod-rr/components.json`
- Install new components: `bunx shadcn@latest add [component]`
- Tailwind CSS v4 with custom CSS variables in `app.css`

## Database

Strapi supports multiple databases (configured in `kholod-strapi/config/database.ts`):
- **Default**: SQLite (better-sqlite3) - stored in `database/data.db`
- **Production**: PostgreSQL or MySQL (configure via environment variables)

When switching databases, existing data must be migrated or reseeded.
