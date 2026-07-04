# Product Requirements Document (PRD)

# Linespedia Community (MVP)

**Version:** 1.0

**Goal**

Build the world's cleanest writing-first social platform where users publish poems, shayari, quotes, stories, lyrics, journals, captions, and thoughts organized by emotions. The application must prioritize performance, SEO, accessibility, maintainability, and simplicity.

---

# Design Philosophy

* Minimal UI
* Zero visual clutter
* Content-first
* Fast loading
* Mobile-first
* Accessibility-first
* SEO-first
* Emotion-first
* Pure shadcn/ui components
* No custom CSS files
* No Tailwind component libraries except shadcn/ui
* Use only Tailwind utility classes where necessary
* Consistent spacing based on an 8px grid

---

# Tech Stack

## Frontend

* Next.js 15 App Router
* React 19
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Lucide Icons
* Motion
* React Hook Form
* Zod
* TanStack Query
* Zustand
* TipTap Editor
* next-themes

## Backend

* Cloudflare Workers
* Hono
* Drizzle ORM
* Cloudflare D1
* Cloudflare KV
* Cloudflare R2
* Cloudflare Queues
* Durable Objects (notifications/chat-ready)
* Better Auth

## Infrastructure

* Cloudflare Pages
* GitHub Actions
* Wrangler
* Cloudflare Analytics
* PostHog

---

# Folder Structure

```
app/

components/
    ui/
    feed/
    editor/
    profile/
    common/

lib/
hooks/
services/
actions/
db/
types/
validators/
constants/
emails/
utils/

public/

workers/

```

Rules

* Feature-based folders
* No utility dumping
* One component = one responsibility
* Maximum file size 300 lines
* Components under 150 lines whenever possible
* No circular imports
* No duplicated code

---

# UI Rules

Only shadcn/ui components

Allowed

* Button
* Card
* Dialog
* Dropdown
* Tooltip
* Sheet
* Drawer
* Avatar
* Badge
* Tabs
* Input
* Textarea
* Skeleton
* Separator
* Scroll Area
* Command
* Popover
* Calendar

No handcrafted components unless necessary.

No custom button styles.

No custom animations except Motion.

No gradients except emotion accents.

---

# Typography

Primary

Geist

Fallback

System fonts

Heading

Bold

Body

Regular

Line height

1.7

Readable width

75 characters maximum

---

# Color System

Neutral interface

Emotion determines accent.

| Emotion    | Accent  |
| ---------- | ------- |
| Love       | Rose    |
| Sad        | Indigo  |
| Hope       | Emerald |
| Peace      | Sky     |
| Motivation | Orange  |
| Anger      | Red     |
| Fear       | Violet  |
| Humor      | Lime    |
| Nostalgia  | Amber   |
| Dream      | Cyan    |
| Gratitude  | Yellow  |
| Mystery    | Purple  |

Entire UI remains neutral.

Only badges, buttons, progress bars, and highlights use emotion colors.

---

# Authentication

* Email
* Google
* GitHub

Future

Magic links

---

# User Profile

Username

Avatar

Bio

Website

Social links

Followers

Following

Pinned writings

Emotion statistics

Recent activity

Draft count

Published count

---

# Feed

Latest

Trending

Following

For You

Emotion Feed

Saved

Infinite scrolling

Virtualization

Optimistic updates

---

# Editor

TipTap

Supports

* Markdown shortcuts
* Rich text
* Quotes
* Lists
* Code
* Images
* Links
* Headings

Auto save

Draft recovery

Word count

Character count

Estimated reading time

---

# Posts

Supports

Poem

Story

Quote

Shayari

Caption

Lyrics

Article

Journal

Microblog

Each post contains

Title

Slug

Emotion

Language

Tags

Cover image

Reading time

Views

Reactions

Bookmarks

Comments

Share count

SEO metadata

Canonical URL

Structured Data

---

# Emotion System

Every post requires

Primary emotion

Optional secondary emotion

Displayed as

Colored badge

Emotion page

Example

```
/emotion/love

/emotion/hope
```

---

# Search

Search

Users

Posts

Tags

Emotions

Languages

Autocomplete

Instant search

Keyboard shortcut

CMD + K

---

# Reactions

Instead of likes

* Felt This
* Inspired
* Powerful
* Beautiful
* Relatable
* Thoughtful

---

# Bookmarks

