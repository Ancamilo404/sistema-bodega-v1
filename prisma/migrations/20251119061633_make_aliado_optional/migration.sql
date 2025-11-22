-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_aliadoId_fkey";

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "aliadoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_aliadoId_fkey" FOREIGN KEY ("aliadoId") REFERENCES "Aliado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
