"use client";

import { useEffect, useState } from "react";
import type { HistorialResponseDTO } from "@/types/historial";

/**
 * Hook para consumir el historial de auditoría con paginación.
 * Devuelve items, loading, error y controles de página/límite.
 */
export function useHistorial({ limit: initialLimit = 20 }: { limit?: number }) {
  const [items, setItems] = useState<HistorialResponseDTO["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit); // 👈 ahora es estado

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/historial?page=${page}&limit=${limit}`);
        const json = await res.json();

        if (json.error) {
          setError(json.error);
          setItems([]);
        } else {
          setItems(json.data.items);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit]);

  return {
    items,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit: (l: number) => {
      setLimit(l);   // 👈 ahora sí cambia el límite
      setPage(1);    // 👈 y resetea a la primera página
    },
  };
}
