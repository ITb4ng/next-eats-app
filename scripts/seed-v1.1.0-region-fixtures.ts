import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

interface RegionFixtureStore {
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  acceptsPaySupport: boolean;
  foodCertifyName?: string;
  storeType?: string;
  phone?: string;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const fixturePath = path.join(
  process.cwd(),
  "prisma",
  "fixtures",
  "v1.1.0-region-filter-stores.json"
);

async function loadFixtures() {
  const raw = await readFile(fixturePath, "utf-8");
  return JSON.parse(raw) as RegionFixtureStore[];
}

async function main() {
  const fixtures = await loadFixtures();
  let created = 0;
  let updated = 0;

  for (const fixture of fixtures) {
    const existingStore = await prisma.store.findFirst({
      where: {
        name: fixture.name,
        address: fixture.address,
      },
      select: {
        id: true,
      },
    });

    const data = {
      name: fixture.name,
      category: fixture.category,
      address: fixture.address,
      lat: fixture.lat,
      lng: fixture.lng,
      acceptsPaySupport: fixture.acceptsPaySupport,
      foodCertifyName: fixture.foodCertifyName ?? "안심식당",
      storeType: fixture.storeType ?? "일반음식점",
      phone: fixture.phone ?? null,
    };

    if (existingStore) {
      await prisma.store.update({
        where: { id: existingStore.id },
        data,
      });
      updated += 1;
      continue;
    }

    await prisma.store.create({ data });
    created += 1;
  }

  console.log(
    `v1.1.0 region fixtures imported. created=${created}, updated=${updated}, total=${fixtures.length}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
