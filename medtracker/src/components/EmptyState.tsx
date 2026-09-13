import type { ReactNode } from "react";
import plusIcon from "../assets/icons/plus.svg";

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-teal-100">
        {icon}
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-lg font-semibold text-slate-800">{title}</p>
        <p className="w-[380px] text-[13px] text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onCta}
        className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
      >
        <img src={plusIcon} alt="" className="size-4" />
        <span className="text-sm font-semibold text-white">{ctaLabel}</span>
      </button>
    </div>
  );
}
