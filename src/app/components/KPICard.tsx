// src/app/components/KPICard.tsx
interface KPICardProps {
  title: string;
  value: number | string;
  description: string;
}

export default function KPICard({ title, value, description }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <p className="kpi-description">{description}</p>
    </div>
  );
}
