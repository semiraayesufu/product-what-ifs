import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import printerIcon from "../assets/icons/printer.svg";
import plusIcon from "../assets/icons/plus.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
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
  onConfirm,
  confirmLabel,
  onDelete,
}: {
  data: ResultData;
  onBack: () => void;
  onClose: () => void;
  onAddMedication?: (name: string) => void;
  decision?: Decision;
  onDecide?: (decision: Decision) => void;
  /** Persistent confirm action shown regardless of outcome — used by batch add-flows to finalize. */
  onConfirm?: () => void;
  confirmLabel?: string;
  /** Deletes this saved check from history — only passed for entries that exist in the log. */
  onDelete?: () => void;
}) {
  const needsDecision = onDecide && (data.outcome === "found" || data.outcome === "unresolved");
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-hidden px-8 py-5">
      <div className="flex w-full items-start justify-between print:hidden">
        <BackButton onClick={onBack} />
        <button type="button" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">{data.title}</p>
          <p className="text-xs text-slate-600">{data.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
          >
            <img src={printerIcon} alt="" className="size-3.5" />
            <span className="text-xs font-medium text-slate-600">Print Result</span>
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this check from your history?")) onDelete();
              }}
              className="flex items-center gap-1.5 rounded-sm border border-[#ffc9c9] bg-[#fef2f2] px-3 py-1.5 shadow-xs"
            >
              <img src={trashIcon} alt="" className="size-3.5" />
              <span className="text-xs font-medium text-[#e7000b]">Delete</span>
            </button>
          )}
        </div>
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
              {data.note ?? "We don't have documented interaction data for this item yet."}
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
              <div className="flex w-full flex-wrap gap-2 print:hidden">
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

        {data.addPromptNames && data.addPromptNames.length > 0 && (
          <div className="flex w-full flex-col gap-4 rounded-xl bg-slate-100 p-[18px] print:hidden">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase text-slate-800">
                {data.addPromptNames.length > 1
                  ? `${data.addPromptNames.join(", ")} aren't in your medication list`
                  : `${data.addPromptNames[0]} isn't in your medication list`}
              </p>
              <p className="text-xs text-slate-600">
                Add {data.addPromptNames.length > 1 ? "them" : "it"} to your profile so future checks
                account for {data.addPromptNames.length > 1 ? "them" : "it"} automatically
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2">
              {data.addPromptNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onAddMedication?.(name)}
                  className="flex w-fit items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
                >
                  <img src={plusIcon} alt="" className="size-4" />
                  <span className="text-sm font-semibold text-white">Add {name} to my medications</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          className="flex w-full shrink-0 items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs print:hidden"
        >
          <span className="text-sm font-semibold text-white">{confirmLabel ?? "Continue"}</span>
        </button>
      )}
    </div>
  );
}
