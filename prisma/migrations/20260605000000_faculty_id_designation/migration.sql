ALTER TABLE "Faculty" RENAME COLUMN "employeeId" TO "facultyId";

ALTER INDEX "Faculty_employeeId_key" RENAME TO "Faculty_facultyId_key";
