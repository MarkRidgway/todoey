-- CreateEnum
CREATE TYPE "View" AS ENUM ('LIST', 'KANBAN', 'GRID', 'MATRIX');

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListSettings" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "enabledViews" "View"[] NOT NULL DEFAULT ARRAY['LIST', 'KANBAN', 'GRID', 'MATRIX']::"View"[],

    CONSTRAINT "ListSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListSettings_listId_key" ON "ListSettings"("listId");

-- AddForeignKey
ALTER TABLE "ListSettings" ADD CONSTRAINT "ListSettings_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "Todo_status_idx";

-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN "listId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "listId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Todo_listId_idx" ON "Todo"("listId");

-- CreateIndex
CREATE INDEX "Todo_listId_status_idx" ON "Todo"("listId", "status");

-- CreateIndex
CREATE INDEX "Tag_listId_idx" ON "Tag"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_listId_name_key" ON "Tag"("listId", "name");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
