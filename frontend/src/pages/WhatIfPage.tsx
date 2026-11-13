
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, GitCompare } from "lucide-react";

import { WhatIfAnalysisPanel } from "../components/results/WhatIfAnalysisPanel";
import {
  getCurrentAnalysis,
  getSavedAnalysisById,
} from "../lib/storage";
import { EmptyState } from "../components/common/EmptyState";
import { Button } from "../components/common/Button";

export function WhatIfPage() {
  const { id } = useParams();

  const currentAnalysis = getCurrentAnalysis();

  const analysis = id
    ? currentAnalysis?.id === id
      ? currentAnalysis
      : getSavedAnalysisById(id)
    : currentAnalysis;

  if (!analysis) {
    return (
      <EmptyState
        icon={<GitCompare />}
        title="No analysis selected"
        description="Run an architecture analysis first, or open a saved analysis before exploring what-if scenarios."
        action={
          <Link to="/">
            <Button>Start new analysis</Button>
          </Link>
        }
      />
    );
  }

  if (!analysis.architecture) {
    return (
      <EmptyState
        icon={<GitCompare />}
        title="Analysis needs more information"
        description="Complete the missing requirements before exploring architecture scenarios."
        action={
          <Link to={`/analysis/${analysis.id}`}>
            <Button>Return to analysis</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Link
          to={`/analysis/${analysis.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to architecture analysis
        </Link>

        <div className="mt-5 flex items-start gap-4">
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-3">
            <GitCompare size={24} className="text-teal-300" />
          </div>

          <div>
            <p className="technical-label text-teal-300">
              Scenario workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
              What-If Analysis
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Explore how changes in traffic, team size, budget, and
              operational requirements affect your architecture decision.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Current analysis
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {analysis.applicationDescription}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-500">
            Current recommendation:
          </span>
          <span className="rounded-lg border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 font-semibold text-teal-300">
            {analysis.architecture.name}
          </span>
          <span className="text-slate-500">
            Score:{" "}
            <strong className="text-slate-200">
              {analysis.overallScore}
            </strong>
          </span>
        </div>
      </section>

      <WhatIfAnalysisPanel analysis={analysis} />
    </div>
  );
}