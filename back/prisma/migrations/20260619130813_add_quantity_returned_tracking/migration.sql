-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "quantityReturned" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "origemPeca" TEXT NOT NULL DEFAULT 'NOVA';
