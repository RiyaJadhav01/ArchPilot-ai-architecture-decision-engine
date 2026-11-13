import type { ReactNode } from "react";
import {
  Check,
  GitCompareArrows,
  Shield,
  Gauge,
  Wrench,
  Zap,
  Server,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getSavedAnalyses } from "../lib/storage";
import { EmptyState } from "../components/common/EmptyState";
import { Button } from "../components/common/Button";

export function ComparisonPage() {
  const saved = getSavedAnalyses();

  if (!saved.length) {
    return (
      <EmptyState
        icon={<GitCompareArrows />}
        title="Nothing to compare yet"
        description="Save an architecture analysis first to compare the recommended architecture with its alternatives."
        action={
          <Link to="/">
            <Button>New analysis</Button>
          </Link>
        }
      />
    );
  }

  // Compare the most recently saved analysis.
  const analysis = saved[0];

  const options = [analysis.architecture, ...analysis.alternatives];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="technical-label text-teal-400">
          Decision workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
          Architecture comparison
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Compare the architecture candidates for your application across
          scalability, maintainability, performance, security, complexity,
          and estimated cost.
        </p>
      </section>

      {/* Application Context */}
      <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
        <p className="technical-label text-slate-600">
          Application being evaluated
        </p>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
          {analysis.applicationDescription}
        </p>
      </section>

      {/* Recommendation */}
      <section className="rounded-2xl border border-teal-500/30 bg-teal-500/[0.04] p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="technical-label text-teal-400">
              Engine recommendation
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-100">
              {analysis.recommendation}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Recommended based on the requirements provided for this
              application.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-4xl font-bold text-teal-300">
              {analysis.overallScore}
            </p>

            <p className="technical-label text-slate-600">
              architecture score
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <div className="mb-4">
          <p className="technical-label text-slate-600">
            Candidate evaluation
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Side-by-side comparison
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0b1120] shadow-soft">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="w-48 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Dimension
                </th>

                {options.map((option) => (
                  <th
                    key={option.id}
                    className="px-5 py-5 text-left align-top"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-slate-100">
                          {option.name}
                        </p>

                        {option.id === analysis.architecture.id && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                            <Check size={11} />
                            Recommended
                          </span>
                        )}
                      </div>

                      <span className="text-2xl font-bold text-teal-300">
                        {option.score}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <ComparisonRow
                icon={<Gauge size={15} />}
                label="Scalability"
                options={options}
                getValue={(option) => `${option.scalability}%`}
              />

              <ComparisonRow
                icon={<Wrench size={15} />}
                label="Maintainability"
                options={options}
                getValue={(option) => `${option.maintainability}%`}
              />

              <ComparisonRow
                icon={<Zap size={15} />}
                label="Performance"
                options={options}
                getValue={(option) => `${option.performance}%`}
              />

              <ComparisonRow
                icon={<Shield size={15} />}
                label="Security"
                options={options}
                getValue={(option) => `${option.security}%`}
              />

              <ComparisonRow
                icon={<Server size={15} />}
                label="Complexity"
                options={options}
                getValue={(option) => option.complexity}
              />

              <ComparisonRow
                label="Estimated cost"
                options={options}
                getValue={(option) => option.estimatedCost}
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* Decision Summary */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
          <p className="technical-label text-slate-600">
            Decision strength
          </p>

          <h2 className="mt-2 text-xl font-bold capitalize text-slate-100">
            {analysis.decisionStrength}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This indicates how clearly the recommended architecture
            outscored the alternatives.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
          <p className="technical-label text-slate-600">
            Confidence
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-100">
            {analysis.confidence}%
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Higher confidence means more of the requirements needed by the
            decision engine were explicitly provided.
          </p>
        </div>
      </section>

      {/* Back */}
      <div>
        <Link
          to={`/analysis/${analysis.id}`}
          className="text-sm font-semibold text-teal-400 transition hover:text-teal-300"
        >
          ← Back to analysis
        </Link>
      </div>
    </div>
  );
}

function ComparisonRow({
  icon,
  label,
  options,
  getValue,
}: {
  icon?: ReactNode;
  label: string;
  options: {
    id: string;
    scalability: number;
    maintainability: number;
    performance: number;
    security: number;
    complexity: string;
    estimatedCost: string;
  }[];
  getValue: (option: {
    id: string;
    scalability: number;
    maintainability: number;
    performance: number;
    security: number;
    complexity: string;
    estimatedCost: string;
  }) => string;
}) {
  return (
    <tr className="border-b border-slate-800 last:border-b-0">
      <td className="px-5 py-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          {icon}
          {label}
        </div>
      </td>

      {options.map((option) => (
        <td
          key={option.id}
          className="px-5 py-5 text-sm font-semibold capitalize text-slate-200"
        >
          {getValue(option)}
        </td>
      ))}
    </tr>
  );
}