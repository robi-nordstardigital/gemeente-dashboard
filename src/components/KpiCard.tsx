"use client";

interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  delay?: number;
}

export default function KpiCard({ label, value, change, changeType = "neutral", icon, delay = 0 }: KpiCardProps) {
  return (
    <div
      className={`kpi-card animate-in rounded-xl p-4 ${delay > 0 ? `animate-in-delay-${delay}` : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <p
              className={`mt-1 text-xs font-medium ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                    ? "text-danger"
                    : "text-muted"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent-light">
          {icon}
        </div>
      </div>
    </div>
  );
}
