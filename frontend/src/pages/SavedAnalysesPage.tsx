import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  GitCompareArrows,
  Trash2,
} from "lucide-react";

import { getSavedAnalyses, removeSavedAnalysis } from "../lib/storage";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";

export function SavedAnalysesPage() {
  const analyses = getSavedAnalyses();

  if (!analyses.length) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="No saved analyses"
        description="Your saved architecture decisions will appear here."
        action={
          <Link to="/">
            <Button>Start new analysis</Button>
          </Link>
        }
      />
    );
  }

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved analysis?"
    );

    if (!confirmed) return;

    removeSavedAnalysis(id);

    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="technical-label text-teal-400">
          Decision history
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Saved analyses
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review previous architecture decisions and reopen their
              detailed analysis.
            </p>
          </div>

          <Link to="/">
            <Button>
              New analysis
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Saved analyses"
          value={analyses.length}
        />

        <SummaryCard
          label="Average score"
          value={`${Math.round(
            analyses.reduce(
              (sum, analysis) => sum + analysis.overallScore,
              0
            ) / analyses.length
          )}/100`}
        />

        <SummaryCard
          label="Latest decision"
          value={analyses[0]?.recommendation ?? "—"}
        />
      </section>

      {/* Saved analyses */}
      <section>
        <div className="mb-4">
          <p className="technical-label text-slate-600">
            Analysis history
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Previous decisions
          </h2>
        </div>

        <div className="space-y-4">
          {analyses.map((analysis) => (
            <article
              key={analysis.id}
              className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 shadow-soft transition hover:border-slate-700"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Main information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-100">
                      {analysis.recommendation}
                    </h3>

                    <StatusBadge level={analysis.riskLevel} />
                  </div>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {analysis.applicationDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} />
                      {formatDate(analysis.createdAt)}
                    </span>

                    <span>
                      Confidence:{" "}
                      <strong className="text-slate-400">
                        {analysis.confidence}%
                      </strong>
                    </span>

                    <span>
                      Decision:{" "}
                      <strong className="capitalize text-slate-400">
                        {analysis.decisionStrength}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 lg:w-28 lg:text-center">
                  <p className="text-3xl font-bold text-teal-300">
                    {analysis.overallScore}
                  </p>

                  <p className="technical-label text-slate-600">
                    score
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <Link to={`/analysis/${analysis.id}`}>
                    <Button variant="secondary">
                      View
                      <ArrowRight size={15} />
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(analysis.id)}
                    aria-label="Delete saved analysis"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Comparison */}
      {analyses.length >= 2 && (
        <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <GitCompareArrows
                size={20}
                className="mt-1 text-teal-400"
              />

              <div>
                <p className="technical-label text-slate-600">
                  Compare decisions
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-100">
                  Review your saved architecture decisions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Compare the architecture candidates from your latest
                  saved analysis.
                </p>
              </div>
            </div>

            <Link
              to="/comparison"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 transition hover:text-teal-300"
            >
              Open comparison
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}