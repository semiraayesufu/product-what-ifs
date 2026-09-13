import chevronRight from "../assets/icons/chevron-right.svg";
import { DOT_COLOR, type Severity } from "./SeverityBadge";

export interface RecentCheck {
  id: string;
  label: string;
  meta: string;
  severity: Severity | "clear";
}

export default function RecentCheckRow({
  check,
  active,
  onClick,
}: {
  check: RecentCheck;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-4 py-3 text-left ${
        active ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-1 items-start gap-2.5">
        <div className="flex h-4 shrink-0 items-center">
          <div className={`size-2 shrink-0 rounded ${DOT_COLOR[check.severity]}`} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-slate-700">{check.label}</p>
          <p className="text-[11px] text-slate-500">{check.meta}</p>
        </div>
      </div>
      <img src={chevronRight} alt="" className="size-4 shrink-0" />
    </button>
  );
}
