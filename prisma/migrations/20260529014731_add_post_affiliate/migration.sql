-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "affiliateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affiliateRate" INTEGER NOT NULL DEFAULT 20;
