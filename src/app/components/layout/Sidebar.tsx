// src/components/layout/Sidebar.tsx
import React from 'react';

interface SidebarButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface SidebarProps {
  buttons: SidebarButton[];
  showInfo?: boolean;
  infoContent?: React.ReactNode;
  onImageUpload?: () => void;
  footerContent?: React.ReactNode;
  selected?: boolean;   // ✅ antes era isActive
}

export default function Sidebar({ 
  buttons, 
  showInfo = false, 
  infoContent, 
  onImageUpload,
  footerContent,
  selected = false   // ✅ valor por defecto
}: SidebarProps) {
  return (
    <aside className={`sidebar-container ${selected ? 'active1' : ''}`}>
      {/* Botones */}
      <div className="sidebar-buttons">
        {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          disabled={btn.disabled}
          aria-disabled={btn.disabled}
            className={`boton sidebar-button ${btn.disabled ? 'disabled' : ''} ${btn.label === 'Volver' ? 'btn-volver' : ''}`}
          >
          {btn.label}
        </button>
        ))}
      </div>

      {/* Divisor si hay contenido extra */}
      {(showInfo)}


      {/* Información adicional */}
      {showInfo && infoContent && (
        <div className="sidebar-info">
          {infoContent}
        </div>
      )}
      {/* Footer de la barra lateral */}
      {footerContent && (
        <div className="sidebar-footer LogoFinal">
          {footerContent}
        </div>
      )}
    </aside>
  );
}
