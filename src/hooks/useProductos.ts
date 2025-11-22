import { useState, useEffect } from "react";

export function useProductos(aliadoId: number | null, pageSize: number = 20) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (pageNum: number) => {
    if (!aliadoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/aliados/${aliadoId}/productos?page=${pageNum}&limit=${pageSize}`);
      const json = await res.json();
      setItems(prev => pageNum === 1 ? json.data.items : [...prev, ...json.data.items]);
      setTotal(json.data.total);
      setPage(pageNum);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ARREGLADO: Resetear items cuando cambia el aliado
  useEffect(() => {
    if (aliadoId) {
      setItems([]);     // ⬅️ Limpiar productos anteriores
      setPage(1);       // ⬅️ Resetear página
      fetchPage(1);
    }
  }, [aliadoId]);

  return {
    items,
    total,
    page,
    loading,
    fetchNext: () => fetchPage(page + 1),
    reset: () => {
      setItems([]);
      fetchPage(1);
    },
  };
}