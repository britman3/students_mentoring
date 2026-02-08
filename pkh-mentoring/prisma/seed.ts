import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Settings row
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      capacity: 12,
      anchorDate: new Date("2026-01-06T00:00:00.000Z"),
      showGroupCodes: false,
      adminPasswordHash: hashSync(adminPassword, 10),
    },
  });
  console.log("  Created Settings (id: 1)");

  // 2. Create 4 slots with correct gridPositions
  const slots = [
    { dayOfWeek: 3, time: "12:00", gridPosition: 5, sortOrder: 1, displayName: "Wednesday 12pm", w1Code: "W1E", w2Code: "W2Q" },
    { dayOfWeek: 3, time: "16:00", gridPosition: 7, sortOrder: 2, displayName: "Wednesday 4pm", w1Code: "W1G", w2Code: "W2S" },
    { dayOfWeek: 4, time: "12:00", gridPosition: 9, sortOrder: 3, displayName: "Thursday 12pm", w1Code: "W1I", w2Code: "W2U" },
    { dayOfWeek: 4, time: "16:00", gridPosition: 11, sortOrder: 4, displayName: "Thursday 4pm", w1Code: "W1K", w2Code: "W2W" },
  ];

  for (const slotDef of slots) {
    const slot = await prisma.slot.upsert({
      where: {
        dayOfWeek_time: {
          dayOfWeek: slotDef.dayOfWeek,
          time: slotDef.time,
        },
      },
      update: {},
      create: {
        dayOfWeek: slotDef.dayOfWeek,
        time: slotDef.time,
        gridPosition: slotDef.gridPosition,
        sortOrder: slotDef.sortOrder,
        displayName: slotDef.displayName,
      },
    });

    // Week 1 instance
    await prisma.slotInstance.upsert({
      where: {
        slotId_weekNumber: {
          slotId: slot.id,
          weekNumber: 1,
        },
      },
      update: {},
      create: {
        slotId: slot.id,
        weekNumber: 1,
        groupCode: slotDef.w1Code,
      },
    });

    // Week 2 instance
    await prisma.slotInstance.upsert({
      where: {
        slotId_weekNumber: {
          slotId: slot.id,
          weekNumber: 2,
        },
      },
      update: {},
      create: {
        slotId: slot.id,
        weekNumber: 2,
        groupCode: slotDef.w2Code,
      },
    });

    console.log(`  Created Slot: ${slotDef.displayName} with instances ${slotDef.w1Code} (W1) / ${slotDef.w2Code} (W2)`);
  }

  // 3. Create Programme
  await prisma.programme.upsert({
    where: { name: "Property Wholesaling Mastery" },
    update: {},
    create: {
      name: "Property Wholesaling Mastery",
      isActive: true,
    },
  });
  console.log("  Created Programme: Property Wholesaling Mastery");

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
