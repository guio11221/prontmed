-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferences" TEXT DEFAULT '{"theme":"serious","density":"comfortable","widgets":["stats","waiting_room","next_patient"]}';
