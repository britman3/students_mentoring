-- AlterEnum: Add CUSTOM to PaymentPlan
ALTER TYPE "PaymentPlan" ADD VALUE 'CUSTOM';

-- AlterEnum: Add PAYPAL to PaymentMethod
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYPAL';

-- AlterEnum: Add SALE_DATA_SYNCED to ActivityType
ALTER TYPE "ActivityType" ADD VALUE 'SALE_DATA_SYNCED';

-- AlterTable: Add studentNumber to Student
ALTER TABLE "Student" ADD COLUMN "studentNumber" TEXT;

-- CreateIndex: Unique constraint on Student.studentNumber
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

-- AlterTable: Make Closer.email nullable
ALTER TABLE "Closer" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable: Make Payment.method nullable, add instalment fields
ALTER TABLE "Payment" ALTER COLUMN "method" DROP NOT NULL;
ALTER TABLE "Payment" ADD COLUMN "instalmentNumber" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "totalInstalments" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "notes" TEXT;

-- CreateIndex: Unique constraint on Payment(studentId, instalmentNumber)
CREATE UNIQUE INDEX "Payment_studentId_instalmentNumber_key" ON "Payment"("studentId", "instalmentNumber");
