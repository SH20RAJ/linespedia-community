# Linespedia Community

Linespedia is a writing-first, typography-focused social community platform where users publish and read poems, stories, shayari, quotes, lyrics, and thoughts categorized and driven by core emotions.

## 🚀 Key Features

- **Emotion-Driven Cataloging**: Explore and publish writings categorized by emotions: *Love, Sad, Hope, Peace, Motivation, Anger, Fear, Humor, Nostalgia, Dream, Gratitude, and Mystery*.
- **WordPress-like Writer Console (`/dashboard`)**: A comprehensive studio featuring real-time views and follower statistics, publication manager (edit/delete published writings and drafts), and quick cloud draft saving.
- **Admin Control Center (`/admin`)**: Secure administrative panel with sidebar navigation, stats overview cards, and complete moderation tables for writings, users, reviews, and comments.
- **Zen Reading Mode**: Immersive fullscreen typography overlay on post pages equipped with standard HTML5 `window.speechSynthesis` AI narration controls and a loopable background ambient rainfall sound player.
- **Aesthetic Quote Card Generator & Pinterest Pinning**: Interactive client-side HTML5 canvas graphic card customizer supporting preloaded Unsplash abstract themes (Starry Nebula, Forest, Vintage Parchment), base64 image downloads, and a prefilled **Pinterest Pin** sharing button to drive social media traffic.
- **Community Mood Word Cloud**: Dynamic size-weighted emotional tag cloud on the Explore page aggregating popular tags.
- **Collaborative Poetic Duets**: Database-linked duet continuation posts connecting poems by `parentWritingId` with visual parent/child continuation chains.
- **Weekly Community Digest Creator**: Admin studio workspace compiling the top 5 highest-viewed writings into copyable, responsive HTML email newsletter code.
- **Google AdSense & ads.txt Verification**: Fully compliant setup with layout-level Auto Ads script integration, publisher account meta verification, compliant Privacy/About pages, and a valid public `ads.txt` listing.
- **Flicker-Free Infinite Scroll**: Optimized Facebook-like infinite loading using `SWRInfinite` offset-based pagination.
- **Sitemap & RSS Feeds**: Automated Dynamic RSS feed (`/feed.xml`) and dynamic Edge-optimized sitemap (`/sitemap.xml`) capped at 50,000 URLs to support search engine indexing.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, Server Components)
- **API Routing**: Hono.js catch-all API handler
- **Database**: Cloudflare D1 / PostgreSQL Serverless
- **ORM**: Drizzle ORM
- **Client Caching**: Vercel `SWR` & `swr/infinite` (completely replacing React Query)
- **Authentication**: `@hexclave/next`
- **UI Components**: Shadcn UI & Base UI
- **Rich Text Editor**: TipTap Editor
- **Global State**: Zustand

---

## 📂 Project Architecture

```
├── src
│   ├── app                 # Next.js App Router (Pure Server Components)
│   │   ├── api             # Hono catch-all endpoints
│   │   ├── explore         # Emotion categories browsing & leaderboard
│   │   ├── dashboard       # Writer console studio
│   │   ├── post            # Dynamic single reading pages & comments
│   │   ├── sitemap.xml     # Dynamic Edge XML sitemap
│   │   └── profile         # User bio & statistic tabs
│   ├── components          # Reusable UI & Client Containers
│   │   ├── admin           # Moderation panel & admin sidebar
│   │   ├── common          # Navigation header, providers, search palette
│   │   ├── editor          # TipTap editor & drafts listing
│   │   ├── feed            # Post cards, comments, reviews, bookmarking
│   │   └── ui              # Primitive styled shadcn components
│   ├── db                  # Database configuration & schema declarations
│   └── hexclave            # Authentication clients (Client/Server)
```

---

## ⚙️ Setup and Installation

### 1. Environment Variables
Create a `.env.local` file at the root:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_HEXCLAVE_API_URL=https://api.stack-auth.com
NEXT_PUBLIC_HEXCLAVE_PROJECT_ID=8db5d0ee-b051-46b4-94db-494f90dd5927
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Database Migrations
Deploy schema:
```bash
bunx drizzle-kit push
```

### 4. Running Locally
```bash
bun run dev
```

---

## 📄 License
This project is open source and available under the MIT License.
