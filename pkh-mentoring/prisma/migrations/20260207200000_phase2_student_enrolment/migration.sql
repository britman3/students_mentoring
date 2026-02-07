-- Phase 2: Student enrolment flow schema changes

-- Add OPENED and COMPLETED to MagicLinkStatus enum
ALTER TYPE "MagicLinkStatus" ADD VALUE 'OPENED';
ALTER TYPE "MagicLinkStatus" ADD VALUE 'COMPLETED';

-- Add SLOT_ASSIGNED to ActivityType enum
ALTER TYPE "ActivityType" ADD VALUE 'SLOT_ASSIGNED';

-- Add expiresAt to WaitlistEntry
ALTER TABLE "WaitlistEntry" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Add zoomLink to Slot
ALTER TABLE "Slot" ADD COLUMN "zoomLink" TEXT;
