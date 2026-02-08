import { prisma } from "@/lib/db";
import { getNextCallDate } from "@/lib/fortnightly";
import { StudentStatus } from "@prisma/client";

interface AssignmentResult {
  slotInstanceId: string;
  weekNumber: 1 | 2;
  groupCode: string;
  firstCallDate: Date;
}

/**
 * Auto-assign a student to the best available SlotInstance for a given Slot.
 *
 * Logic:
 * 1. Fetch both Week 1 and Week 2 instances for the slot
 * 2. Count current students in each (only SLOT_SELECTED or ACTIVE)
 * 3. Fetch global capacity from Settings
 * 4. If both full → throw error
 * 5. If one is full → assign to the other
 * 6. If both have space → assign to the less-full one
 * 7. If equal count → assign to the one with the earlier next call date
 */
export async function assignStudentToSlot(
  slotId: string
): Promise<AssignmentResult> {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new Error("Settings not found. Please run the seed script.");
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: {
      instances: {
        include: {
          students: {
            where: {
              status: { in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE] },
            },
          },
        },
      },
    },
  });

  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  const week1Instance = slot.instances.find((i) => i.weekNumber === 1);
  const week2Instance = slot.instances.find((i) => i.weekNumber === 2);

  if (!week1Instance || !week2Instance) {
    throw new Error(`Slot ${slotId} is missing one or both week instances`);
  }

  const week1Count = week1Instance.students.length;
  const week2Count = week2Instance.students.length;
  const capacity = settings.capacity;

  const week1Full = week1Count >= capacity;
  const week2Full = week2Count >= capacity;

  if (week1Full && week2Full) {
    throw new Error(`Slot ${slotId} is fully booked in both weeks`);
  }

  let chosen: typeof week1Instance;

  if (week1Full) {
    chosen = week2Instance;
  } else if (week2Full) {
    chosen = week1Instance;
  } else if (week1Count < week2Count) {
    chosen = week1Instance;
  } else if (week2Count < week1Count) {
    chosen = week2Instance;
  } else {
    // Equal count — pick the one with the earlier next call date
    const week1NextCall = getNextCallDate(
      slot.dayOfWeek,
      slot.time,
      1,
      new Date(),
      settings.anchorDate
    );
    const week2NextCall = getNextCallDate(
      slot.dayOfWeek,
      slot.time,
      2,
      new Date(),
      settings.anchorDate
    );
    chosen = week1NextCall <= week2NextCall ? week1Instance : week2Instance;
  }

  const weekNumber = chosen.weekNumber as 1 | 2;
  const firstCallDate = getNextCallDate(
    slot.dayOfWeek,
    slot.time,
    weekNumber,
    new Date(),
    settings.anchorDate
  );

  return {
    slotInstanceId: chosen.id,
    weekNumber,
    groupCode: chosen.groupCode,
    firstCallDate,
  };
}
