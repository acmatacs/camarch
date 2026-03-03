import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reliable, always-working seed-based images from picsum.photos
// (user can replace these via the CMS Admin once it's built)
const imageUpdates = [
  {
    slug: "angkor-wat",
    featuredImage: "https://picsum.photos/seed/angkor-wat/1280/720",
    galleryImages: [
      "https://picsum.photos/seed/angkor-wat-2/1280/720",
      "https://picsum.photos/seed/angkor-wat-3/1280/720",
    ],
  },
  {
    slug: "bayon",
    featuredImage: "https://picsum.photos/seed/bayon-temple/1280/720",
    galleryImages: [
      "https://picsum.photos/seed/bayon-temple-2/1280/720",
    ],
  },
  {
    slug: "ta-prohm",
    featuredImage: "https://picsum.photos/seed/ta-prohm/1280/720",
    galleryImages: [
      "https://picsum.photos/seed/ta-prohm-2/1280/720",
    ],
  },
  {
    slug: "banteay-srei",
    featuredImage: "https://picsum.photos/seed/banteay-srei/1280/720",
    galleryImages: [
      "https://picsum.photos/seed/banteay-srei-2/1280/720",
    ],
  },
  {
    slug: "koh-ker",
    featuredImage: "https://picsum.photos/seed/koh-ker/1280/720",
    galleryImages: [
      "https://picsum.photos/seed/koh-ker-2/1280/720",
    ],
  },
];

async function main() {
  console.log("🔄 Updating image URLs...");
  for (const update of imageUpdates) {
    await prisma.temple.update({
      where: { slug: update.slug },
      data: {
        featuredImage: update.featuredImage,
        galleryImages: update.galleryImages,
      },
    });
    console.log(`  ✅ Updated ${update.slug}`);
  }
  console.log("🎉 Image URLs updated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
