// src/components/layout/Header.tsx
import React from 'react';

interface HeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function Header({ title, icon }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-top">
        <h1 className="title">{title}</h1>
        <div className="header-icon">{icon}</div>
      </div>
    </div>
  );
}