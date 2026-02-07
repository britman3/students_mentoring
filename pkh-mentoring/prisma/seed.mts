import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const WEEK1_LABELS = ["A", "B", "C", "D"];
const WEEK2_LABELS = ["M", "N", "O", "P"];

const SLOTS = [
  { dayOfWeek: 2, time: "12:00", sortOrder: 1 }, // Tuesday 12pm
  { dayOfWeek: 2, time: "16:00", sortOrder: 2 }, // Tuesday 4pm
  { dayOfWeek: 3, time: "12:00", sortOrder: 3 }, // Wednesday 12pm
  { dayOfWeek: 3, time: "16:00", sortOrder: 4 }, // Wednesday 4pm
];

async function main() {
  console.log("Seeding database...");

  // 1. Create default Settings
  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        capacity: 12,
        anchorDate: new Date("2026-01-06T00:00:00.000Z"),
        showGroupLabels: false,
        adminPasswordHash: hashSync("changeme", 10),
      },
    });
    console.log("  Created default Settings");
  } else {
    console.log("  Settings already exist, skipping");
  }

  // 2. Create slots and slot instances
  for (const slotDef of SLOTS) {
    const existing = await prisma.slot.findUnique({
      where: {
        dayOfWeek_time: {
          dayOfWeek: slotDef.dayOfWeek,
          time: slotDef.time,
        },
      },
    });

    if (existing) {
      console.log(`  Slot ${slotDef.dayOfWeek}/${slotDef.time} already exists, skipping`);
      continue;
    }

    const slot = await prisma.slot.create({
      data: {
        dayOfWeek: slotDef.dayOfWeek,
        time: slotDef.time,
        sortOrder: slotDef.sortOrder,
      },
    });

    const labelIndex = slotDef.sortOrder - 1;

    // Week 1 instance
    await prisma.slotInstance.create({
      data: {
        slotId: slot.id,
        weekNumber: 1,
        groupLabel: WEEK1_LABELS[labelIndex],
      },
    });

    // Week 2 instance
    await prisma.slotInstance.create({
      data: {
        slotId: slot.id,
        weekNumber: 2,
        groupLabel: WEEK2_LABELS[labelIndex],
      },
    });

    const dayName = slotDef.dayOfWeek === 2 ? "Tuesday" : "Wednesday";
    console.log(
      `  Created Slot: ${dayName} ${slotDef.time} with instances ${WEEK1_LABELS[labelIndex]} (W1) / ${WEEK2_LABELS[labelIndex]} (W2)`
    );
  }

  // 3. Create default Programme
  const existingProgramme = await prisma.programme.findFirst({
    where: { name: "Property Wholesaling Mastery" },
  });
  if (!existingProgramme) {
    await prisma.programme.create({
      data: {
        name: "Property Wholesaling Mastery",
        isActive: true,
      },
    });
    console.log("  Created Programme: Property Wholesaling Mastery");
  } else {
    console.log("  Programme already exists, skipping");
  }

  // 4. Generate 10 test magic links
  const existingLinks = await prisma.magicLink.count();
  if (existingLinks === 0) {
    for (let i = 0; i < 10; i++) {
      await prisma.magicLink.create({
        data: {
          token: nanoid(21),
          status: "UNUSED",
        },
      });
    }
    console.log("  Created 10 test magic links");
  } else {
    console.log(`  ${existingLinks} magic links already exist, skipping`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
