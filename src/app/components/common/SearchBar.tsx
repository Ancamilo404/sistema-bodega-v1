"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface SearchBarProps {
  module: "clientes" | "productos" | "aliados" | "usuarios" | "ventas" | "historial";
  placeholder?: string;
  buttonText?: string;
  onResults: (data: any[]) => void;
  onClear?: () => void; // ✅ callback para reactivar polling
}

export default function SearchBar({
  module,
  placeholder = "Buscar",
  buttonText = "Buscar",
  onResults,
  onClear,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const endpoints: Record<SearchBarProps["module"], string> = {
    clientes: "/api/clientes",
    productos: "/api/productos",
    aliados: "/api/aliados",
    usuarios: "/api/usuarios",
    ventas: "/api/ventas",
    historial: "/api/historial",
  };

  const handleSearch = async () => {
    // ⛔ Si está vacío o solo espacios, no hacer nada
    if (!query.trim()) {
      return; // el polling sigue activo, no se limpia nada
    }

    setLoading(true);
    try {
      const res = await fetch(`${endpoints[module]}?search=${encodeURIComponent(query.trim())}`);
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Error en búsqueda");
        return; // ⛔ corta aquí si el backend devuelve error
      }

      // ✅ Si todo va bien, actualiza resultados
      onResults(json.data || []);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);

          // 🔹 Si el input queda vacío, limpia resultados y reactiva polling
          if (value.trim() === "") {
            onResults([]);
            if (onClear) onClear();
          }
        }}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || `Buscar ${module}...`}
        className="input-search"
        disabled={loading}
      />
      <button onClick={handleSearch} className="btn-search" disabled={loading}>
        {loading ? <span className="spinner-inline">⏳ Buscando...</span> : buttonText}
      </button>
    </div>
  );
}
