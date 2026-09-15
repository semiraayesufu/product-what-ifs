import { useEffect, useState } from "react";
import closeIcon from "../assets/icons/close.svg";
import copyIcon from "../assets/icons/copy-white.svg";
import uploadIcon from "../assets/icons/upload-white.svg";
import { useAppStore } from "../store/AppStore";

type Tab = "export" | "import";

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

export default function BackupModal({ onClose }: { onClose: () => void }) {
  const { exportBackupCode, importBackupCode } = useAppStore();
  const [tab, setTab] = useState<Tab>("export");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [pasted, setPasted] = useState("");
  const [importState, setImportState] = useState<"idle" | "done" | "error">("idle");
  const [importError, setImportError] = useState("");

  const code = exportBackupCode();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleCopy() {
    const ok = await copyToClipboard(code);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2500);
  }

  function handleImport() {
    try {
      importBackupCode(pasted);
      setImportState("done");
      setImportError("");
    } catch (err) {
      setImportState("error");
      setImportError(err instanceof Error ? err.message : "Couldn't read that code.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex w-full max-w-[460px] flex-col gap-5 rounded-2xl bg-white p-7 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-slate-800">Move profile to another device</p>
            <p className="text-xs leading-[18px] text-slate-500">
              MedTracker saves your profile on this device only. Use a transfer code to copy it
              to another phone or browser &mdash; it's a snapshot, not automatic sync.
            </p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0">
            <img src={closeIcon} alt="Close" className="size-4" />
          </button>
        </div>

        <div className="flex w-full rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("export")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
              tab === "export" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
            }`}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setTab("import")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
              tab === "import" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
            }`}
          >
            Import
          </button>
        </div>

        {tab === "export" ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-600">
              Copy this code, then open MedTracker on the other device and paste it into Import.
            </p>
            <textarea
              readOnly
              value={code}
              onFocus={(e) => e.currentTarget.select()}
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-[16px] text-slate-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
            >
              <img src={copyIcon} alt="" className="size-3.5" />
              <span className="text-sm font-semibold text-white">
                {copyState === "copied" ? "Copied!" : "Copy code"}
              </span>
            </button>
            {copyState === "failed" && (
              <p className="text-[11px] text-[#e7000b]">
                Couldn't copy automatically. Tap the code above to select it, then copy manually.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-600">
              Paste a transfer code from another device. This replaces everything currently saved
              on this one.
            </p>
            <textarea
              value={pasted}
              onChange={(e) => {
                setPasted(e.target.value);
                setImportState("idle");
              }}
              placeholder="MEDTRACKER-V1:..."
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-[16px] text-slate-700 focus:outline-none"
            />
            <button
              type="button"
              disabled={!pasted.trim()}
              onClick={handleImport}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src={uploadIcon} alt="" className="size-3.5" />
              <span className="text-sm font-semibold text-white">Import and replace profile</span>
            </button>
            {importState === "done" && (
              <p className="text-[11px] font-medium text-teal-700">
                Profile imported. Close this to see it.
              </p>
            )}
            {importState === "error" && (
              <p className="text-[11px] text-[#e7000b]">{importError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
