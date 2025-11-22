"use client";
import React from "react";
import ModalBase from "./ModalBase";
import toast from "react-hot-toast";

interface DeleteConfirmModalProps {
  entity: "cliente" | "aliado" | "usuario" | "producto";
  id: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ entity, id, onClose, onSuccess }: DeleteConfirmModalProps) {
  const handleDelete = async () => {
    const res = await fetch(`/api/${entity}s/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (res.ok) {
      toast.success(`${entity.charAt(0).toUpperCase() + entity.slice(1)} archivado correctamente`);
      onSuccess();
    } else {
      toast.error(json.error || `Error al archivar ${entity}`);
    }
  };

  return (
    <ModalBase title={`Eliminar ${entity.charAt(0).toUpperCase() + entity.slice(1)}`} onClose={onClose}>
      <p>¿Seguro que deseas eliminar este {entity}?</p>
      <div className="modal-actions">
        <button onClick={handleDelete} className="btn-danger">Eliminar</button>
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
      </div>
    </ModalBase>
  );
}