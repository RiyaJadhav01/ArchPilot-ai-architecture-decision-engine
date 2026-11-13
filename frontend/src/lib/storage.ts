import type { ArchitectureAnalysis } from '../types/architecture'

const SAVED_KEY = 'archpilot:saved-analyses'
const CURRENT_KEY = 'archpilot:current-analysis'

export function getSavedAnalyses(): ArchitectureAnalysis[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as ArchitectureAnalysis[]
  } catch {
    return []
  }
}

export function saveAnalysis(analysis: ArchitectureAnalysis): boolean {
  const current = getSavedAnalyses();

  const alreadySaved = current.some(
    (item) => item.id === analysis.id
  );

  if (alreadySaved) {
    return false;
  }

  localStorage.setItem(
    "archpilot:saved-analyses",
    JSON.stringify([analysis, ...current])
  );

  return true;
}

export function getSavedAnalysisById(
  id: string
): ArchitectureAnalysis | null {
  const analyses = getSavedAnalyses();

  return analyses.find((analysis) => analysis.id === id) ?? null;
}

export function removeSavedAnalysis(id: string): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(getSavedAnalyses().filter((item) => item.id !== id)))
}

export function setCurrentAnalysis(analysis: ArchitectureAnalysis): void {
  sessionStorage.setItem(CURRENT_KEY, JSON.stringify(analysis))
}

export function getCurrentAnalysis(): ArchitectureAnalysis | null {
  try {
    const value = sessionStorage.getItem(CURRENT_KEY)
    return value ? (JSON.parse(value) as ArchitectureAnalysis) : null
  } catch {
    return null
  }
}
