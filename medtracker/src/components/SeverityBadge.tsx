import type { Severity } from "../types";

export type { Severity };

// "Minor" deliberately avoids green — green is reserved for "no interaction
// found" (see DOT_COLOR.clear below) so it always means "safe," never
// "a real interaction was found, just a mild one."
const STYLES: Record<Severity, string> = {
  major: "bg-[#fef2f2] border-[#ffc9c9] text-[#82181a]",
  moderate: "bg-[#fff8f1] border-[#fcd9bd] text-[#771d1d]",
  minor: "bg-[#fffbeb] border-[#fde68a] text-[#854d0e]",
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
  minor: "bg-[#f0b100]",
  unresolved: "bg-slate-400",
  clear: "bg-[#00c950]",
};

// Plain-language guidance for patients/caregivers — explains what the
// severity actually means to do about it, not just a clinical label.
export const SEVERITY_GUIDANCE: Record<Severity, string> = {
  major:
    "High risk combination. Don't start or continue taking these together without talking to a doctor or pharmacist first.",
  moderate:
    "Worth a conversation. This combination can cause a real interaction for some people. Tell your doctor or pharmacist you're taking both, and watch for new or unusual symptoms.",
  minor:
    "Usually low risk. This is a mild, well documented interaction. Most people take these together safely, but it's worth mentioning at your next appointment.",
  unresolved:
    "We couldn't confirm this from FDA data. Ask your pharmacist to check directly before assuming it's safe.",
};
