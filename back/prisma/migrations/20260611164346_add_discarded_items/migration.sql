-- CreateTable
CREATE TABLE "DiscardedItem" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "discardedBy" TEXT,
    "discardDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscardedItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscardedItem" ADD CONSTRAINT "DiscardedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
