import type { HistoryRow } from "../types";

export default function ChangeHistoryList({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[11px] font-semibold text-slate-600">CHANGE HISTORY</p>
      <div className="flex w-full flex-col gap-2 text-xs">
        {rows.map((row) => (
          <div
            key={row.label + row.date}
            className="flex w-full items-center gap-2 rounded-[10px] border border-slate-200 p-3.5"
          >
            <p className="flex-1 text-slate-700">{row.label}</p>
            <p className="shrink-0 text-slate-500">{row.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
