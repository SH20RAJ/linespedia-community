# Linespedia Community

Linespedia is a writing-first, typography-focused social community platform where users publish and read poems, stories, shayari, quotes, lyrics, and thoughts categorized and driven by core emotions.

---

## 🚀 Key Features

- **Emotion-Driven Cataloging**: Explore and publish writings categorized by emotions: *Love, Sad, Hope, Peace, Motivation, Anger, Fear, Humor, Nostalgia, Dream, Gratitude, and Mystery*.
- **WordPress-like Writer Console (`/dashboard`)**: A comprehensive studio featuring real-time views and follower statistics, publication manager (edit/delete published writings and drafts), and quick cloud draft saving.
- **Admin Control Center (`/admin`)**: Secure administrative panel with sidebar navigation, stats overview cards, and complete moderation tables for writings, users, reviews, and comments.
- **Flicker-Free Infinite Scroll**: Optimized Facebook-like infinite loading using `SWRInfinite` offset-based pagination to avoid layout resets and maintain scroll positions.
- **Top Writers Leaderboard**: Leaderboard widgets on the homepage, explore section, and emotion pages ranking authors by publication counts and bios.
- **Sitemap & RSS Feeds**: Automated Dynamic RSS feed (`/feed.xml`) and dynamic Edge-optimized sitemap (`/sitemap.xml`) capped at 50,000 URLs to support search engine indexing.
- **Hexclave Authentication**: Seamless authentication using Stack Auth (Hexclave) Cloud Identity Provider.
- **TipTap Canvas Editor**: A distraction-free typography-rich editor with local auto-saving draft recovery.
- **Interactive Discussion Threads**: Nested comments and structured reaction systems (Love, Sad, Hope, Peace, etc.).
- **Search Palette**: Command-K search overlay for exploring writings, tags, and users instantly.

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
