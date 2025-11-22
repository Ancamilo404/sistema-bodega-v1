"use client";
import '@/app/style/style.css';
import { useRouter } from "next/navigation";

export default function NoAutorizadoPage() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      textAlign: "center"
    }}>
      <h1>No tienes autorización</h1>
      <p style={{margin: '0 0  20px 0 ',}}>Debes pedir permiso al administrador para acceder a esta sección.</p>

      <button className="boton" onClick={() => router.back()}>
        Volver
      </button>
    </div>
  );
}
