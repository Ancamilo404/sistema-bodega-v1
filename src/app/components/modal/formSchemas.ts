// src/app/components/modal/formSchemas.ts
export const formSchemas = {
  cliente: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "tipoId", label: "Tipo Documento", type: "select", options: ["...","CC","TI","CE","PASAPORTE","NIT"], required: true },
    { name: "documento", label: "Documento", type: "text", required: true },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "estado", label: "Estado", type: "select", options: ["...","ACTIVO","BLOQUEADO"], required: true },
  ],
  aliado: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "tipoId", label: "Tipo Documento", type: "select", options: ["...","CC","TI","CE","PASAPORTE","NIT"], required: true },
    { name: "documento", label: "Documento", type: "text", required: true },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "correo", label: "Correo", type: "email" },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "imagen", label: "Imagen", type: "image", help: "Puedes pegar una URL o subir un archivo" }, // ⬅️ NUEVO tipo especial
    { name: "estado", label: "Estado", type: "select", options: ["...","ACTIVO","BLOQUEADO"], required: true },
  ],
  usuario: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "tipoId", label: "Tipo Documento", type: "select", options: ["...","CC","TI","CE","PASAPORTE","NIT"], required: true },
    { name: "documento", label: "Número de Documento", type: "text", required: true },
    { name: "correo", label: "Correo", type: "email", required: true },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "rol", label: "Rol", type: "select", options: ["...","ADMIN","TRABAJADOR","USUARIO"], required: true },
    { name: "estado", label: "Estado", type: "select", options: ["...","ACTIVO","BLOQUEADO"], required: true },
    { name: "password", label: "Contraseña", type: "password" }, // opcional
  ],


  // ✅ NUEVO: Producto
  producto: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "descripcion", label: "Descripción", type: "text" },
    { name: "precio", label: "Precio", type: "number", required: true, step: "0.01" },
    { name: "stock", label: "Stock", type: "number", required: true },
    { name: "categoria", label: "Categoría", type: "text" },
    { name: "unidad", label: "Unidad", type: "select", options: ["...","kg","unidad","caja","litro","metro"], required: false },
    { name: "imagen", label: "Imagen", type: "image", help: "Puedes pegar una URL o subir un archivo" },
    { name: "aliadoId", label: "Aliado", type: "select-async", endpoint: "/api/aliados", required: false },
    { name: "estado", label: "Estado", type: "select", options: ["...","ACTIVO","BLOQUEADO"], required: true },
  ],

  // ✅ NUEVO: Venta (simplificado - para crear venta EN_PROCESO)
  venta: [
    { name: "clienteId", label: "Cliente", type: "select-async", endpoint: "/api/clientes", required: true },
    { name: "metodoPago", label: "Método de Pago", type: "select", options: ["...","EFECTIVO","TARJETA","TRANSFERENCIA","OTRO"], required: true },
    { name: "observaciones", label: "Observaciones", type: "text" },
    { name: "impuesto", label: "Impuesto", type: "number", step: "0.01" },
    { name: "descuento", label: "Descuento", type: "number", step: "0.01" },
  ],
};