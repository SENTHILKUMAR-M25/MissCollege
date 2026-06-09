-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'HOD';

-- AlterTable
ALTER TABLE "Faculty" ADD COLUMN     "aadharCardUrl" TEXT,
ADD COLUMN     "accountStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "alternateNumber" TEXT,
ADD COLUMN     "appointmentOrderUrl" TEXT,
ADD COLUMN     "assignedSections" TEXT,
ADD COLUMN     "assignedSemesters" TEXT,
ADD COLUMN     "bankDetailsUrl" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "eduCertificatesUrl" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "experienceCertificatesUrl" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "idCardUrl" TEXT,
ADD COLUMN     "isHod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "joiningLetterUrl" TEXT,
ADD COLUMN     "panCardUrl" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "relievingLetterUrl" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "specialization" TEXT;

-- CreateTable
CREATE TABLE "HodAssignment" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "removalReason" TEXT,

    CONSTRAINT "HodAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "subjectId" TEXT,
    "className" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classroom" TEXT NOT NULL,
    "semester" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HodAssignment_facultyId_idx" ON "HodAssignment"("facultyId");

-- CreateIndex
CREATE INDEX "HodAssignment_departmentId_idx" ON "HodAssignment"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_active_hod_per_dept" ON "HodAssignment"("departmentId", "isActive");

-- CreateIndex
CREATE INDEX "Timetable_facultyId_dayOfWeek_startTime_idx" ON "Timetable"("facultyId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "Timetable_classroom_dayOfWeek_startTime_idx" ON "Timetable"("classroom", "dayOfWeek", "startTime");

-- AddForeignKey
ALTER TABLE "HodAssignment" ADD CONSTRAINT "HodAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HodAssignment" ADD CONSTRAINT "HodAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
