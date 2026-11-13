export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ComplexityLevel = 'low' | 'medium' | 'high'

export interface ArchitectureOption {
  id: string
  name: string
  summary: string
  score: number
  complexity: ComplexityLevel
  estimatedCost: string
  scalability: number
  maintainability: number
  performance: number
  security: number
  risks: string[]
  strengths: string[]
  components: string[]
}

export interface ArchitectureAnalysis {

  id: string

  applicationDescription: string

  requirements?: Partial<ArchitectureRequirements>;

  createdAt: string

  recommendation: string

  overallScore: number

  confidence: number

  decisionStrength: 'close' | 'moderate' | 'strong'

  riskLevel: RiskLevel

  estimatedMonthlyCost: string

  keyTradeoffs: string[]

  missingRequirements: string[]

  scoreBreakdown?: Record<string, Record<string, number>>

  decisionDrivers?: {
  criterion: string
  impact: string
  direction: string
  reason: string
}[]

  architecture: ArchitectureOption

  alternatives: ArchitectureOption[]
}

export interface AnalyzeRequest {
  applicationDescription: string
}

export interface ApiError {
  message: string
  status?: number
}


export interface ArchitectureRequirements {
  application_type: string
  expected_users: number
  traffic_level: string
  team_size: number
  budget: string
  availability_requirement: string
  latency_requirement: string
  global_distribution: boolean
  real_time: boolean
  compliance_required: boolean
}

export interface WhatIfRequest {
  current_requirements: ArchitectureRequirements
  modified_requirements: ArchitectureRequirements
}

export interface WhatIfScoreChange {
  architecture: string
  original_score: number
  new_score: number
  change: number
}

export interface WhatIfResponse {
  original_recommendation: string | null
  new_recommendation: string | null
  original_score: number | null
  new_score: number | null
  recommendation_changed: boolean
  score_changes: WhatIfScoreChange[]
  changed_requirements: string[]
  explanation: string
}
