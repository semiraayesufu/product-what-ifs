import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import copyIcon from "../assets/icons/copy.svg";
import printerIcon from "../assets/icons/printer.svg";
import plusIcon from "../assets/icons/plus.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import shieldCheckIcon from "../assets/icons/shield-check.svg";
import InlineConfirm from "./InlineConfirm";
import SeverityBadge, { SEVERITY_GUIDANCE } from "./SeverityBadge";
import type { ResultData, Decision } from "../types";

export type { ResultData };

// A real, staffed 24/7 US hotline for exactly this kind of question — not a
// stand-in for a specific provider's number, which the app has no way to know.
const POISON_CONTROL_TEL = "+18002221222";
const POISON_CONTROL_DISPLAY = "1-800-222-1222";

const DECISION_LABEL: Record<Decision, string> = {
  proceed: "You chose to proceed",
  "contact-provider": `Called Poison Control (${POISON_CONTROL_DISPLAY})`,
  cancel: "You chose not to add this",
};

function buildCopyText(data: ResultData): string {
  const lines = [data.title, data.subtitle, ""];
  if (data.outcome === "found" && data.conflicts) {
    for (const c of data.conflicts) {
      lines.push(`${c.pair} — ${c.severity.toUpperCase()}`);
      lines.push(c.headline);
      lines.push(c.detail);
      lines.push(`What this means: ${SEVERITY_GUIDANCE[c.severity]}`);
      lines.push("");
    }
  }
  if (data.outcome === "clear") {
    lines.push(`Checked against: ${data.checkedAgainst}`);
    if (data.source) lines.push(data.source);
  }
  if (data.outcome === "unresolved") {
    lines.push(data.note ?? "We don't have documented interaction data for this item yet.");
  }
  lines.push("", "This is informational only — not a substitute for medical advice.");
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A self-contained printable page, opened in its own (unsandboxed) tab via a
 * real link — window.print() is blocked inside the artifact's sandboxed
 * iframe, but this new tab is a normal top-level page where it works. */
function buildPrintableHtml(data: ResultData): string {
  const body = escapeHtml(buildCopyText(data)).replace(/\n/g, "<br>");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(data.title)} — MedTracker</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;color:#141413;line-height:1.6}
h1{font-size:20px;margin-bottom:4px}
.subtitle{color:#555;margin-bottom:24px;font-size:14px}
.block{border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:16px;background:#fafafa;font-size:13px}
button{font:inherit;background:#0f766e;color:#fff;border:none;border-radius:8px;padding:10px 16px;cursor:pointer}
@media print { button { display:none } }
</style></head>
<body>
<h1>${escapeHtml(data.title)}</h1>
<p class="subtitle">${escapeHtml(data.subtitle)}</p>
<div class="block">${body}</div>
<button onclick="window.print()">Print this page</button>
</body></html>`;
}

/** Copies via the Clipboard API where allowed, falling back to a hidden-textarea
 * execCommand copy — the app runs inside a sandboxed iframe where the Clipboard
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
  /** Persistent confirm action shown regardless of outcome — used by batch add-flows to finalize. */
  onConfirm?: () => void;
  confirmLabel?: string;
  /** Deletes this saved check from history — only passed for entries that exist in the log. */
  onDelete?: () => void;
  /** Current medication names — used to hide "add to medications" prompts for items already added. */
  existingMedicationNames?: string[];
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const needsDecision = onDecide && (data.outcome === "found" || data.outcome === "unresolved");

  const addPromptNames = data.addPromptNames?.filter(
    (name) => !existingMedicationNames?.some((m) => m.toLowerCase() === name.toLowerCase()),
  );

  const printableUrl = useMemo(() => {
    const blob = new Blob([buildPrintableHtml(data)], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [data]);

  useEffect(() => () => URL.revokeObjectURL(printableUrl), [printableUrl]);

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
            <a
              href={printableUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
            >
              <img src={printerIcon} alt="" className="size-3.5" />
              <span className="text-xs font-medium text-slate-600">Print Result</span>
            </a>
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
            {onDelete && !confirmingDelete && (
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
          {copyState === "failed" && (
            <p className="max-w-[220px] text-right text-[11px] text-[#e7000b]">
              Couldn't copy automatically — select the result text and copy it manually.
            </p>
          )}
          {onDelete && confirmingDelete && (
            <InlineConfirm
              question="Delete this check?"
              confirmLabel="Yes, delete"
              onConfirm={onDelete}
              onCancel={() => setConfirmingDelete(false)}
            />
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

        {data.outcome === "clear" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5 rounded-xl border border-[#a4f4cf] bg-[#ecfdf5] p-[18px]">
              <img src={shieldCheckIcon} alt="" className="mt-0.5 size-5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-[#006045]">
                  No known interaction found — likely safe to take together
                </p>
                <p className="text-xs leading-[18px] text-[#006045]">
                  Nothing in the current FDA label data flags a conflict here. This isn't a
                  guarantee — always mention everything you take to your doctor or pharmacist.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl bg-[#f1f1f1] p-[18px]">
              <p className="text-[10px] font-bold text-[#737373]">CHECKED AGAINST</p>
              <p className="text-sm font-bold text-[#141414]">{data.checkedAgainst}</p>
              <p className="text-xs text-[#737373]">{data.source}</p>
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
                    href={`tel:${POISON_CONTROL_TEL}`}
                    onClick={() => onDecide?.("contact-provider")}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-white">
                      Call Poison Control ({POISON_CONTROL_DISPLAY})
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
                  Poison Control is a free, confidential medication safety line, staffed 24/7 —
                  not your personal doctor's office. In a medical emergency, call 911.
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
