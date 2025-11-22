// src/components/layout/MainLayout.tsx
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;   // ✅ nuevo
  topbar?: React.ReactNode;   // ✅ opcional extra
  showSidebar?: boolean;
  contentClassName?: string;
}

export default function MainLayout({
  children,
  sidebar,
  header,
  footer,
  topbar,
  showSidebar = false,
  contentClassName = ""
}: MainLayoutProps) {
  return (
    <div className="main-layout-container">
      <div className="main-layout-wrapper">
        {/* Sidebar izquierda (opcional) */}
        {showSidebar && sidebar && (
          <div className="main-layout-sidebar">
            {sidebar}
          </div>
        )}

        {/* Contenido derecho */}
        <div className={`main-layout-content ${contentClassName}`}>
          {/* Topbar opcional */}
          {topbar && (
            <div className="main-layout-topbar">
              {topbar}
            </div>
          )}

          {/* Header */}
          {header && (
            <div className="main-layout-header">
              {header}
            </div>
          )}

          {/* Cuerpo principal */}
          <div className="main-layout-body">
            {children}
          </div>

          {/* Footer opcional */}
          {footer && (
            <div className="main-layout-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
