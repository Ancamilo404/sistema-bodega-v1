'use client';
import React, { useState } from 'react';
import ModalBase from './ModalBase';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PerfilModal({ user, onClose, onSuccess }: any) {
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, password: password || undefined }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success('Perfil actualizado correctamente ✅');
      onSuccess(json.data);
    } else {
      toast.error(`Error: ${json.error || 'No se pudo actualizar el perfil'}`);
    }
  };

  return (
    <ModalBase title="Editar Perfil" onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-perfil modal-form">
        <label>Nombre</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />

        <label>Correo</label>
        <input
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          placeholder="Tu correo"
        />

        <label>Contraseña nueva</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="btn-toggle-password"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type="submit" className="btn-submit-modal">
          Guardar cambios
        </button>
      </form>
    </ModalBase>
  );
}
