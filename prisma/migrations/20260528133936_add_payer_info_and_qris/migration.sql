-- AlterTable
ALTER TABLE "FilePurchase" ADD COLUMN     "payerName" TEXT,
ADD COLUMN     "payerWa" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "payerName" TEXT,
ADD COLUMN     "payerWa" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "qrisImage" TEXT;
