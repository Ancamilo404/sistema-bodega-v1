import { useState, useEffect } from "react";

export function useVentas(clienteId: number | null, pageSize: number = 20) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (pageNum: number) => {
    if (!clienteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clienteId}/ventas?page=${pageNum}&limit=${pageSize}`);
      const json = await res.json();
      setItems(prev => pageNum === 1 ? json.data.items : [...prev, ...json.data.items]);
      setTotal(json.data.total);
      setPage(pageNum);
    } catch (err) {
      console.error("Error cargando ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ARREGLADO: Resetear items cuando cambia el cliente
  useEffect(() => {
    if (clienteId) {
      setItems([]);     // ⬅️ Limpiar ventas anteriores
      setPage(1);       // ⬅️ Resetear página
      fetchPage(1);
    }
  }, [clienteId]);

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