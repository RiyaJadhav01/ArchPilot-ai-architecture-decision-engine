
export function formatArchitectureName(
  value: string | null | undefined,
): string {
  if (!value) return "Not available";

  const names: Record<string, string> = {
    monolith: "Monolith",
    modular_monolith: "Modular Monolith",
    microservices: "Microservices",
  };

  const normalized = value.trim().toLowerCase();

  return (
    names[normalized] ??
    normalized
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}