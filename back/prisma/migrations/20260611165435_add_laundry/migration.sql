-- CreateTable
CREATE TABLE "LaundryRecord" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENVIADA',
    "sendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturn" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "laundryName" TEXT,
    "sentBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaundryRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LaundryRecord" ADD CONSTRAINT "LaundryRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
