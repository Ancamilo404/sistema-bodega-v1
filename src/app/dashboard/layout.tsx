"use client";
// import "./layout.css";
import '@/app/style/style.css';
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}


function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
