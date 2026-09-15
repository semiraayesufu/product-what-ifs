import { useState } from "react";
import logoMark from "../assets/icons/logo-mark.svg";
import homeIcon from "../assets/icons/home.svg";
import medicationsIcon from "../assets/icons/medications.svg";
import shieldAlertIcon from "../assets/icons/shield-alert.svg";
import cardiogramIcon from "../assets/icons/cardiogram.svg";
import shieldCheckIcon from "../assets/icons/shield-check.svg";
import historyIcon from "../assets/icons/history.svg";
import uploadIcon from "../assets/icons/upload.svg";
import BackupModal from "./BackupModal";

export type NavKey =
  | "home"
  | "medications"
  | "allergies"
  | "conditions"
  | "interactions"
  | "history";

const NAV_ITEMS: { key: NavKey; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: homeIcon },
  { key: "medications", label: "Medications", icon: medicationsIcon },
  { key: "allergies", label: "Allergies", icon: shieldAlertIcon },
  { key: "conditions", label: "Medical conditions", icon: cardiogramIcon },
  { key: "interactions", label: "Interaction checker", icon: shieldCheckIcon },
  { key: "history", label: "History", icon: historyIcon },
];

export default function Sidebar({
  active,
  onNavigate,
  disclaimer,
}: {
  active: NavKey;
  onNavigate?: (key: NavKey) => void;
  disclaimer?: string;
}) {
  const [backupOpen, setBackupOpen] = useState(false);
  return (
    <div className="flex h-full w-[240px] shrink-0 flex-col gap-5 overflow-hidden border-r border-slate-200 bg-white p-5 print:hidden">
      <div className="flex items-center border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <img src={logoMark} alt="" className="h-6 w-[19px]" />
          <p className="text-lg font-semibold text-slate-900">MedTracker</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate?.(item.key)}
              className={`flex w-full items-center gap-1.5 rounded-base px-2 py-1.5 text-left ${
                isActive ? "bg-teal-50" : ""
              }`}
            >
              <img src={item.icon} alt="" className="size-5" />
              <span
                className={`text-base font-medium ${
                  isActive ? "text-teal-700" : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setBackupOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-base border border-slate-200 px-2 py-1.5 text-left"
      >
        <img src={uploadIcon} alt="" className="size-4" />
        <span className="text-xs font-medium text-slate-600">Move to another device</span>
      </button>
      {disclaimer && (
        <div className="flex w-full flex-col gap-4 rounded-base border border-[#96f7e4] bg-teal-50 p-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-teal-700">
              This tool shares information only
            </p>
            <p className="text-xs leading-5 text-teal-700">{disclaimer}</p>
          </div>
        </div>
      )}
      {backupOpen && <BackupModal onClose={() => setBackupOpen(false)} />}
    </div>
  );
}
