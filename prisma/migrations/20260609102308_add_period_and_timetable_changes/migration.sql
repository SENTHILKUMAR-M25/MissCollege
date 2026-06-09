-- DropIndex
DROP INDEX "Timetable_classroom_dayOfWeek_startTime_idx";

-- DropIndex
DROP INDEX "Timetable_facultyId_dayOfWeek_startTime_idx";

-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "periodNumber" INTEGER;

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Period_periodNumber_key" ON "Period"("periodNumber");

-- CreateIndex
CREATE INDEX "Period_periodNumber_idx" ON "Period"("periodNumber");

-- CreateIndex
CREATE INDEX "Timetable_facultyId_dayOfWeek_periodNumber_idx" ON "Timetable"("facultyId", "dayOfWeek", "periodNumber");

-- CreateIndex
CREATE INDEX "Timetable_classroom_dayOfWeek_periodNumber_idx" ON "Timetable"("classroom", "dayOfWeek", "periodNumber");

-- CreateIndex
CREATE INDEX "Timetable_departmentId_courseId_semester_section_idx" ON "Timetable"("departmentId", "courseId", "semester", "section");

-- CreateIndex
CREATE INDEX "Timetable_className_section_dayOfWeek_periodNumber_idx" ON "Timetable"("className", "section", "dayOfWeek", "periodNumber");

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