Private collections

Folders

Search inside folders

---

# Notifications

Follow

Comment

Mention

Reply

Reaction

Bookmark milestone

---

# Comments

Nested replies

Markdown

Mentions

Delete

Edit

---

# SEO (Highest Priority)

Every page

Static metadata

Canonical

Open Graph

Twitter cards

JSON-LD

Breadcrumb schema

Article schema

Author schema

Organization schema

FAQ schema where applicable

robots.txt

sitemap.xml

news sitemap ready

RSS feed

Image sitemap

Pagination metadata

Clean URLs

No query parameters

Lazy loading

Image optimization

Pre-render whenever possible

Server Components by default

Metadata generated server-side

Unique titles

Unique descriptions

Alt text required

Structured internal linking

Automatic breadcrumbs

No duplicate content

Canonical enforcement

Slug uniqueness

Automatic redirects

No index for drafts

Compression enabled

Edge caching

Font optimization

Critical CSS minimized

No layout shift

Target

Lighthouse

100 SEO

100 Best Practices

100 Accessibility

100 Performance (where practical)

---

# Performance

Server Components first

Client Components only when needed

Streaming

Suspense

Route prefetching

Partial prerendering

Image optimization

Code splitting

Tree shaking

Lazy imports

Edge rendering

Memoization

Virtualized lists

Request deduplication

Compression

No unnecessary re-renders

---

# Caching Strategy

Browser cache

Edge cache

ISR where appropriate

React cache()

TanStack Query

Cloudflare KV

CDN cache

Image cache

Static assets immutable

Database query caching

Stale while revalidate

Background revalidation

ETags

Conditional requests

---

# Accessibility

Keyboard navigation

Visible focus

Screen reader labels

ARIA

Contrast AA+

Semantic HTML

Reduced motion support

Alt text

Accessible dialogs

Accessible forms

---

# Security

Rate limiting

CSRF protection

XSS prevention

Input validation

Output sanitization

Secure cookies

HTTP Only

SameSite

Content Security Policy

Helmet headers

SQL injection prevention

Drizzle prepared statements

---

# Moderation

Report post

Block user

Mute user

Delete own content

Profanity detection

Spam detection

Duplicate detection

---

# Analytics

Page views

Reading time

Completion rate

Popular emotions

Top writers

Trending tags

---

# API Rules

REST

Versioned

```
/api/v1/
```

Typed responses

Consistent errors

Validation everywhere

No business logic in routes

---

# Database Rules

UUID primary keys

Soft deletes

CreatedAt

UpdatedAt

Indexes on

Slug

Username

Emotion

Tags

Views

Published date

Composite indexes

Foreign keys

---

# Code Standards

Strict TypeScript

ESLint

Prettier

Husky

Commitlint

Conventional commits

Absolute imports

No any

Reusable hooks

Server Actions preferred

No duplicated business logic

Feature-first architecture

---

# Testing

Vitest

Playwright

Component tests

Integration tests

E2E tests

Accessibility tests

SEO validation

---

# Deployment Pipeline

GitHub Push

↓

Lint

↓

Type Check

↓

Tests

↓

Build

↓

Cloudflare Pages Preview

↓

Production Deploy

---

# MVP Pages

* Home
* Explore
* Search
* Login
* Register
* Profile
* Edit Profile
* Create Post
* Drafts
* Notifications
* Saved
* Emotion Page
* Tag Page
* Language Page
* Individual Post
* Settings
* About
* Privacy
* Terms
* Contact
* Sitemap
* RSS Feed

---

# Non-Functional Goals

* Initial load under 1 second on broadband
* Largest Contentful Paint under 2 seconds
* Cumulative Layout Shift below 0.05
* Time to Interactive under 2.5 seconds
* Mobile-first responsive design
* 95%+ Lighthouse scores across key metrics
* Fully deployable to Cloudflare Pages and Workers
* Production-ready codebase with consistent architecture and documentation

---

# Future Roadmap (Post-MVP)

* AI writing assistant
* Emotion-based recommendations
* Collaborative writing
* Audio narration
* Writing challenges
* Communities
* Direct messaging
* Creator monetization
* Public API
* Mobile apps
* Offline support
* Progressive Web App
* AI-powered moderation
* Multi-language localization
* Reader subscriptions
* Premium analytics
* Import from Markdown and Notion
* Plugin ecosystem
