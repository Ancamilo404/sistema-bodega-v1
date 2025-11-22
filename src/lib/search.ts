type SearchConfig = {
  table: string;              // Ej: "Cliente"
  fullTextColumns: string[];  // Ej: ["nombre", "documento", "direccion", "telefono"]
  fallbackColumns?: string[]; // Ej: ["id", "tipoId", "fechaRegistro", "estado"]
};

export function buildSearchQuery(config: SearchConfig, searchParam: string) {
  const { table, fullTextColumns, fallbackColumns = [] } = config;

  // Construir el vector para full-text
  const vector = fullTextColumns
    .map(col => `coalesce("${col}", '')`)
    .join(` || ' ' || `);

  // Condición full-text
  let where = `
    to_tsvector('spanish', ${vector}) @@ plainto_tsquery('spanish', $1)
  `;

  // Condiciones fallback con ILIKE
  for (const col of fallbackColumns) {
    where += ` OR CAST("${col}" AS TEXT) ILIKE '%' || $1 || '%'`;
  }

  // Query final
  return `
    SELECT *,
      ts_rank(
        to_tsvector('spanish', ${vector}),
        plainto_tsquery('spanish', $1)
      ) AS rank
    FROM "${table}"
    WHERE (${where})
    ORDER BY rank DESC;
  `;
}
