// src/app/components/modal/ModalBase.tsx
"use client";
import React from "react";

interface ModalBaseProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function ModalBase({ title, children, onClose }: ModalBaseProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
