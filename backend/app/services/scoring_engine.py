from typing import Dict, Any, List
from app.models.requirements import SystemRequirements, TrafficLevel, BudgetLevel
from app.services.rule_loader import load_architecture_rules

class ScoringEngine:
    def __init__(self):
        self.rules = load_architecture_rules()
        # Configurable weights as outlined in your master plan
        self.weights = {
            "scalability": 0.25,
            "cost": 0.15,
            "complexity": 0.15,
            "team_fit": 0.15,
            "performance": 0.15,
            "reliability": 0.15
        }

    def evaluate_architectures(self, reqs: SystemRequirements) -> List[Dict[str, Any]]:
        results = []

        for arch_key, arch_data in self.rules.items():
            scores = self._calculate_dimension_scores(arch_key, reqs)
            
            # Calculate weighted overall score (out of 10)
            overall_score = sum(
                scores[dim] * self.weights[dim] for dim in self.weights
            )

            results.append({
                "architecture_key": arch_key,
                "name": arch_data["name"],
                "description": arch_data["description"],
                "scores": scores,
                "overall_score": round(overall_score, 2),
                "reasons": self._generate_reasons(arch_key, reqs),
                "tradeoffs": {
                    "advantages": arch_data.get("strengths", []),
                    "disadvantages": arch_data.get("weaknesses", [])
                }
            })

        # Rank architectures from highest to lowest overall score
        results.sort(key=lambda x: x["overall_score"], reverse=True)
        return results

    def _calculate_dimension_scores(self, arch_key: str, reqs: SystemRequirements) -> Dict[str, float]:
        # Deterministic heuristic baseline scoring rules
        scores = {
            "scalability": 7.0,
            "cost": 7.0,
            "complexity": 7.0,
            "team_fit": 7.0,
            "performance": 7.0,
            "reliability": 7.0
        }

        # 1. Team Size / Complexity Alignment
        if arch_key == "modular_monolith":
            if reqs.team_size <= 6:
                scores["team_fit"] = 9.5
                scores["complexity"] = 8.5
            else:
                scores["team_fit"] = 7.0
            if reqs.traffic_level in [TrafficLevel.high, TrafficLevel.very_high, TrafficLevel.extreme]:
                scores["scalability"] = 7.5
            else:
                scores["scalability"] = 8.5
                
        elif arch_key == "microservices":
            if reqs.team_size >= 8:
                scores["team_fit"] = 9.0
                scores["complexity"] = 6.0
            else:
                scores["team_fit"] = 5.0  # Penalty for small teams
                scores["complexity"] = 4.0  # High operational tax
            if reqs.traffic_level in [TrafficLevel.high, TrafficLevel.very_high, TrafficLevel.extreme]:
                scores["scalability"] = 9.5
            else:
                scores["scalability"] = 8.0
                scores["cost"] = 5.0      # Expensive overhead

        elif arch_key == "monolith":
            if reqs.team_size <= 4:
                scores["team_fit"] = 9.0
                scores["complexity"] = 9.0
            else:
                scores["team_fit"] = 6.0
            if reqs.traffic_level in [TrafficLevel.high, TrafficLevel.very_high]:
                scores["scalability"] = 4.5  # Bottleneck warning
            else:
                scores["scalability"] = 7.0

        elif arch_key == "serverless":
            if reqs.team_size <= 6:
                scores["team_fit"] = 8.5
            if reqs.budget == BudgetLevel.low:
                scores["cost"] = 9.0
            scores["scalability"] = 8.5
            scores["complexity"] = 6.5

        elif arch_key == "event_driven":
            if reqs.real_time or reqs.app_complexity == "high":
                scores["performance"] = 9.0
                scores["scalability"] = 9.0
                scores["complexity"] = 5.0
            else:
                scores["complexity"] = 4.0
                scores["team_fit"] = 6.0

        # Normalize scores to stay cleanly within 1.0 - 10.0 range
        return {k: max(1.0, min(10.0, float(v))) for k, v in scores.items()}

    def _generate_reasons(self, arch_key: str, reqs: SystemRequirements) -> List[str]:
        reasons = []
        if arch_key == "modular_monolith" and reqs.team_size <= 6:
            reasons.append("Matches your small team size, keeping deployment overhead low.")
        if arch_key == "microservices" and reqs.team_size >= 8:
            reasons.append("Suited for larger teams requiring independent domain scaling.")
        if arch_key == "serverless" and reqs.budget in [BudgetLevel.low, BudgetLevel.medium]:
            reasons.append("Pay-as-you-go cost structure fits your budget profile.")
        if arch_key == "monolith" and reqs.expected_users < 10000:
            reasons.append("Simple lifecycle management minimizes time-to-market for early-stage scope.")
        if not reasons:
            reasons.append("Evaluated against general workload constraints and resource allocation.")
        return reasons