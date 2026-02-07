import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default settings
  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      globalCapacity: 4,
      week1AnchorDate: new Date("2026-01-19T00:00:00.000Z"),
      showGroupLabels: true,
    },
  });

  // Define the 4 slots
  const slots = [
    { day: "Monday", time: "16:00" },
    { day: "Tuesday", time: "16:00" },
    { day: "Wednesday", time: "16:00" },
    { day: "Thursday", time: "16:00" },
  ];

  for (const slotData of slots) {
    const slot = await prisma.slot.upsert({
      where: { day_time: { day: slotData.day, time: slotData.time } },
      update: {},
      create: {
        day: slotData.day,
        time: slotData.time,
        capacity: 4,
        isOpen: true,
      },
    });

    // Create week 1 and week 2 instances
    for (const week of [1, 2]) {
      const label = `${slotData.day} ${slotData.time.replace(":00", "")}:00 - Week ${week}`;
      const startDate = new Date("2026-01-19T00:00:00.000Z");
      if (week === 2) {
        startDate.setDate(startDate.getDate() + 7);
      }

      await prisma.slotInstance.upsert({
        where: { slotId_weekNumber: { slotId: slot.id, weekNumber: week } },
        update: {},
        create: {
          slotId: slot.id,
          weekNumber: week,
          groupLabel: label,
          startDate,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
