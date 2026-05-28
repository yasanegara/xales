-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "discount" INTEGER;

-- AlterTable
ALTER TABLE "PostFile" ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "size" SET DEFAULT 0,
ALTER COLUMN "data" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FilePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilePurchase_orderId_key" ON "FilePurchase"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "FilePurchase_userId_fileId_key" ON "FilePurchase"("userId", "fileId");

-- AddForeignKey
ALTER TABLE "FilePurchase" ADD CONSTRAINT "FilePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePurchase" ADD CONSTRAINT "FilePurchase_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "PostFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
