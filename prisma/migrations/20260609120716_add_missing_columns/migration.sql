-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "allowResubmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "maxResubmissions" INTEGER DEFAULT 1,
ADD COLUMN     "plagiarismCheck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "semester" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "plagiarismScore" DOUBLE PRECISION,
ADD COLUMN     "resubmissionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUBMITTED';
