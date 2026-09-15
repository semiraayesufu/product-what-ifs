import { fetchDrugSafetyInfo, excerptAround, DrugApiError } from "../services/drugApi";
import type { ConflictItem, LogEntry, ResultData, Severity } from "../types";

const SEVERITY_RANK: Record<Severity, number> = { major: 3, moderate: 2, minor: 1, unresolved: 0 };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Real FDA "Drug Interactions" sections are often just a flat list of drug
// names grouped by class, with no per-drug severity language — so every
// match found there lands at the same section-based default (Moderate),
// even when the actual text nearby says something much stronger or weaker.
// Read the excerpt itself for real signal language and adjust from there,
// instead of relying only on which section matched.
const MAJOR_SIGNALS =
  /\b(contraindicated|should not be (?:used|co-?administered)|do not use|avoid concomitant use|avoid combination|life-threatening|fatal|increased risk of death|black box)\b/i;
const ELEVATED_SIGNALS = /\b(increased risk|serious|significantly increase|severe|major bleeding|toxicity)\b/i;
const REDUCED_SIGNALS =
  /\b(no significant interaction|not expected to be clinically significant|minor interaction|unlikely to be clinically significant|no dosage adjustment)\b/i;

function refineSeverity(base: Severity, excerpt: string): Severity {
  const text = excerpt.toLowerCase();
  if (MAJOR_SIGNALS.test(text)) return "major";
  if (REDUCED_SIGNALS.test(text)) {
    if (base === "major") return "moderate";
    if (base === "moderate") return "minor";
    return base;
  }
  if (base === "minor" && ELEVATED_SIGNALS.test(text)) return "moderate";
  return base;
}

export type CheckOutcome = { result: ResultData; severity: LogEntry["severity"] };

export type ProfileCounts = { medications: number; allergies: number; conditions: number };

// The Interaction Checker works standalone — you shouldn't need anything saved
// in your profile to check a drug or two against each other. Say what was
// actually compared instead of always reporting profile counts, which read as
// a broken "0/0/0" tally when the profile is empty or irrelevant to this check.
function buildCheckedAgainstText(items: string[], profile: ProfileCounts): string {
  const profileTotal = profile.medications + profile.allergies + profile.conditions;
  if (items.length > 1) {
    return profileTotal > 0
      ? `Each other, plus ${profile.medications} medications, ${profile.allergies} allergies, ${profile.conditions} conditions in your profile`
      : "Each other";
  }
  return profileTotal > 0
    ? `${profile.medications} medications, ${profile.allergies} allergies, ${profile.conditions} conditions in your profile`
    : "Nothing saved yet — add medications, allergies, or conditions to your profile to check this against what you're already taking";
}

/**
 * Fetches each item's real FDA label live (openFDA) and scans its interaction /
 * warning / contraindication text for mentions of anything in `profileNames`
 * (existing medications/allergies/conditions, plus any other items being
 * checked alongside it). This is a live, honest heuristic — a real pairwise
 * drug-interaction database (e.g. DrugBank) isn't free/keyless, so we surface
 * what the FDA's own label text says rather than a fabricated verdict.
 */
export async function checkMedicationsAgainstProfile(
  items: string[],
  profileNames: string[],
  profileCounts: ProfileCounts,
  /** When provided, the result offers to add every checked item not already in this list. */
  existingMedicationNames?: string[],
): Promise<CheckOutcome> {
  const checkedAgainstText = buildCheckedAgainstText(items, profileCounts);
  const addPromptNames = existingMedicationNames
    ? items.filter((item) => !existingMedicationNames.some((m) => m.toLowerCase() === item.toLowerCase()))
    : undefined;

  try {
    const infos = await Promise.all(
      items.map(async (item) => ({ item, info: await fetchDrugSafetyInfo(item) })),
    );

    const unresolvedCount = infos.filter((x) => x.info === null).length;
    if (unresolvedCount === items.length) {
      return {
        severity: "unresolved",
        result: {
          outcome: "unresolved",
          title: items.join(", "),
          subtitle: "No FDA label on file",
          note: "openFDA doesn't have a published label under this exact name — try the generic name, or double-check the spelling.",
          addPromptNames: [items[0]],
        },
      };
    }

    const conflicts: ConflictItem[] = [];
    const displayNames: string[] = [];
    let anyOffline = false;

    for (const { item, info } of infos) {
      if (!info) continue;
      displayNames.push(info.displayName);
      if (info.source === "offline") anyOffline = true;

      // Check against the existing profile, and against every OTHER item in
      // this same batch — the whole point of checking multiple new
      // medications together is catching conflicts between them, not just
      // against what's already saved.
      const namesToCheck = [
        ...profileNames.filter((n) => !items.some((i) => i.toLowerCase() === n.toLowerCase())),
        ...items.filter((i) => i.toLowerCase() !== item.toLowerCase()),
      ];

      for (const profName of namesToCheck) {
        if (profName.trim().length < 4) continue;
        const needle = new RegExp(`\\b${escapeRegExp(profName.trim())}`, "i");
        const hitSection = info.sections.find((s) => needle.test(s.text));
        if (hitSection) {
          const detail = excerptAround(hitSection.text, profName.trim());
          conflicts.push({
            pair: `${info.displayName} + ${profName}`,
            severity: refineSeverity(hitSection.severity, detail),
            headline: `${profName} is mentioned in this label's ${hitSection.label.toLowerCase()}`,
            detail,
          });
        }
      }
    }

    const title = displayNames.join(", ") || items.join(", ");
    const sourceLabel = anyOffline
      ? "Source: openFDA drug label data (from bundled offline snapshot — live check unavailable)"
      : "Source: openFDA drug label database (checked live)";

    if (conflicts.length > 0) {
      const worst = conflicts.reduce<Severity>(
        (acc, c) => (SEVERITY_RANK[c.severity] > SEVERITY_RANK[acc] ? c.severity : acc),
        "unresolved",
      );
      return {
        severity: worst,
        result: {
          outcome: "found",
          title,
          subtitle: `${conflicts.length} potential interaction${conflicts.length > 1 ? "s" : ""} found — ${anyOffline ? "from an offline FDA data snapshot" : "live from openFDA"}`,
          conflicts,
          addPromptNames,
        },
      };
    }

    return {
      severity: "clear",
      result: {
        outcome: "clear",
        title,
        subtitle: "No mention found in the current FDA label",
        checkedAgainst: checkedAgainstText,
        source: sourceLabel,
        addPromptNames,
      },
    };
  } catch (err) {
    return {
      severity: "unresolved",
      result: {
        outcome: "unresolved",
        title: items.join(", "),
        subtitle: "Couldn't complete the check",
        note:
          err instanceof DrugApiError
            ? `${err.message} It isn't in our small offline fallback set either — try a common generic name (e.g. "ibuprofen" instead of a brand name).`
            : "Something went wrong reaching the live drug database. Please try again.",
      },
    };
  }
}
