import { useState } from "react";
import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import copyIcon from "../assets/icons/copy.svg";
import printerIcon from "../assets/icons/printer.svg";
import plusIcon from "../assets/icons/plus.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import shieldCheckIcon from "../assets/icons/shield-check.svg";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import SeverityBadge, { SEVERITY_GUIDANCE } from "./SeverityBadge";
import type { ResultData, Decision } from "../types";

export type { ResultData };

// Nigeria's national emergency number, unified across all networks by the
// NCC. Not a stand-in for a specific provider's number, which the app has no
// way to know.
const EMERGENCY_TEL = "112";
const EMERGENCY_DISPLAY = "112";

const DECISION_LABEL: Record<Decision, string> = {
  proceed: "You chose to proceed",
  "contact-provider": `Called Emergency Services (${EMERGENCY_DISPLAY})`,
  cancel: "You chose not to add this",
};

function buildCopyText(data: ResultData): string {
  const lines = [data.title, data.subtitle, ""];
  if (data.outcome === "found" && data.conflicts) {
    for (const c of data.conflicts) {
      lines.push(`${c.pair}: ${c.severity.toUpperCase()}`);
      lines.push(c.headline);
      lines.push(c.detail);
      lines.push(`What this means: ${SEVERITY_GUIDANCE[c.severity]}`);
      lines.push("");
    }
  }
  if (data.outcome === "clear") {
    lines.push("No known interaction found. Likely safe to take together.");
    if (data.source) lines.push(data.source);
  }
  if (data.outcome === "unresolved") {
    lines.push(data.note ?? "We don't have documented interaction data for this item yet.");
  }
  lines.push("", "This is informational only. Not a substitute for medical advice.");
  return lines.join("\n");
}

/** Copies via the Clipboard API where allowed, falling back to a hidden-textarea
 * execCommand copy. The app runs inside a sandboxed iframe where the Clipboard
 * API can be unavailable even though a direct user click is driving it. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

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
  existingMedicationNames,
}: {
  data: ResultData;
  onBack: () => void;
  onClose: () => void;
  onAddMedication?: (name: string) => void;
  decision?: Decision;
  onDecide?: (decision: Decision) => void;
  /** Persistent confirm action shown regardless of outcome, used by batch add-flows to finalize. */
  onConfirm?: () => void;
  confirmLabel?: string;
  /** Deletes this saved check from history. Only passed for entries that exist in the log. */
  onDelete?: () => void;
  /** Current medication names, used to hide "add to medications" prompts for items already added. */
  existingMedicationNames?: string[];
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const needsDecision = onDecide && (data.outcome === "found" || data.outcome === "unresolved");

  const addPromptNames = data.addPromptNames?.filter(
    (name) => !existingMedicationNames?.some((m) => m.toLowerCase() === name.toLowerCase()),
  );

  async function handleCopy() {
    const ok = await copyToClipboard(buildCopyText(data));
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2500);
  }

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
        <div className="flex shrink-0 flex-col items-end gap-1.5 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
            >
              <img src={printerIcon} alt="" className="size-3.5" />
              <span className="text-xs font-medium text-slate-600">Print Result</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
            >
              <img src={copyIcon} alt="" className="size-3.5" />
              <span className="text-xs font-medium text-slate-600">
                {copyState === "copied" ? "Copied!" : "Copy Result"}
              </span>
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1.5 rounded-sm border border-[#ffc9c9] bg-[#fef2f2] px-3 py-1.5 shadow-xs"
              >
                <img src={trashIcon} alt="" className="size-3.5" />
                <span className="text-xs font-medium text-[#e7000b]">Delete</span>
              </button>
            )}
          </div>
          <p className="max-w-[220px] text-right text-[11px] text-slate-400">
            If Print doesn't open a dialog, use Ctrl+P (Windows) or Cmd+P (Mac) instead.
          </p>
          {copyState === "failed" && (
            <p className="max-w-[220px] text-right text-[11px] text-[#e7000b]">
              Couldn't copy automatically. Select the result text and copy it manually.
            </p>
          )}
        </div>
      </div>

      {onDelete && confirmingDelete && (
        <ConfirmDeleteModal
          message="Are you sure you want to delete this check from your history?"
          onConfirm={onDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

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
                <p className="whitespace-pre-line text-xs leading-[18px] text-slate-600">{c.detail}</p>
                <div className="mt-1 flex flex-col gap-0.5 rounded-md border border-slate-200 bg-white px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    What this means for you
                  </p>
                  <p className="text-xs leading-[18px] text-slate-700">
                    {SEVERITY_GUIDANCE[c.severity]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.outcome === "found" && data.note && (
          <p className="rounded-lg bg-slate-100 px-3.5 py-2.5 text-xs leading-[18px] text-slate-600">{data.note}</p>
        )}

        {data.outcome === "clear" && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#a4f4cf] bg-[#ecfdf5] p-[18px]">
            <img src={shieldCheckIcon} alt="" className="mt-0.5 size-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-[#006045]">
                No known interaction found. Likely safe to take together.
              </p>
              <p className="text-xs leading-[18px] text-[#006045]">
                Nothing in the current FDA label data flags a conflict here. This isn't a
                guarantee. Always mention everything you take to your doctor or pharmacist.
              </p>
              {data.source && <p className="text-xs text-[#3d8a6e]">{data.source}</p>}
            </div>
          </div>
        )}

        {data.outcome === "unresolved" && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-slate-100 p-[18px]">
            <p className="text-[10px] font-bold text-slate-500">UNRESOLVED</p>
            <p className="text-sm font-bold text-slate-800">Not verified against your profile</p>
            <p className="text-xs text-slate-500">
              {data.note ?? "We don't have documented interaction data for this item yet."}
            </p>
            <p className="text-xs leading-[18px] text-slate-600">{SEVERITY_GUIDANCE.unresolved}</p>
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
              <div className="flex w-full flex-col gap-2 print:hidden">
                <div className="flex w-full flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onDecide?.("proceed")}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-slate-700">Proceed anyway</span>
                  </button>
                  <a
                    href={`tel:${EMERGENCY_TEL}`}
                    onClick={() => onDecide?.("contact-provider")}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-white">
                      Call Emergency Services ({EMERGENCY_DISPLAY})
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onDecide?.("cancel")}
                    className="flex items-center gap-1.5 rounded-lg border border-[#ffc9c9] bg-[#fef2f2] px-3 py-2 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-[#e7000b]">Cancel</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  112 is Nigeria's national emergency number, for urgent medical situations. It is
                  not your personal doctor's office.
                </p>
              </div>
            )}
          </div>
        )}

        {addPromptNames && addPromptNames.length > 0 && (
          <div className="flex w-full flex-col gap-4 rounded-xl bg-slate-100 p-[18px] print:hidden">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase text-slate-800">
                {addPromptNames.length > 1
                  ? `${addPromptNames.join(", ")} aren't in your medication list`
                  : `${addPromptNames[0]} isn't in your medication list`}
              </p>
              <p className="text-xs text-slate-600">
                Add {addPromptNames.length > 1 ? "them" : "it"} to your profile so future checks
                account for {addPromptNames.length > 1 ? "them" : "it"} automatically
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2">
              {addPromptNames.map((name) => (
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
