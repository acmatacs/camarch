# 🏛️ Cambodian Archaeology & Temple Discovery Platform

A visually immersive, interactive web platform for discovering, searching, and exploring archaeological sites and temples exclusively within Cambodia. Built with modern web technologies to provide a premium, museum-like experience for history enthusiasts and travelers.

## ✨ Features

* **Dynamic Discovery:** Explore a curated database of ancient Cambodian temples, from the iconic Angkor Wat to remote jungle ruins like Koh Ker.
* **Advanced Filtering:** Search and filter sites by historical era (e.g., Angkorian), architectural style, ruling King, and modern-day province.
* **Interactive Map:** A full-screen, custom-styled map built with Leaflet to visualize the geographical spread of the Khmer Empire's monuments.
* **Rich Detail Pages:** Immersive temple profiles featuring high-resolution galleries, historical timelines, visitor information, and architectural facts.
* **Modern & Fast:** Server-Side Rendered (SSR) with Next.js for blazing-fast performance and excellent SEO.

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
# Example using Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-REF].supabase.co:5432/postgres"
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

## 📄 License

This project is open-source and available under the [MIT License](./LICENSE).