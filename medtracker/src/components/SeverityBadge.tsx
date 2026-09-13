import type { Severity } from "../types";

export type { Severity };

const STYLES: Record<Severity, string> = {
  major: "bg-[#fef2f2] border-[#ffc9c9] text-[#82181a]",
  moderate: "bg-[#fff8f1] border-[#fcd9bd] text-[#771d1d]",
  minor: "bg-[#ecfdf5] border-[#a4f4cf] text-[#006045]",
  unresolved: "bg-slate-100 border-slate-200 text-slate-600",
};

const LABELS: Record<Severity, string> = {
  major: "Major",
  moderate: "Moderate",
  minor: "Minor",
  unresolved: "Unresolved",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-0.5 ${STYLES[severity]}`}
    >
      <p className="text-[11px] font-medium">{LABELS[severity]}</p>
    </div>
  );
}

export const DOT_COLOR: Record<Severity | "clear", string> = {
  major: "bg-[#fb2c36]",
  moderate: "bg-[#ff6900]",
  minor: "bg-[#00c950]",
  unresolved: "bg-slate-400",
  clear: "bg-teal-700",
};
