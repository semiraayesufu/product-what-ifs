import arrowLeft from "../assets/icons/arrow-left.svg";
import closeIcon from "../assets/icons/close.svg";
import printerIcon from "../assets/icons/printer.svg";
import plusIcon from "../assets/icons/plus.svg";
import SeverityBadge from "./SeverityBadge";
import type { ResultData, Decision } from "../types";

export type { ResultData };

const DECISION_LABEL: Record<Decision, string> = {
  proceed: "You chose to proceed",
  "contact-provider": "Provider contacted — awaiting response",
  cancel: "You chose not to add this",
};

export default function ResultPanel({
  data,
  onBack,
  onClose,
  onAddMedication,
  decision,
  onDecide,
}: {
  data: ResultData;
  onBack: () => void;
  onClose: () => void;
  onAddMedication?: (name: string) => void;
  decision?: Decision;
  onDecide?: (decision: Decision) => void;
}) {
  const needsDecision = data.outcome === "found" || data.outcome === "unresolved";
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-hidden px-8 py-5">
      <div className="flex w-full items-start justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5">
          <img src={arrowLeft} alt="" className="size-3.5" />
          <span className="text-xs font-medium text-slate-700">Back</span>
        </button>
        <button type="button" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">{data.title}</p>
          <p className="text-xs text-slate-600">{data.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex shrink-0 items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
        >
          <img src={printerIcon} alt="" className="size-3.5" />
          <span className="text-xs font-medium text-slate-600">Print Result</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {data.outcome === "found" && data.conflicts && (
          <div className="flex flex-col gap-5">
            {data.conflicts.map((c) => (
              <div
                key={c.pair}
                className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5"
              >
                <div className="flex w-full items-center gap-2">
                  <p className="flex-1 text-sm font-medium text-slate-800">{c.pair}</p>
                  <SeverityBadge severity={c.severity} />
                </div>
                <p className="text-xs font-medium text-slate-700">{c.headline}</p>
                <p className="text-xs leading-[18px] text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        )}

        {data.outcome === "clear" && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-[#f1f1f1] p-[18px]">
            <p className="text-[10px] font-bold text-[#737373]">CHECKED AGAINST</p>
            <p className="text-sm font-bold text-[#141414]">{data.checkedAgainst}</p>
            <p className="text-xs text-[#737373]">{data.source}</p>
          </div>
        )}

        {data.outcome === "unresolved" && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-slate-100 p-[18px]">
            <p className="text-[10px] font-bold text-slate-500">UNRESOLVED</p>
            <p className="text-sm font-bold text-slate-800">Not verified against your profile</p>
            <p className="text-xs text-slate-500">
              We don't have documented interaction data for this item yet.
            </p>
          </div>
        )}

        {needsDecision && (
          <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 p-[18px]">
            <p className="text-[11px] font-semibold uppercase text-slate-600">
              What would you like to do?
            </p>
            {decision ? (
              <p className="text-sm font-medium text-slate-700">{DECISION_LABEL[decision]}</p>
            ) : (
              <div className="flex w-full flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDecide?.("proceed")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-xs"
                >
                  <span className="text-sm font-semibold text-slate-700">Proceed anyway</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDecide?.("contact-provider")}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
                >
                  <span className="text-sm font-semibold text-white">Contact provider</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDecide?.("cancel")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#ffc9c9] bg-[#fef2f2] px-3 py-2 shadow-xs"
                >
                  <span className="text-sm font-semibold text-[#e7000b]">Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}

        {data.addPromptName && (
          <div className="flex w-full flex-col gap-4 rounded-xl bg-slate-100 p-[18px]">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase text-slate-800">
                {data.addPromptName} isn't in your medication list
              </p>
              <p className="text-xs text-slate-600">
                Add it to your profile so future checks account for it automatically
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddMedication?.(data.addPromptName!)}
              className="flex w-fit items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">
                Add {data.addPromptName} to my medications
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
