// app/components/tabl/Table.tsx
import React from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  wrapperRef?: React.Ref<HTMLDivElement>;
  selectedId?: number | null;   // ✅ nombre unificado
}

export default function Table({ columns, data, onRowClick, wrapperRef, selectedId }: TableProps) {
  return (
    <div className="table-wrapper" ref={wrapperRef}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ minWidth: col.width || 'auto' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(row)}
              className={`${selectedId === row.id ? "selected-row" : ""} ${row.pending ? "pending-row" : ""}`}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              aria-selected={selectedId === row.id}   // ✅ accesibilidad
            >
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
