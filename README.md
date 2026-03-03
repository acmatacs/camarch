# 🏛️ Cambodian Archaeology & Temple Discovery Platform

A visually immersive, interactive web platform for discovering, searching, and exploring archaeological sites and temples exclusively within Cambodia. Built with modern web technologies to provide a premium, museum-like experience for history enthusiasts and travelers.

## ✨ Features

### Public
* **Dynamic Discovery:** Explore a curated database of ancient Cambodian temples, from the iconic Angkor Wat to remote jungle ruins like Koh Ker.
* **Advanced Filtering:** Search and filter sites by historical era (e.g., Angkorian), architectural style, ruling King, and modern-day province.
* **Interactive Map:** A full-screen, custom-styled map built with Leaflet to visualize the geographical spread of the Khmer Empire's monuments.
* **Rich Detail Pages:** Immersive temple profiles featuring high-resolution galleries, historical timelines, visitor information, and architectural facts.
* **Modern & Fast:** Server-Side Rendered (SSR) with Next.js for blazing-fast performance and excellent SEO.

### Admin CMS
* **Salesforce Setup-style Admin Panel:** Sidebar with grouped sections, icons, real-time search, and a user info card footer.
* **Role-Based Access Control (RBAC):** Dynamic roles and permissions system — System Admin, Heritage Manager, and Field Staff roles with granular per-permission enforcement at both the API and UI layer.
* **User Management:** Create and manage admin accounts. Accounts can be activated or deactivated (no permanent deletion). Inactive accounts cannot log in.
* **Roles & Permissions:** Salesforce PermissionSet-style roles editor — select a role on the left, toggle permissions grouped by module on the right.
* **Audit Log:** Immutable, append-only log of all admin actions (create, update, delete, login, logout) with pagination, filtering by action type, entity, and actor.
* **Temple & Reference Data Management:** Full CRUD for temples, provinces, kings, architectural styles, and historical eras.

## 🛠️ Tech Stack

This project is built using a modern, 100% free/open-source capable stack:

* **Framework:** [Next.js](https://nextjs.org/) (React) with App Router
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database:** PostgreSQL (Hosted via [Supabase](https://supabase.com/))
* **ORM:** [Prisma](https://www.prisma.io/)
* **Maps:** [Leaflet](https://leafletjs.com/) via `react-leaflet` with OpenStreetMap tiles
* **Deployment:** [Vercel](https://vercel.com/)

## 🎨 Design System

The UI relies on the custom "Ancient Angkor" theme:
* **Colors:** Sandstone Off-White (`#F7F5F0`), Deep Temple Slate (`#1A1C1E`), Jungle Canopy Green (`#2C4C3B`), and Sunrise Gold (`#C57D3E`).
* **Typography:** `Playfair Display` (Headings) and `Inter` (Body).

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/acmatacs/camarch.git
cd camarch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root directory and add your database connection string:

```env
# Supabase pooled connection string (runtime queries)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-REF].supabase.co:5432/postgres"

# Supabase direct connection string (migrations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-REF].supabase.co:5432/postgres"

# Secret key for signing admin JWTs (min 32 characters recommended)
JWT_SECRET="your-secret-key-here"
```

### 4. Setup the Database

Push the Prisma schema to your database:

```bash
npx prisma db push
```

### 5. Seed the Database with Historical Data

Populate the database with the initial set of Kings, Provinces, Eras, Styles, and Temples:

```bash
npx prisma db seed
```

### 6. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to see the application.

## 🗄️ Database Schema Overview

The relational database is structured around the `Temple` entity, which is linked to:

* **Kings:** The monarch who commissioned the site (e.g., Jayavarman VII).
* **Provinces:** Modern geographical location (e.g., Siem Reap).
* **Styles:** Architectural style (e.g., Bayon style).
* **Eras:** Broad historical timeline (e.g., Angkorian).

The admin system adds:

* **AdminRole:** Named roles (System Admin, Heritage Manager, Field Staff) — fully dynamic and editable.
* **Permission:** Granular capabilities (e.g., `temples:write`, `users:manage`, `audit:read`).
* **RolePermission:** Join table linking roles to permissions.
* **User:** Admin accounts with `isActive` (activate/deactivate support), linked to an `AdminRole`.
* **AuditLog:** Append-only log of all admin operations, recording actor, action type, entity, before/after values, IP, and timestamp.

## 📄 License

This project is open-source and available under the [MIT License](./LICENSE).