import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@camarch.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "CamArch@3921";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash,
      name: "CamArch Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user seeded: ${adminEmail}`);

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
    create: { name: "Koh Ker Style", period: "Early 10th century" },
  });
  const preRupStyle = await prisma.style.upsert({
    where: { name: "Pre Rup Style" },
    update: {},
    create: { name: "Pre Rup Style", period: "Mid 10th century" },
  });
  const bakhengStyle = await prisma.style.upsert({
    where: { name: "Bakheng Style" },
    update: {},
    create: { name: "Bakheng Style", period: "Late 9th – early 10th century" },
  });
  const rolousStyle = await prisma.style.upsert({
    where: { name: "Roluos Style" },
    update: {},
    create: { name: "Roluos Style", period: "Late 9th century" },
  });
  const preahKhanStyle = await prisma.style.upsert({
    where: { name: "Preah Khan Style" },
    update: {},
    create: { name: "Preah Khan Style", period: "Late 12th – early 13th century" },
  });
  const samborStyle = await prisma.style.upsert({
    where: { name: "Sambor Prei Kuk Style" },
    update: {},
    create: { name: "Sambor Prei Kuk Style", period: "7th century" },
  });

  console.log("✅ Styles seeded");

  // ─── Additional Provinces ───────────────────────────────────────────────────
  const kampongThom = await prisma.province.upsert({
    where: { name: "Kampong Thom" },
    update: {},
    create: {
      name: "Kampong Thom",
      description:
        "The geographic heart of Cambodia, Kampong Thom is home to the remarkable Pre-Angkorian ruins of Sambor Prei Kuk — one of the earliest large cities of Southeast Asia.",
    },
  });
  const banteayMeanchey = await prisma.province.upsert({
    where: { name: "Banteay Meanchey" },
    update: {},
    create: {
      name: "Banteay Meanchey",
      description:
        "Located in northwestern Cambodia near the Thai border, Banteay Meanchey contains the spectacular but often overlooked temple fortress of Banteay Chhmar.",
    },
  });

  console.log("✅ Additional provinces seeded");

  // ─── Additional Kings ───────────────────────────────────────────────────────
  const yasovarman1 = await prisma.king.upsert({
    where: { name: "Yasovarman I" },
    update: {},
    create: {
      name: "Yasovarman I",
      reignStart: 889,
      reignEnd: 910,
      description:
        "Yasovarman I founded Yasodharapura, the first 'Angkor' city, and built Phnom Bakheng as the central state temple of his new capital. He was a prolific builder who established ashrams across his kingdom.",
    },
  });
  const indravarman1 = await prisma.king.upsert({
    where: { name: "Indravarman I" },
    update: {},
    create: {
      name: "Indravarman I",
      reignStart: 877,
      reignEnd: 889,
      description:
        "Regarded as the first great builder-king of the Khmer Empire, Indravarman I established the Roluos group of temples — the earliest monumental Angkorian structures — and built the first great Khmer reservoir.",
    },
  });
  const suryavarman1 = await prisma.king.upsert({
    where: { name: "Suryavarman I" },
    update: {},
    create: {
      name: "Suryavarman I",
      reignStart: 1002,
      reignEnd: 1050,
      description:
        "Suryavarman I greatly expanded the Khmer Empire's territory and initiated construction of Preah Vihear temple on the Dangrek escarpment. He was a skilled military and political leader.",
    },
  });
  const jayavarman5 = await prisma.king.upsert({
    where: { name: "Jayavarman V" },
    update: {},
    create: {
      name: "Jayavarman V",
      reignStart: 968,
      reignEnd: 1001,
      description:
        "Jayavarman V continued the building programmes of his predecessor and commissioned Ta Keo, one of the earliest temples built entirely from sandstone, though it was never fully completed.",
    },
  });
  const isanavarman1 = await prisma.king.upsert({
    where: { name: "Isanavarman I" },
    update: {},
    create: {
      name: "Isanavarman I",
      reignStart: 616,
      reignEnd: 637,
      description:
        "The king of the Chenla kingdom who founded Isanapura (modern Sambor Prei Kuk) as his capital — the earliest large planned city in Southeast Asia and a precursor to the great Angkorian temples.",
    },
  });

  console.log("✅ Additional kings seeded");

  // ─── Temples ────────────────────────────────────────────────────────────────

  // 1. Angkor Wat
  await prisma.temple.upsert({
    where: { slug: "angkor-wat" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/1280px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/1280px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg"],
    },
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/1280px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg",
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
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bayon%2C_Angkor_Thom%2C_Camboya%2C_2013-08-17%2C_DD_37.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/f/fa/Bayon%2C_Angkor_Thom%2C_Camboya%2C_2013-08-17%2C_DD_37.JPG"],
    },
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
        "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bayon%2C_Angkor_Thom%2C_Camboya%2C_2013-08-17%2C_DD_37.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bayon%2C_Angkor_Thom%2C_Camboya%2C_2013-08-17%2C_DD_37.JPG",
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
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Ta_Prohm_%28III%29.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/8/8c/Ta_Prohm_%28III%29.jpg"],
    },
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
        "https://upload.wikimedia.org/wikipedia/commons/8/8c/Ta_Prohm_%28III%29.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/8/8c/Ta_Prohm_%28III%29.jpg",
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
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Banteay_Srei_full2.jpg/1280px-Banteay_Srei_full2.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Banteay_Srei_full2.jpg/1280px-Banteay_Srei_full2.jpg"],
    },
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Banteay_Srei_full2.jpg/1280px-Banteay_Srei_full2.jpg",
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
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Koh_Ker_Prasat_Thom.jpg/1280px-Koh_Ker_Prasat_Thom.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Koh_Ker_Prasat_Thom.jpg/1280px-Koh_Ker_Prasat_Thom.jpg"],
    },
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

  console.log("✅ Temples seeded — first 5 done, adding 15 more...");

  // 6. Preah Khan
  await prisma.temple.upsert({
    where: { slug: "preah-khan" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG/1280px-Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG/1280px-Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG"],
    },
    create: {
      slug: "preah-khan",
      name: "Preah Khan",
      khmerName: "ប្រាសាទព្រះខ័ន",
      description:
        "One of the largest temples at Angkor, Preah Khan was built by Jayavarman VII in memory of his father. A magnificent maze of dark corridors, moss-covered courtyard walls, and soaring trees, it encompasses a huge area surrounded by a moat with eight nagas (serpent deities).",
      history:
        "Built in 1191, Preah Khan originally served as both a Buddhist monastery and a city in itself, housing over 97,000 workers who served or lived within its boundaries. The temple is known for its extraordinary narrative bas-reliefs and the mystical two-storey columnar hall — an unusual architectural anomaly among Angkor temples. Today it remains partly unrestored, which gives it a romantic, overgrown atmosphere.",
      latitude: 13.4461,
      longitude: 103.8567,
      yearBuilt: 1191,
      religion: "Buddhist (Mahayana)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG/1280px-Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG/1280px-Preah_Khan%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_26.JPG",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 7. Neak Pean
  await prisma.temple.upsert({
    where: { slug: "neak-pean" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neakpeancentralpond2014.jpg/1280px-Neakpeancentralpond2014.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neakpeancentralpond2014.jpg/1280px-Neakpeancentralpond2014.jpg"],
    },
    create: {
      slug: "neak-pean",
      name: "Neak Pean",
      khmerName: "ប្រាសាទនាគព័ន្ធ",
      description:
        "A unique island temple set in the centre of a large man-made reservoir, Neak Pean ('Coiled Serpents') is a masterpiece of Khmer symbolic architecture. A circular island sanctuary sits within four interconnected pools, representing the Himalayan lake Anavatapta — believed to cure all diseases.",
      history:
        "Neak Pean was constructed by Jayavarman VII in the late 12th century as an island at the centre of Jayatataka Baray (reservoir). The central tower is encircled at its base by two intertwined serpents. The four surrounding pools, each guarded by a different stone animal head, symbolise the four sacred rivers of Asia. The site was both a place of ritual bathing and a philosophical representation of the centre of the universe.",
      latitude: 13.4641,
      longitude: 103.8683,
      yearBuilt: 1190,
      religion: "Buddhist (Mahayana)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neakpeancentralpond2014.jpg/1280px-Neakpeancentralpond2014.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neakpeancentralpond2014.jpg/1280px-Neakpeancentralpond2014.jpg",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 8. Ta Som
  await prisma.temple.upsert({
    where: { slug: "ta-som" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Gopura_du_temple_Ta_Som_%28Angkor%29_%286973281033%29.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/f/f1/Gopura_du_temple_Ta_Som_%28Angkor%29_%286973281033%29.jpg"],
    },
    create: {
      slug: "ta-som",
      name: "Ta Som",
      khmerName: "ប្រាសាទតាសោម",
      description:
        "A small but enchanting late-12th-century temple, Ta Som is most famous for the iconic strangler fig tree that has completely engulfed its eastern entrance gopura. The contrast of sculpted stone and gnarled roots is one of the most photographed images in Angkor.",
      history:
        "Built by Jayavarman VII, Ta Som was a Buddhist temple dedicated to his father Dharanindravarman II. It follows the same basic layout as Ta Prohm and Banteay Kdei, with a single tower, enclosing walls, and gopuras. Unlike those larger temples, Ta Som's compact size makes it easy to explore in a single visit, and its relatively unrestored state gives it an intimate, jungle-reclaimed character.",
      latitude: 13.4674,
      longitude: 103.882,
      yearBuilt: 1190,
      religion: "Buddhist (Mahayana)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Gopura_du_temple_Ta_Som_%28Angkor%29_%286973281033%29.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/f/f1/Gopura_du_temple_Ta_Som_%28Angkor%29_%286973281033%29.jpg",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 9. Banteay Kdei
  await prisma.temple.upsert({
    where: { slug: "banteay-kdei" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG/1280px-Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG/1280px-Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG"],
    },
    create: {
      slug: "banteay-kdei",
      name: "Banteay Kdei",
      khmerName: "ប្រាសាទបន្ទាយក្តី",
      description:
        "Known as the 'Citadel of Chambers', Banteay Kdei is a large Buddhist monastery facing the Srah Srang reservoir. Its four entrance gopuras are adorned with the same smiling Avalokiteshvara faces found on the Bayon. In 2001, archaeologists discovered a cache of over 270 buried Buddha statues in the compound.",
      history:
        "Built by Jayavarman VII in the late 12th century, Banteay Kdei was constructed on the site of an earlier 10th-century temple. Like Ta Prohm, it served as a major Buddhist monastery. The temple is surrounded by a moat, and its layout features a series of concentric galleries and towers. The nearby Srah Srang ('Royal Bathing Pool') was used by the king and his royal household.",
      latitude: 13.432,
      longitude: 103.893,
      yearBuilt: 1190,
      religion: "Buddhist (Mahayana)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG/1280px-Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG/1280px-Banteay_Kdei%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_10.JPG",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 10. Pre Rup
  await prisma.temple.upsert({
    where: { slug: "pre-rup" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG/1280px-Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG/1280px-Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG"],
    },
    create: {
      slug: "pre-rup",
      name: "Pre Rup",
      khmerName: "ប្រាសាទព្រែរូប",
      description:
        "Pre Rup is a towering brick-and-laterite temple mountain, built as the state temple of King Rajendravarman II. Rising on a three-tiered pyramid, it commands sweeping views across the surrounding plain. Its dramatic silhouette is especially striking at sunset, making it a beloved vantage point for visitors to Angkor.",
      history:
        "Consecrated in 961 CE, Pre Rup was the royal state temple of Rajendravarman II and represents a transition in Khmer architecture. Its towers are built in brick with sandstone decorative elements, and the complex includes two libraries flanking the central causeway. The name 'Pre Rup' means roughly 'turn the body', a reference to the funerary rites once performed here — ashes from the royal cremations were processed around the temple.",
      latitude: 13.4208,
      longitude: 103.9,
      yearBuilt: 961,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG/1280px-Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG/1280px-Pre_Rup%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_13.JPG",
      ],
      provinceId: siemReap.id,
      kingId: rajendravarman.id,
      styleId: preRupStyle.id,
      eraId: angkorian.id,
    },
  });

  // 11. Phnom Bakheng
  await prisma.temple.upsert({
    where: { slug: "phnom-bakheng" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg/1280px-Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg/1280px-Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg"],
    },
    create: {
      slug: "phnom-bakheng",
      name: "Phnom Bakheng",
      khmerName: "ភ្នំបាខែង",
      description:
        "Perched atop a natural sandstone hill 67 metres above the Angkor plain, Phnom Bakheng is one of the oldest temples in the Angkor region. It served as the first state temple of the city of Yasodharapura and remains one of the finest spots to watch the sunset over Angkor Wat.",
      history:
        "Phnom Bakheng was built by King Yasovarman I in the late 9th century as the centrepiece of his new capital. It was designed as a symbolic representation of Mount Meru, the cosmic mountain at the centre of the universe in Hindu cosmology. The temple originally held 108 towers arranged on five terraces. Over the centuries it was occupied by various kings and later transformed into a Buddhist site.",
      latitude: 13.4126,
      longitude: 103.8592,
      yearBuilt: 889,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg/1280px-Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg/1280px-Phnom_Bakheng_temple_at_Angkor%2C_Cambodia.jpg",
      ],
      provinceId: siemReap.id,
      kingId: yasovarman1.id,
      styleId: bakhengStyle.id,
      eraId: angkorian.id,
    },
  });

  // 12. Ta Keo
  await prisma.temple.upsert({
    where: { slug: "ta-keo" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ta_Keo_Temple_%28I%29.jpg/1280px-Ta_Keo_Temple_%28I%29.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ta_Keo_Temple_%28I%29.jpg/1280px-Ta_Keo_Temple_%28I%29.jpg"],
    },
    create: {
      slug: "ta-keo",
      name: "Ta Keo",
      khmerName: "ប្រាសាទតាកែវ",
      description:
        "Ta Keo is notable for being the first Angkorian temple built entirely from sandstone and for remaining permanently unfinished — its towers bear no decorative carvings. This gives it a stark, monumental quality quite unlike any other temple at Angkor. It rises steeply in five tiers and commands a powerful presence on the plain.",
      history:
        "Construction of Ta Keo was begun by Jayavarman V around 975 CE but was never completed, possibly due to the king's death or a lightning strike during consecration (an ill omen in Khmer belief). It is the earliest example of a fully sandstone Angkorian temple, marking a key transition in construction techniques. The steep stairs and unadorned surfaces give it a very different atmosphere from the later, more ornate temples.",
      latitude: 13.4358,
      longitude: 103.878,
      yearBuilt: 975,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ta_Keo_Temple_%28I%29.jpg/1280px-Ta_Keo_Temple_%28I%29.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ta_Keo_Temple_%28I%29.jpg/1280px-Ta_Keo_Temple_%28I%29.jpg",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman5.id,
      styleId: kohKerStyle.id,
      eraId: angkorian.id,
    },
  });

  // 13. Lolei
  await prisma.temple.upsert({
    where: { slug: "lolei" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lolei1.JPG/1280px-Lolei1.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lolei1.JPG/1280px-Lolei1.JPG"],
    },
    create: {
      slug: "lolei",
      name: "Lolei",
      khmerName: "ប្រាសាទឡូឡៃ",
      description:
        "One of the three temples of the Roluos Group — the earliest standing monument group in Angkor — Lolei originally sat on an island in the middle of a large reservoir. Its four brick towers are dedicated to the ancestors of King Yasovarman I and feature some of the finest early Khmer stone inscriptions.",
      history:
        "Built in 893 CE by King Yasovarman I on an artificial island in the Indratataka Baray (built by his father Indravarman I), Lolei was dedicated to the king's parents and grandparents. The four towers, arranged in a 2×2 grid, are now in a precarious state but still display elegant brick carvings and Sanskrit inscriptions. A modern Buddhist pagoda operates on the site today.",
      latitude: 13.358,
      longitude: 103.8541,
      yearBuilt: 893,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lolei1.JPG/1280px-Lolei1.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lolei1.JPG/1280px-Lolei1.JPG",
      ],
      provinceId: siemReap.id,
      kingId: yasovarman1.id,
      styleId: rolousStyle.id,
      eraId: angkorian.id,
    },
  });

  // 14. Preah Ko
  await prisma.temple.upsert({
    where: { slug: "preah-ko" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Preah_Ko_1.jpg/1280px-Preah_Ko_1.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Preah_Ko_1.jpg/1280px-Preah_Ko_1.jpg"],
    },
    create: {
      slug: "preah-ko",
      name: "Preah Ko",
      khmerName: "ប្រាសាទព្រះគោ",
      description:
        "Meaning 'Sacred Bull', Preah Ko is the oldest temple in the Roluos Group and one of the earliest examples of Angkorian temple architecture. Named after the three white stone bulls (Nandi, the mount of Shiva) that stand before the central towers, it is remarkable for its decorative plasterwork and Sanskrit and Khmer inscriptions.",
      history:
        "Preah Ko was dedicated in 879 CE by King Indravarman I — making it one of the first major monuments of the Angkorian era. It was built to honour the deified ancestors of the king, both royal and divine. The six brick towers are arranged in two rows of three and feature elaborate carved false doors and pilasters. The site is rich in inscriptions that provide valuable historical information about the early Khmer Empire.",
      latitude: 13.3512,
      longitude: 103.855,
      yearBuilt: 879,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Preah_Ko_1.jpg/1280px-Preah_Ko_1.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Preah_Ko_1.jpg/1280px-Preah_Ko_1.jpg",
      ],
      provinceId: siemReap.id,
      kingId: indravarman1.id,
      styleId: rolousStyle.id,
      eraId: angkorian.id,
    },
  });

  // 15. Beng Mealea
  await prisma.temple.upsert({
    where: { slug: "beng-mealea" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bengmealea.jpg/1280px-Bengmealea.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bengmealea.jpg/1280px-Bengmealea.jpg"],
    },
    create: {
      slug: "beng-mealea",
      name: "Beng Mealea",
      khmerName: "ប្រាសាទបឹងមាលា",
      description:
        "One of the most dramatically ruined temples in Cambodia, Beng Mealea is a sprawling complex roughly the same footprint as Angkor Wat. Located 68 km east of Siem Reap and largely unrestored, it is a spectacular tangle of collapsed towers, jungle roots, and mossy stone galleries — an adventurer's dream.",
      history:
        "Built in the early 12th century, Beng Mealea is believed to have been one of the earliest temples in the Angkor Wat style, perhaps serving as a prototype for the great monument. The temple was dedicated to Vishnu and appears to have been constructed during the reign of Suryavarman II. Its remote location protected it from major looting but also led to centuries of abandonment and collapse.",
      latitude: 13.4672,
      longitude: 104.2308,
      yearBuilt: 1115,
      religion: "Hindu (Vaishnavite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bengmealea.jpg/1280px-Bengmealea.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bengmealea.jpg/1280px-Bengmealea.jpg",
      ],
      provinceId: siemReap.id,
      kingId: suryavarman2.id,
      styleId: angkorWatStyle.id,
      eraId: angkorian.id,
    },
  });

  // 16. Prasat Preah Vihear
  await prisma.temple.upsert({
    where: { slug: "prasat-preah-vihear" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/03_Prasat_Preah_Vihear-nX-06532.jpg/1280px-03_Prasat_Preah_Vihear-nX-06532.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/03_Prasat_Preah_Vihear-nX-06532.jpg/1280px-03_Prasat_Preah_Vihear-nX-06532.jpg"],
    },
    create: {
      slug: "prasat-preah-vihear",
      name: "Prasat Preah Vihear",
      khmerName: "ប្រាសាទព្រះវិហារ",
      description:
        "A UNESCO World Heritage Site perched dramatically on a 525-metre cliff of the Dangrek Mountains, Prasat Preah Vihear is one of the most spectacular examples of Khmer architecture. Its sequence of towers and processional causeways stretches over 800 metres along the mountain ridge, offering sweeping views over the Cambodian plain.",
      history:
        "Construction began in the 9th century and continued over several reigns, reaching its current form under Suryavarman II in the 12th century. Dedicated to Shiva, the temple's location was chosen for its proximity to the heavens. It was the subject of a long territorial dispute between Cambodia and Thailand, settled by the International Court of Justice in 1962 in Cambodia's favour. It was inscribed as a UNESCO World Heritage Site in 2008.",
      latitude: 14.3938,
      longitude: 104.6806,
      yearBuilt: 1000,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/03_Prasat_Preah_Vihear-nX-06532.jpg/1280px-03_Prasat_Preah_Vihear-nX-06532.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/03_Prasat_Preah_Vihear-nX-06532.jpg/1280px-03_Prasat_Preah_Vihear-nX-06532.jpg",
      ],
      provinceId: preahVihear.id,
      kingId: suryavarman1.id,
      styleId: preRupStyle.id,
      eraId: angkorian.id,
    },
  });

  // 17. Banteay Chhmar
  await prisma.temple.upsert({
    where: { slug: "banteay-chhmar" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Banteay_Chhmar_Temple_Entrance.JPG/1024px-Banteay_Chhmar_Temple_Entrance.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Banteay_Chhmar_Temple_Entrance.JPG/1024px-Banteay_Chhmar_Temple_Entrance.JPG"],
    },
    create: {
      slug: "banteay-chhmar",
      name: "Banteay Chhmar",
      khmerName: "ប្រាសាទបន្ទាយឆ្មារ",
      description:
        "Banteay Chhmar ('Narrow Fortress') is one of the most remarkable and least-visited temple complexes of the Jayavarman VII period. A remote gem in northwestern Cambodia, it is notable for its extraordinary bas-reliefs — including unique depictions of multi-armed bodhisattvas — and its vast surrounding moat.",
      history:
        "Built by Jayavarman VII in the late 12th to early 13th century, Banteay Chhmar was dedicated to the king's son and the four generals who died bravely in battle protecting the king. The temple complex encompasses a huge area and includes a series of gopuras with the characteristic face towers of the Bayon style. Much of the temple has collapsed or been looted, but major conservation work has been ongoing since the 2000s.",
      latitude: 14.0734,
      longitude: 103.0849,
      yearBuilt: 1195,
      religion: "Buddhist (Mahayana)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Banteay_Chhmar_Temple_Entrance.JPG/1024px-Banteay_Chhmar_Temple_Entrance.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Banteay_Chhmar_Temple_Entrance.JPG/1024px-Banteay_Chhmar_Temple_Entrance.JPG",
      ],
      provinceId: banteayMeanchey.id,
      kingId: jayavarman7.id,
      styleId: bayonStyle.id,
      eraId: angkorian.id,
    },
  });

  // 18. Sambor Prei Kuk
  await prisma.temple.upsert({
    where: { slug: "sambor-prei-kuk" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg/1280px-600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg/1280px-600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg"],
    },
    create: {
      slug: "sambor-prei-kuk",
      name: "Sambor Prei Kuk",
      khmerName: "ប្រាសាទសំបូរព្រៃគុក",
      description:
        "A UNESCO World Heritage Site and the earliest large Khmer temple complex, Sambor Prei Kuk ('Temple in the Richness of the Forest') predates Angkor by several centuries. Its brick towers, set among ancient trees in a remote forest, represent the flowering of the Chenla period and laid the architectural foundation for all later Khmer temple construction.",
      history:
        "Built by King Isanavarman I in the early 7th century as the capital city of Isanapura, Sambor Prei Kuk comprises over 100 brick towers across three main groups. Its octagonal towers are a unique stylistic feature seen nowhere else. The complex includes temples to both Shiva and Vishnu and demonstrates the sophisticated urban planning and religious culture of Pre-Angkorian Cambodia. It was inscribed as a UNESCO World Heritage Site in 2017.",
      latitude: 12.8383,
      longitude: 104.9904,
      yearBuilt: 616,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg/1280px-600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg/1280px-600_CE_Ashram_Maha_Rishi_Hindu_temple%2C_N17_Kuk_Vihear_Prasat_Asram_Maha_Rusei%2C_Sambour_Kuk_Cambodia_01.jpg",
      ],
      provinceId: kampongThom.id,
      kingId: isanavarman1.id,
      styleId: samborStyle.id,
      eraId: preAngkorian.id,
    },
  });

  // 19. Prasat Kravan
  await prisma.temple.upsert({
    where: { slug: "prasat-kravan" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG/1280px-Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG/1280px-Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG"],
    },
    create: {
      slug: "prasat-kravan",
      name: "Prasat Kravan",
      khmerName: "ប្រាសាទក្រវាន់",
      description:
        "Prasat Kravan ('Cardamom Sanctuary') is a small but extraordinary Hindu temple consisting of five brick towers in a row. What makes it uniquely special is the interior: three of the towers contain rare, large-scale bas-reliefs of Vishnu and Lakshmi carved directly into the brick — the only such examples in Khmer art.",
      history:
        "Consecrated in 921 CE, Prasat Kravan was dedicated to Vishnu and built not by a king but by high officials of the royal court. It underwent extensive French Colonial-era restoration in the 1960s. The bas-reliefs inside the towers depict Vishnu with his characteristic four arms striding across the cosmos, and Lakshmi in a posture of intercession — scenes of extraordinary artistry and theological significance.",
      latitude: 13.426,
      longitude: 103.891,
      yearBuilt: 921,
      religion: "Hindu (Vaishnavite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG/1280px-Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG/1280px-Prasat_Kravan%2C_Angkor%2C_Camboya%2C_2013-08-16%2C_DD_05.JPG",
      ],
      provinceId: siemReap.id,
      kingId: jayavarman4.id,
      styleId: preRupStyle.id,
      eraId: angkorian.id,
    },
  });

  // 20. Eastern Mebon
  await prisma.temple.upsert({
    where: { slug: "eastern-mebon" },
    update: {
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG/1280px-Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG",
      galleryImages: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG/1280px-Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG"],
    },
    create: {
      slug: "eastern-mebon",
      name: "Eastern Mebon",
      khmerName: "ប្រាសាទមេបូនខាងកើត",
      description:
        "Originally built on an island in the middle of the East Baray (a vast royal reservoir now dry), the Eastern Mebon is a striking five-tower temple mountain. Four stone elephants guard each corner of its three tiers, and the complex is renowned for its exceptionally well-preserved towers and detailed decorative carving.",
      history:
        "Built by King Rajendravarman II in 952 CE, the Eastern Mebon was dedicated to his parents and to Shiva. It stands at the exact centre of the East Baray, a massive reservoir 7 km by 1.8 km in size. The temple was accessed by boat when the baray was full. Its corner elephants are among the best-preserved stone sculptures in Angkor, and the brick towers still bear much of their original decorative plasterwork.",
      latitude: 13.4327,
      longitude: 103.9,
      yearBuilt: 952,
      religion: "Hindu (Shaivite)",
      featuredImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG/1280px-Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG",
      galleryImages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG/1280px-Mebon_Oriental%2C_Angkor%2C_Camboya%2C_2013-08-17%2C_DD_05.JPG",
      ],
      provinceId: siemReap.id,
      kingId: rajendravarman.id,
      styleId: preRupStyle.id,
      eraId: angkorian.id,
    },
  });

  console.log("✅ All 20 temples seeded");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
