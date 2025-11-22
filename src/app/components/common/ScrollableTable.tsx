"use client";
import React, { useRef, forwardRef } from "react";
import Table from "./Table";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface ScrollableTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  selectedId?: number | null;
}

const ScrollableTable = forwardRef<HTMLDivElement, ScrollableTableProps>(
  ({ columns, data, onRowClick, selectedId }, ref) => {
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    const startScroll = (amount: number) => {
      const step = () => {
        // ✅ ARREGLADO: Verificar que target existe
        const target = (ref as React.RefObject<HTMLDivElement>)?.current || tableWrapperRef.current;
        if (target) {  // ⬅️ ANTES: if (tableWrapperRef) ❌
          target.scrollLeft += amount;
          animationRef.current = requestAnimationFrame(step);
        }
      };
      animationRef.current = requestAnimationFrame(step);
    };

    const stopScroll = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    return (
      <div className="contenedor-btn-scrool">
        <button
          className="scroll-button-left"
          onMouseDown={() => startScroll(-5)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
        >
          <FaAngleLeft />
        </button>

        <button
          className="scroll-button-right"
          onMouseDown={() => startScroll(5)}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
        >
          <FaAngleRight />
        </button>

        <Table
          columns={columns}
          data={data}
          onRowClick={onRowClick}
          wrapperRef={ref || tableWrapperRef}
          selectedId={selectedId}
        />
      </div>
    );
  }
);

ScrollableTable.displayName = "ScrollableTable";

export default ScrollableTable;