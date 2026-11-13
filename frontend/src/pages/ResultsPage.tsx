import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Bookmark, Lightbulb, AlertTriangle } from "lucide-react";
import { ArchitectureDiagram } from "../components/diagram/ArchitectureDiagram";

import { getCurrentAnalysis, getSavedAnalysisById, saveAnalysis, } from "../lib/storage";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { ScoreCard } from "../components/results/ScoreCard";
import { ArchitectureCard } from "../components/results/ArchitectureCard";
import { Button } from "../components/common/Button";

const CRITERION_WEIGHTS: Record<string, number> = {
  traffic_level: 20,
  expected_users: 15,
  team_size: 15,
  availability: 15,
  budget: 10,
  latency: 5,
  global_distribution: 5,
  real_time: 5,
  compliance: 5,
  application_type: 5,
};

export function ResultsPage() {
  const { id } = useParams();
  const currentAnalysis = getCurrentAnalysis()

const analysis =
  currentAnalysis?.id === id
    ? currentAnalysis
    : id
      ? getSavedAnalysisById(id)
      : null

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "already-saved" | "error"
  >("idle");

  if (!analysis || analysis.id !== id) {
    return (
      <EmptyState
        icon={<Lightbulb />}
        title="Analysis not found"
        description="Start a new analysis or open this result from your saved analyses."
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
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
          >
            <ArrowLeft size={16} />
            New analysis
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Analysis needs more information
            </h1>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {analysis.applicationDescription}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-500/20 bg-[#0b1120] p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Insufficient requirements
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-100">
              We need more information to recommend an architecture
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              The current requirements are not detailed enough for the decision
              engine to make a reliable architecture recommendation.
            </p>
          </div>
        </div>

        {(analysis.missingRequirements?.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-200">
              Please provide information about:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.missingRequirements.map((requirement) => (
                <span
                  key={requirement}
                  className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm capitalize text-slate-300"
                >
                  {requirement.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link to="/">
            <Button>
              Provide more requirements
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

const recommended = analysis.architecture;

  const handleSaveAnalysis = () => {
  try {
    const wasSaved = saveAnalysis(analysis);

    if (wasSaved) {
      setSaveStatus("success");
    } else {
      setSaveStatus("already-saved");
    }

    setTimeout(() => {
      setSaveStatus("idle");
    }, 3000);
  } catch (error) {
    console.error("Failed to save analysis:", error);
    setSaveStatus("error");

    setTimeout(() => {
      setSaveStatus("idle");
    }, 3000);
  }
};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
          >
            <ArrowLeft size={16} />
            New analysis
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Architecture analysis
            </h1>

            <StatusBadge level={analysis.riskLevel} />
          
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {analysis.applicationDescription}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <Button variant="secondary" onClick={handleSaveAnalysis}>
            <Bookmark size={16} />
            Save analysis
          </Button>

        {saveStatus === "success" && (
          <p className="mt-2 text-sm text-emerald-400">
            ✓ Analysis saved successfully
          </p>
        )}

      {saveStatus === "already-saved" && (
        <p className="mt-2 text-sm text-amber-400">
          ✓ Analysis already saved
        </p>
      )}

      {saveStatus === "error" && (
        <p className="mt-2 text-sm text-red-400">
          ✕ Couldn't save analysis. Please try again.
        </p>
      )}
    </div>

  </div>

      {/* KPI Cards */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <ScoreCard
    label="Overall score"
    value={`${analysis.overallScore}/100`}
    detail="Architecture fit"
  />

  <ScoreCard
    label="Confidence"
    value={`${analysis.confidence}%`}
    detail="Requirement completeness"
  />

  <ScoreCard
    label="Decision strength"
    value={analysis.decisionStrength}
    detail="Difference between options"
  />

  <ScoreCard
    label="Risk"
    value={analysis.riskLevel}
    detail="Overall risk level"
  />
</div>

{/* Information Gaps */}
{(analysis.missingRequirements?.length ?? 0) > 0 && (
  <section className="rounded-2xl border border-amber-500/20 bg-[#0b1120] p-6 shadow-soft">
    <div className="flex items-start gap-3">
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0 text-amber-400"
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Information gaps
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-100">
          Missing requirements
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          These requirements were not specified in the application
          description, so the decision engine did not assume values for them.
        </p>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-2">
      {(analysis.missingRequirements ?? []).map((requirement) => (
        <span
          key={requirement}
          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm capitalize text-slate-300"
        >
          {requirement.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  </section>
)}

      {/* Recommended Architecture */}
<section className="rounded-2xl border border-teal-500/30 bg-[#0b1120] p-6 shadow-soft">
  <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
    Recommended architecture
  </p>

  <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
    <div>
      <h2 className="text-2xl font-bold text-slate-100">
        {analysis.recommendation}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {recommended.summary}
      </p>
    </div>

    <div className="shrink-0 text-left md:text-right">
      <p className="text-4xl font-bold text-teal-300">
        {recommended.score}
      </p>

      <p className="technical-label text-slate-600">
        architecture score
      </p>

      <p className="mt-3 text-sm text-slate-500">
        Estimated cost
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {analysis.estimatedMonthlyCost}
      </p>
    </div>
  </div>
</section>
      {/* Architecture Details */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Architecture details
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Technical characteristics
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailMetric label="Scalability" value={recommended.scalability} />

          <DetailMetric
            label="Maintainability"
            value={recommended.maintainability}
          />

          <DetailMetric label="Performance" value={recommended.performance} />

          <DetailMetric label="Security" value={recommended.security} />
        </div>
      </section>

      {/* Architecture Visualization */}
<ArchitectureDiagram architecture={recommended} />

      {/* Why this architecture */}
  <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
    <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
      Why this architecture?
    </p>

  <div className="mt-1 flex flex-col justify-between gap-2 md:flex-row md:items-end">
    <div>
      <h2 className="text-xl font-bold text-slate-100">
        Decision reasoning
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        The recommendation is based on how your requirements score against
        each architecture and which requirements have the strongest influence
        on the final decision.
      </p>
    </div>

    <div className="shrink-0">
      <span className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-sm font-semibold text-teal-300">
        {recommended.score}/100 fit
      </span>
    </div>
  </div>

    {/* Score Breakdown */}
    {analysis.scoreBreakdown?.[recommended.id] && (
      <div className="mt-7">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Score breakdown
          </p>

        <h3 className="mt-1 text-lg font-semibold text-slate-200">
          How the score was calculated
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(analysis.scoreBreakdown[recommended.id]).map(
          ([criterion, contribution]) => (
            <div key={criterion}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium capitalize text-slate-300">
                  {criterion.replace(/_/g, " ")}
                </span>

                <span className="font-mono text-sm font-semibold text-teal-300">
                  +{Number(contribution).toFixed(2)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-400 transition-all"
                  style={{
                    width: `${
                      CRITERION_WEIGHTS[criterion] !== undefined
                        ? Math.min(
                            100,
                            (Number(contribution) / CRITERION_WEIGHTS[criterion]) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )}

  {/* Decision Drivers */}
  {(analysis.decisionDrivers?.length ?? 0) > 0 && (
    <div className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Decision drivers
        </p>

        <h3 className="mt-1 text-lg font-semibold text-slate-200">
          How requirements align with each architecture
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(analysis.decisionDrivers ?? []).map((driver, index) => (
          <div
            key={`${driver.criterion}-${index}`}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {driver.criterion}
                </p>

                <p className="mt-1 text-xs uppercase tracking-wide text-teal-400">
                  {driver.impact} impact
                </p>
              </div>

              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                {driver.direction}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {driver.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Key reasoning */}
  {analysis.keyTradeoffs?.length > 0 && (
    <div className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Key reasoning
        </p>

        <h3 className="mt-1 text-lg font-semibold text-slate-200">
          What this means for your system
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {analysis.keyTradeoffs.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-400"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )}
</section>

      {/* Risks & Trade-offs */}
      <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Risks & trade-offs
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-100">
              Things to consider
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {recommended.risks.map((risk) => (
            <div
              key={risk}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-400"
            >
              {risk}
            </div>
          ))}
        </div>
      </section>

      {/* Alternative Architectures */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Alternative architectures
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-100">
              Other viable options
            </h2>
          </div>

          <Link
            to="/comparison"
            className="font-mono-ui text-xs font-semibold uppercase tracking-wide text-teal-400 hover:text-teal-300"
          >
            Compare saved →
          </Link>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {(analysis.alternatives ?? []).map((option) => (
            <ArchitectureCard key={option.id} option={option} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>

        <strong className="text-lg text-slate-100">{value}%</strong>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-teal-400 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
