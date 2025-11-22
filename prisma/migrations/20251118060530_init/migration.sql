-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'TRABAJADOR', 'USUARIO');

-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('EN_PROCESO', 'CONFIRMADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoRegistro" AS ENUM ('ACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'TI', 'CE', 'PASAPORTE', 'NIT');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoId" "TipoDocumento" NOT NULL,
    "documento" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoRegistro" NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aliado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoId" "TipoDocumento" NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "imagen" TEXT,
    "deletedAt" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoRegistro" NOT NULL,

    CONSTRAINT "Aliado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoId" "TipoDocumento" NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL,
    "password" TEXT,
    "estado" "EstadoRegistro" NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "unidad" TEXT,
    "imagen" TEXT,
    "deletedAt" TIMESTAMP(3),
    "estado" "EstadoRegistro" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "aliadoId" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "referencia" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'EN_PROCESO',
    "metodoPago" "MetodoPago" NOT NULL,
    "observaciones" TEXT,
    "impuesto" DECIMAL(10,2),
    "descuento" DECIMAL(10,2),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2),
    "iva" DECIMAL(10,2),
    "observaciones" TEXT,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historial" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoAccion" NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT,
    "entidadId" INTEGER,
    "detalle" TEXT,
    "ip" TEXT,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Aliado_documento_key" ON "Aliado"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_documento_key" ON "Usuario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_referencia_key" ON "Venta"("referencia");

-- CreateIndex
CREATE INDEX "Historial_entidad_entidadId_idx" ON "Historial"("entidad", "entidadId");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_aliadoId_fkey" FOREIGN KEY ("aliadoId") REFERENCES "Aliado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
