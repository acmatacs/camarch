import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Eras ───────────────────────────────────────────────────────────────────
  const angkorian = await prisma.era.upsert({
    where: { name: "Angkorian" },
    update: {},
    create: { name: "Angkorian" },
  });
  const preAngkorian = await prisma.era.upsert({
    where: { name: "Pre-Angkorian" },
    update: {},
    create: { name: "Pre-Angkorian" },
  });

  console.log("✅ Eras seeded");

  // ─── Provinces ──────────────────────────────────────────────────────────────
  const siemReap = await prisma.province.upsert({
    where: { name: "Siem Reap" },
    update: {},
    create: {
      name: "Siem Reap",
      description:
        "Home to the majestic Angkor Archaeological Park, Siem Reap is the gateway to the ancient Khmer Empire's most significant temples.",
    },
  });
  const preahVihear = await prisma.province.upsert({
    where: { name: "Preah Vihear" },
    update: {},
    create: {
      name: "Preah Vihear",
      description:
        "A remote northern province dotted with ancient Khmer ruins, including the remarkable Koh Ker temple complex.",
    },
  });

  console.log("✅ Provinces seeded");

  // ─── Kings ──────────────────────────────────────────────────────────────────
  const suryavarman2 = await prisma.king.upsert({
    where: { name: "Suryavarman II" },
    update: {},
    create: {
      name: "Suryavarman II",
      reignStart: 1113,
      reignEnd: 1150,
      description:
        "One of the greatest Khmer kings, Suryavarman II unified the kingdom and commissioned Angkor Wat as a state temple dedicated to Vishnu.",
    },
  });
  const jayavarman7 = await prisma.king.upsert({
    where: { name: "Jayavarman VII" },
    update: {},
    create: {
      name: "Jayavarman VII",
      reignStart: 1181,
      reignEnd: 1218,
      description:
        "The most prolific builder in Khmer history, Jayavarman VII was a devout Buddhist who commissioned Angkor Thom, the Bayon, Ta Prohm, and over 100 hospitals.",
    },
  });
  const rajendravarman = await prisma.king.upsert({
    where: { name: "Rajendravarman II" },
    update: {},
    create: {
      name: "Rajendravarman II",
      reignStart: 944,
      reignEnd: 968,
      description:
        "The king who returned the royal capital to Angkor and commissioned the exquisitely carved Banteay Srei temple.",
    },
  });
  const jayavarman4 = await prisma.king.upsert({
    where: { name: "Jayavarman IV" },
    update: {},
    create: {
      name: "Jayavarman IV",
      reignStart: 921,
      reignEnd: 941,
      description:
        "Jayavarman IV moved the royal capital to Koh Ker and constructed the dramatic seven-tiered Prasat Thom pyramid.",
    },
  });

  console.log("✅ Kings seeded");

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const angkorWatStyle = await prisma.style.upsert({
    where: { name: "Angkor Wat Style" },
    update: {},
    create: {
      name: "Angkor Wat Style",
      period: "Early 12th century",
    },
  });
  const bayonStyle = await prisma.style.upsert({
    where: { name: "Bayon Style" },
    update: {},
    create: {
      name: "Bayon Style",
      period: "Late 12th – early 13th century",
    },
  });
  const banteaySreiStyle = await prisma.style.upsert({
    where: { name: "Banteay Srei Style" },
    update: {},
    create: {
      name: "Banteay Srei Style",
      period: "Late 10th century",
    },
  });
  const kohKerStyle = await prisma.style.upsert({
    where: { name: "Koh Ker Style" },
    update: {},
    create: {
      name: "Koh Ker Style",
      period: "Early 10th century",
    },
  });

  console.log("✅ Styles seeded");

  // ─── Temples ────────────────────────────────────────────────────────────────

  // 1. Angkor Wat
  await prisma.temple.upsert({
    where: { slug: "angkor-wat" },
    update: {},
    create: {
      slug: "angkor-wat",
      name: "Angkor Wat",
      khmerName: "អង្គរវត្ត",
      description:
        "The largest religious monument in the world, Angkor Wat is a masterpiece of Khmer architecture. Originally constructed as a Hindu temple dedicated to Vishnu, it was gradually transformed into a Buddhist temple. Its iconic five-tower silhouette is recognized worldwide and is featured on Cambodia's national flag.",
      history:
        "Angkor Wat was constructed by King Suryavarman II in the early 12th century as his state temple and eventual mausoleum. The temple is built on a massive scale — it covers over 400 acres and is surrounded by a 190-metre-wide moat. Its bas-reliefs, stretching for nearly half a kilometre, depict scenes from Hindu mythology and the Khmer king's military campaigns. The temple was never abandoned and has been continuously used as a place of worship for over 800 years.",
      latitude: 13.4125,
      longitude: 103.867,
      yearBuilt: 1113,
      religion: "Hindu (later Buddhist)",
      featuredImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Angkor_Wat_temple.jpg/1280px-Angkor_Wat_temple.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Angkor_Wat%2C_Camboya%2C_2013-08-16%2C_DD_04.jpg/1280px-Angkor_Wat%2C_Camboya%2C_2013-08-16%2C_DD_04.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Angkor_Wat_bas_relief.jpg/1280px-Angkor_Wat_bas_relief.jpg",
      ],
      provinceId: siemReap.id,
      kingId: suryavarman2.id,
      styleId: angkorWatStyle.id,
      eraId: angkorian.id,
    },
  });

  // 2. Bayon
  await prisma.temple.upsert({
    where: { slug: "bayon" },
    update: {},
    create: {
      slug: "bayon",
      name: "Bayon",
      khmerName: "ប្រាសាទបាយ័ន",
      description:
        "Located at the exact centre of the walled city of Angkor Thom, the Bayon is one of the most captivating temples in the Angkor complex. Its most distinctive feature is the multitude of serene and smiling stone faces, believed to represent the bodhisattva Avalokiteshvara or King Jayavarman VII himself.",
      history:
        "Built in the late 12th or early 13th century, the Bayon was the last state temple to be constructed at Angkor. Jayavarman VII, a devout Mahayana Buddhist, placed the Bayon at the heart of his capital, Angkor Thom. The temple originally displayed over 200 smiling faces across 54 towers. Its extensive bas-reliefs on the outer gallery wall depict both mythological scenes and vivid everyday Khmer life, including fishing, markets, and army processions.",
      latitude: 13.4413,
      longitude: 103.8593,
      yearBuilt: 1190,
      religion: "Buddhist (Mahayana)",
      featuredImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bayon_temple%2C_Angkor_Thom.jpg/1280px-Bayon_temple%2C_Angkor_Thom.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bayon_Angkor_faces.jpg/1280px-Bayon_Angkor_faces.jpg",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 3. Ta Prohm
  await prisma.temple.upsert({
    where: { slug: "ta-prohm" },
    update: {},
    create: {
      slug: "ta-prohm",
      name: "Ta Prohm",
      khmerName: "ប្រាសាទតាព្រហ្ម",
      description:
        "Often called the 'Jungle Temple', Ta Prohm is famous worldwide for the massive tree roots that have grown over and through its ancient stone walls. Left largely as it was found by French explorers, it offers a dramatic glimpse into how the jungle reclaimed the Angkor temples over centuries.",
      history:
        "Ta Prohm was built by King Jayavarman VII in 1186 as a Buddhist monastery and university. At its height, it housed over 12,500 people, including 18 high priests, 2,740 officiants, and nearly 2,500 assistants. After the fall of the Khmer Empire, the temple was abandoned and the surrounding jungle gradually engulfed its structures. It was famously used as a filming location for the movie Lara Croft: Tomb Raider (2001).",
      latitude: 13.4352,
      longitude: 103.889,
      yearBuilt: 1186,
      religion: "Buddhist (Mahayana)",
      featuredImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Ta_Prohm_Angkor_1.jpg/1280px-Ta_Prohm_Angkor_1.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Ta_Prohm%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_30.jpg/1280px-Ta_Prohm%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_30.jpg",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 4. Banteay Srei
  await prisma.temple.upsert({
    where: { slug: "banteay-srei" },
    update: {},
    create: {
      slug: "banteay-srei",
      name: "Banteay Srei",
      khmerName: "ប្រាសាទបន្ទាយស្រី",
      description:
        "Nicknamed the 'Citadel of Women' or 'Citadel of Beauty', Banteay Srei is celebrated as one of the finest examples of Khmer decorative carving. Built primarily from pink sandstone, it is renowned for its intricate, jewel-like bas-reliefs that are extraordinarily well-preserved.",
      history:
        "Unlike most Angkor temples, Banteay Srei was not built by a king. It was constructed in 967 CE by Yajnavaraha, a counsellor and scholarly brahmin, and dedicated to the Hindu god Shiva. The temple's relatively small scale is compensated by the extraordinary density and quality of its carvings, depicting scenes from the Hindu epics Ramayana and Mahabharata. In 1923, the French writer André Malraux famously attempted to steal several carved devatas from this temple.",
      latitude: 13.5997,
      longitude: 103.9637,
      yearBuilt: 967,
      religion: "Hindu (Shaivite)",
      featuredImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Banteay_Srei_temple_view.jpg/1280px-Banteay_Srei_temple_view.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Banteay_Srei_closeup_carvings.jpg/1280px-Banteay_Srei_closeup_carvings.jpg",
      ],
      provinceId: siemReap.id,
      kingId: rajendravarman.id,
      styleId: banteaySreiStyle.id,
      eraId: angkorian.id,
    },
  });

  // 5. Koh Ker
  await prisma.temple.upsert({
    where: { slug: "koh-ker" },
    update: {},
    create: {
      slug: "koh-ker",
      name: "Koh Ker",
      khmerName: "កោះគែរ",
      description:
        "A remote and rarely visited temple complex, Koh Ker served as the capital of the Khmer Empire for a brief period in the early 10th century. Its centrepiece is Prasat Thom, a dramatic seven-tiered sandstone pyramid rising 35 metres above the jungle canopy.",
      history:
        "After a power struggle, King Jayavarman IV moved the royal capital from Angkor to Koh Ker in 921 CE. During the two decades of rule from Koh Ker, he constructed over 40 smaller temples in addition to the main pyramid. The complex was abandoned when the capital returned to Angkor in 944 CE. Due to its remote location in Preah Vihear province, Koh Ker was heavily mined during the civil war period and is still being cleared. It was inscribed as a UNESCO World Heritage Site in 2023.",
      latitude: 13.8049,
      longitude: 104.569,
      yearBuilt: 921,
      religion: "Hindu (Shaivite)",
      featuredImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Koh_Ker_Prasat_Thom.jpg/1280px-Koh_Ker_Prasat_Thom.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Koh_Ker_Pyramid_Cambodia.jpg/1280px-Koh_Ker_Pyramid_Cambodia.jpg",
      ],
      provinceId: preahVihear.id,
      kingId: jayavarman4.id,
      styleId: kohKerStyle.id,
      eraId: angkorian.id,
    },
  });

  console.log("✅ Temples seeded");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
