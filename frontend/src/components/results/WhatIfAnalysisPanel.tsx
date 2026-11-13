
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  GitCompare,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { architectureApi } from "../../services/api";
import type {
  ArchitectureAnalysis,
  ArchitectureRequirements,
  WhatIfResponse,
} from "../../types/architecture";


const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10";

const labelClass = "text-sm font-medium text-slate-300";

function humanize(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface WhatIfAnalysisPanelProps {
  analysis: ArchitectureAnalysis;
}
export function WhatIfAnalysisPanel({
  analysis,
}: WhatIfAnalysisPanelProps) {
  const currentRequirements = analysis.requirements;
  const hasOriginalRequirements = Boolean(currentRequirements);

  const [current, setCurrent] =
    useState<ArchitectureRequirements | null>(
      currentRequirements
        ? {
            ...currentRequirements,
            application_type: currentRequirements.application_type ?? "",
            expected_users: currentRequirements.expected_users ?? 0,
            traffic_level: currentRequirements.traffic_level ?? "medium",
            team_size: currentRequirements.team_size ?? 0,
            budget: currentRequirements.budget ?? "medium",
            availability_requirement:
              currentRequirements.availability_requirement ?? "standard",
            latency_requirement:
              currentRequirements.latency_requirement ?? "standard",
            global_distribution:
              currentRequirements.global_distribution ?? false,
            real_time: currentRequirements.real_time ?? false,
            compliance_required:
              currentRequirements.compliance_required ?? false,
          }
        : null,
    );

  const [modified, setModified] =
    useState<ArchitectureRequirements | null>(
      current ? { ...current } : null,
    );

  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateCurrent<K extends keyof ArchitectureRequirements>(
  key: K,
  value: ArchitectureRequirements[K],
) {
  setCurrent((previous) => {
    if (!previous) return previous;
    return { ...previous, [key]: value };
  });
  setResult(null);
}

function updateModified<K extends keyof ArchitectureRequirements>(
  key: K,
  value: ArchitectureRequirements[K],
) {
  setModified((previous) => {
    if (!previous) return previous;
    return { ...previous, [key]: value };
  });
  setResult(null);
}

  async function runAnalysis() {
    setError("");
    setResult(null);

      if (!current || !modified) {
    setError(
      "Original requirements are unavailable. Please run a new analysis first.",
    );
    return;
  }

    if (
      !current.application_type.trim() ||
      !modified.application_type.trim() ||
      !Number.isFinite(current.expected_users) ||
      !Number.isFinite(modified.expected_users) ||
      current.expected_users < 1 ||
      modified.expected_users < 1 ||
      !Number.isFinite(current.team_size) ||
      !Number.isFinite(modified.team_size) ||
      current.team_size < 1 ||
      modified.team_size < 1
    ) {
      setError(
        "Enter an application type and valid positive numbers for users and team size in both scenarios.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await architectureApi.whatIf({
        current_requirements: current,
        modified_requirements: modified,
      });

      setResult(response);
    } catch (err) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
          : "The what-if analysis failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function resetScenario() {
    const requirements = analysis.requirements;

    if (!requirements) {
      setCurrent(null);
      setModified(null);
    } else {
      const baseline: ArchitectureRequirements = {
        application_type: requirements.application_type ?? "",
        expected_users: requirements.expected_users ?? 0,
        traffic_level: requirements.traffic_level ?? "medium",
        team_size: requirements.team_size ?? 0,
        budget: requirements.budget ?? "medium",
        availability_requirement:
          requirements.availability_requirement ?? "standard",
        latency_requirement:
          requirements.latency_requirement ?? "standard",
        global_distribution: requirements.global_distribution ?? false,
        real_time: requirements.real_time ?? false,
        compliance_required: requirements.compliance_required ?? false,
      };

      setCurrent(baseline);
      setModified({ ...baseline });
    }

    setResult(null);
    setError("");
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 shadow-soft md:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2 text-teal-300">
            <GitCompare size={19} />
            <span className="technical-label">Scenario analysis</span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-100">
            What-If Architecture Analysis
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Change a requirement and compare how the architecture scores
            and recommendation respond.
          </p>
        </div>

        <button
          type="button"
          onClick={resetScenario}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Reset example
        </button>
      </div>

      {current && modified ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <RequirementForm
            title="Current baseline"
            description="The requirements before your change."
            value={current}
            onChange={updateCurrent}
          />

          <RequirementForm
            title="Modified scenario"
            description="The requirements you want to evaluate."
            value={modified}
            onChange={updateModified}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
          Original requirements are unavailable. Please run a new analysis before
          using What-If Analysis.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={runAnalysis}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Comparing architectures...
          </>
        ) : (
          <>
            Run What-If Analysis
            <ArrowRight size={17} />
          </>
        )}
      </button>

      {result && (
        <div className="mt-8 border-t border-slate-800 pt-7">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <p className="technical-label text-teal-300">
              Analysis complete
            </p>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-100">
            Scenario comparison
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <RecommendationCard
              title="Original recommendation"
              architecture={result.original_recommendation}
              score={result.original_score}
            />

            <RecommendationCard
              title="Modified recommendation"
              architecture={result.new_recommendation}
              score={result.new_score}
              highlighted={result.recommendation_changed}
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm font-semibold text-slate-100">
              Recommendation status
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.recommendation_changed
                ? `The recommendation changed from ${humanize(result.original_recommendation)} to ${humanize(result.new_recommendation)}.`
                : "The recommendation remained the same after the requirements changed."}
            </p>

            {result.changed_requirements.length > 0 && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Changed requirements
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.changed_requirements.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 text-xs font-medium text-teal-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold text-slate-100">
              Architecture score changes
            </h4>

            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Architecture</th>
                    <th className="px-4 py-3">Before</th>
                    <th className="px-4 py-3">After</th>
                    <th className="px-4 py-3">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {result.score_changes.map((item) => (
                    <tr
                      key={item.architecture}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {humanize(item.architecture)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-400">
                        {item.original_score}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-200">
                        {item.new_score}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold tabular-nums ${
                          item.change > 0
                            ? "text-emerald-400"
                            : item.change < 0
                              ? "text-rose-400"
                              : "text-slate-400"
                        }`}
                      >
                        {item.change > 0 ? "+" : ""}
                        {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
            <p className="text-sm font-semibold text-teal-200">
              Decision explanation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

interface RequirementFormProps {
  title: string;
  description: string;
  value: ArchitectureRequirements;
  onChange: <K extends keyof ArchitectureRequirements>(
    key: K,
    value: ArchitectureRequirements[K],
  ) => void;
}

function RequirementForm({
  title,
  description,
  value,
  onChange,
}: RequirementFormProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:p-5">
      <h3 className="font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>

      <div className="mt-5 space-y-4">
        <Field label="Application type">
          <input
            className={fieldClass}
            value={value.application_type}
            onChange={(event) =>
              onChange("application_type", event.target.value)
            }
            placeholder="e.g. ecommerce"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Expected users">
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={value.expected_users}
              onChange={(event) =>
                onChange("expected_users", Number(event.target.value))
              }
            />
          </Field>

          <Field label="Team size">
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={value.team_size}
              onChange={(event) =>
                onChange("team_size", Number(event.target.value))
              }
            />
          </Field>
        </div>

        <SelectField
          label="Traffic level"
          value={value.traffic_level}
          onChange={(next) => onChange("traffic_level", next)}
          options={["low", "medium", "high"]}
        />

        <SelectField
          label="Budget"
          value={value.budget}
          onChange={(next) => onChange("budget", next)}
          options={["low", "medium", "high"]}
        />

        <SelectField
          label="Availability requirement"
          value={value.availability_requirement}
          onChange={(next) => onChange("availability_requirement", next)}
          options={["low", "standard", "high", "critical"]}
        />

        <SelectField
          label="Latency requirement"
          value={value.latency_requirement}
          onChange={(next) => onChange("latency_requirement", next)}
          options={["low", "standard", "high"]}
        />

        <div className="space-y-3 border-t border-slate-800 pt-4">
          <ToggleField
            label="Global distribution"
            checked={value.global_distribution}
            onChange={(checked) => onChange("global_distribution", checked)}
          />

          <ToggleField
            label="Real-time requirements"
            checked={value.real_time}
            onChange={(checked) => onChange("real_time", checked)}
          />

          <ToggleField
            label="Compliance required"
            checked={value.compliance_required}
            onChange={(checked) => onChange("compliance_required", checked)}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {humanize(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-teal-400"
      />
    </label>
  );
}

function RecommendationCard({
  title,
  architecture,
  score,
  highlighted = false,
}: {
  title: string;
  architecture: string | null;
  score: number | null;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-teal-500/40 bg-teal-500/5"
          : "border-slate-800 bg-slate-900/50"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-lg font-bold text-slate-100">
        {humanize(architecture)}
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Score:{" "}
        <span className="font-semibold tabular-nums text-teal-300">
          {score ?? "N/A"}
        </span>
      </p>
    </div>
  );
}