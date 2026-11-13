import { ArrowDown, Box, Database, Server, Shield } from "lucide-react";

import type { ArchitectureOption } from "../../types/architecture";

const componentDescriptions: Record<string, string> = {
  "API Layer": "Handles incoming application requests",
  "Business Modules": "Contains core business logic",
  "Authentication Module": "Manages user authentication",
  "Database": "Stores and retrieves application data",
  "Background Jobs": "Processes asynchronous tasks",

  "Web Application": "Provides the user interface",
  "Application Logic": "Handles application operations",
  "Authentication": "Manages access and identity",

  "API Gateway": "Routes requests to appropriate services",
  "Authentication Service": "Handles identity and access control",
  "User Service": "Manages user-related operations",
  "Business Services": "Handles independent business capabilities",
  "Message Broker": "Manages asynchronous communication",
  "Service Databases": "Stores service-specific data",
  "Monitoring and Logging": "Tracks system health and activity",
};

interface ArchitectureDiagramProps {
  architecture: ArchitectureOption;
}

export function ArchitectureDiagram({
  architecture,
}: ArchitectureDiagramProps) {
  const components = architecture.components;

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6">
        <p className="technical-label text-slate-600">
          Architecture visualization
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-100">
          {architecture.name}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Logical component view of the recommended architecture.
        </p>
      </div>

      {/* Diagram */}
      <div className="overflow-x-auto">
        <div className="mx-auto flex min-w-[700px] flex-col items-center py-6">
          {components.map((component, index) => (
            <div
              key={`${component}-${index}`}
              className="flex w-full flex-col items-center"
            >
              <ArchitectureNode
                label={component}
                description={
                  componentDescriptions[component] ?? "Architecture component"
                }
              />

              {index < components.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <div className="h-6 w-px bg-slate-700" />

                  <ArrowDown
                    size={16}
                    className="text-teal-400"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-800 pt-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Application component
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          Logical connection
        </span>
      </div>
    </section>
  );
}

function ArchitectureNode({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const Icon = getComponentIcon(label);

  return (
    <div className="group flex w-full max-w-md items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-4 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-teal-400">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-100">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
    </div>
  );
}

function getComponentIcon(label: string) {
  const value = label.toLowerCase();

  if (
    value.includes("database") ||
    value.includes("databases")
  ) {
    return Database;
  }

  if (
    value.includes("authentication") ||
    value.includes("auth") ||
    value.includes("security")
  ) {
    return Shield;
  }

  if (
    value.includes("service") ||
    value.includes("application") ||
    value.includes("api")
  ) {
    return Server;
  }

  return Box;
}