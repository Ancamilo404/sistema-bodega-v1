"use client";
import React from "react";

export default function InfoTooltip() {
  return (
    <div className="info-tooltip">
      <strong>Información de la Página</strong>
      <ul>
        <li><strong>Creadores:</strong></li>
        <li>Andres Camilo Ramirez Orrego</li>
        <li>Simon Frenco Gisado</li>
      </ul>

        <strong>Ubicación:</strong> Medellín, Colombia
      <ul>

        <li><strong>Redes:</strong></li>
        <li>Correo: <em>Ancamilo404@gmail.com / simonfrancoguisado@gmail.com</em></li>
        <li>LinkedIn: <em>simon franco guisado / https://www.linkedin.com/in/simonfrancoguisado/?utm_source=share_via&utm_content=profile&utm_medium=member_android</em></li>
        <li>GitHub: <em>Ancamilo404 / https://github.com/Ancamilo404</em></li>
      </ul>

        <strong>Filosofía:</strong>
        <br /> Nos esforzamos por hacer las cosas bien y más de lo que nos piden.
        <br /> No hacemos cosas ordinarias.
        <br /> Usamos conocimientos, IA y sudor.
    </div>
  );
}
