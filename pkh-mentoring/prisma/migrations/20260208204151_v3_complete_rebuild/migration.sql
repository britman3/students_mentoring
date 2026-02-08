-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('PROSPECT', 'ENROLLED', 'SLOT_SELECTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('FULL', 'SPLIT_2', 'SPLIT_3', 'SPLIT_4', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'BANK_TRANSFER', 'CASH', 'PAYPAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'OFFERED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('STUDENT_CREATED', 'SLOT_SELECTED', 'SLOT_ASSIGNED', 'SLOT_REASSIGNED', 'PAYMENT_RECEIVED', 'STATUS_CHANGED', 'EMAIL_SENT', 'EMAIL_RESENT', 'NOTE_ADDED', 'WAITLIST_JOINED', 'WAITLIST_OFFERED', 'ARRANGEMENT_CREATED', 'SALE_DATA_SYNCED', 'ATTENDANCE_RECORDED');

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "anchorDate" TIMESTAMP(3) NOT NULL DEFAULT '2026-01-06 00:00:00 +00:00',
    "showGroupCodes" BOOLEAN NOT NULL DEFAULT false,
    "adminPasswordHash" TEXT NOT NULL,
    "slackWebhookUrl" TEXT,
    "resendApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "zoomLink" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "gridPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotInstance" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "groupCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "slotInstanceId" TEXT,
    "firstCallDate" TIMESTAMP(3),
    "joinCode" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'PROSPECT',
    "studentNumber" TEXT,
    "programmeName" TEXT,
    "totalAmount" DECIMAL(10,2),
    "depositAmount" DECIMAL(10,2),
    "paymentPlanType" "PaymentPlan",
    "referralSource" TEXT,
    "closerId" TEXT,
    "saleDate" TIMESTAMP(3),
    "enrolmentDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "slotInstanceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Closer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Closer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "method" "PaymentMethod",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "reference" TEXT,
    "notes" TEXT,
    "instalmentNumber" INTEGER,
    "totalInstalments" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrangement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agreedBy" TEXT,
    "agreedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdByType" TEXT,
    "closerId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slot_dayOfWeek_time_key" ON "Slot"("dayOfWeek", "time");

-- CreateIndex
CREATE UNIQUE INDEX "SlotInstance_slotId_weekNumber_key" ON "SlotInstance"("slotId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_joinCode_key" ON "Student"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

-- CreateIndex
CREATE INDEX "Attendance_studentId_accessedAt_idx" ON "Attendance"("studentId", "accessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Closer_email_key" ON "Closer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_name_key" ON "Programme"("name");

-- AddForeignKey
ALTER TABLE "SlotInstance" ADD CONSTRAINT "SlotInstance_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_slotInstanceId_fkey" FOREIGN KEY ("slotInstanceId") REFERENCES "SlotInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_closerId_fkey" FOREIGN KEY ("closerId") REFERENCES "Closer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_slotInstanceId_fkey" FOREIGN KEY ("slotInstanceId") REFERENCES "SlotInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_closerId_fkey" FOREIGN KEY ("closerId") REFERENCES "Closer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
