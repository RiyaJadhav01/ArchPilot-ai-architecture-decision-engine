from app.engine.scoring import ArchitectureScoringEngine
from app.schemas.architecture import (
    ArchitectureRequest,
    WhatIfResponse,
    ArchitectureScoreComparison,
)


class WhatIfService:

    def __init__(self):
        self.scoring_engine = ArchitectureScoringEngine()

    def analyze(
        self,
        current_requirements: ArchitectureRequest,
        modified_requirements: ArchitectureRequest,
    ) -> WhatIfResponse:

        # -----------------------------------------
        # 1. Evaluate original requirements
        # -----------------------------------------

        original_decision = self.scoring_engine.evaluate(
            current_requirements
        )

        # -----------------------------------------
        # 2. Evaluate modified requirements
        # -----------------------------------------

        new_decision = self.scoring_engine.evaluate(
            modified_requirements
        )

        # -----------------------------------------
        # 3. Get recommendations
        # -----------------------------------------

        original_architecture = (
            original_decision["recommended_architecture"]
        )

        new_architecture = (
            new_decision["recommended_architecture"]
        )

        # -----------------------------------------
        # 4. Get scores
        # -----------------------------------------

        original_score = round(
            original_decision["scores"][original_architecture]
        )

        new_score = round(
            new_decision["scores"][new_architecture]
        )

        # -----------------------------------------
        # 5. Compare every architecture
        # -----------------------------------------

        architectures = (
            set(original_decision["scores"].keys())
            | set(new_decision["scores"].keys())
        )

        score_changes = []

        for architecture in architectures:

            old_score = round(
                original_decision["scores"].get(
                    architecture,
                    0
                )
            )

            new_score_value = round(
                new_decision["scores"].get(
                    architecture,
                    0
                )
            )

            score_changes.append(
                ArchitectureScoreComparison(
                    architecture=architecture,
                    original_score=old_score,
                    new_score=new_score_value,
                    change=new_score_value - old_score,
                )
            )

        # -----------------------------------------
        # 6. Detect changed requirements
        # -----------------------------------------

        changed_requirements = self._detect_changes(
            current_requirements,
            modified_requirements,
        )

        # -----------------------------------------
        # 7. Determine whether recommendation changed
        # -----------------------------------------

        recommendation_changed = (
            original_architecture != new_architecture
        )

        # -----------------------------------------
        # 8. Generate explanation
        # -----------------------------------------

        explanation = self._generate_explanation(
            original_architecture,
            new_architecture,
            changed_requirements,
            recommendation_changed,
            original_score,
            new_score,
            current_requirements,
            modified_requirements,
            original_decision["scores"],
            new_decision["scores"],
            new_decision.get("ranking"),
        )
       
        if not isinstance(explanation, str):
            explanation = (
                "The analysis completed, but an explanation "
                "could not be generated. Please review the "
                "recommendation and score changes."
            )

        return WhatIfResponse(
            original_recommendation=original_architecture,
            new_recommendation=new_architecture,
            original_score=original_score,
            new_score=new_score,
            recommendation_changed=recommendation_changed,
            score_changes=score_changes,
            changed_requirements=changed_requirements,
            explanation=explanation,
        )

    # =========================================================
    # Detect changed requirements
    # =========================================================

    def _detect_changes(
        self,
        current: ArchitectureRequest,
        modified: ArchitectureRequest,
    ):

        changed = []

        fields = {
            "application_type": "Application Type",
            "expected_users": "Expected Users",
            "traffic_level": "Traffic",
            "team_size": "Team Size",
            "budget": "Budget",
            "availability_requirement": "Availability",
            "latency_requirement": "Latency",
            "global_distribution": "Global Distribution",
            "real_time": "Real-Time Requirements",
            "compliance_required": "Compliance",
        }

        for field, label in fields.items():
            old_value = getattr(current, field)
            new_value = getattr(modified, field)

            if old_value != new_value:
                changed.append(label)

        return changed
    
    
    @staticmethod
    def _format_architecture_name(architecture: str) -> str:
        names = {
            "monolith": "Monolith",
            "modular_monolith": "Modular Monolith",
            "microservices": "Microservices",
        }

        return names.get(
            architecture.lower(),
            architecture.replace("_", " ").title(),
        )
        
        

    # =========================================================
    # Generate deterministic explanation
    # =========================================================

    
    
    def _generate_explanation(
        self,
        original_architecture,
        new_architecture,
        changed_requirements,
        recommendation_changed,
        original_score,
        new_score,
        current_requirements=None,
        modified_requirements=None,
        original_scores=None,
        new_scores=None,
        ranking=None,
    ):
        
    
        if not changed_requirements:
            architecture_name = self._format_architecture_name(
                new_architecture
            )

            return (
                f"No requirements were changed. "
                f"The recommendation remains {architecture_name}."
            )

        explanations = []

        if current_requirements and modified_requirements:

            # Team size
            old = current_requirements.team_size
            new = modified_requirements.team_size

            if old != new and old is not None and new is not None:
                if new > old:
                    explanations.append(
                        f"Team size increased from {old} to {new}. "
                        "A larger team may be better positioned to "
                        "manage the operational and coordination "
                        "overhead of Microservices."
                    )
                else:
                    explanations.append(
                        f"Team size decreased from {old} to {new}. "
                        "A simpler architecture may reduce operational "
                        "and coordination overhead for a smaller team."
                    )

            # Traffic
            old = current_requirements.traffic_level
            new = modified_requirements.traffic_level

            if old != new:
                if new == "high":
                    explanations.append(
                        "Higher traffic increases the potential value "
                        "of independent scaling and workload isolation, "
                        "which can favor Microservices."
                    )
                elif old == "high":
                    explanations.append(
                        "Lower traffic can reduce the need for independent "
                        "service scaling, making simpler architectures "
                        "more attractive."
                    )

            # Expected users
            old = current_requirements.expected_users
            new = modified_requirements.expected_users

            if old != new and old is not None and new is not None:
                if new > old:
                    explanations.append(
                        f"Expected users increased from {old:,} to {new:,}. "
                        "This raises scalability demands and may favor "
                        "architectures that support independent scaling."
                    )
                else:
                    explanations.append(
                        f"Expected users decreased from {old:,} to {new:,}. "
                        "This may reduce scalability pressure and make "
                        "simpler architectures more practical."
                    )

            # Budget
            old = current_requirements.budget
            new = modified_requirements.budget

            if old != new:
                if new == "low":
                    explanations.append(
                        "The lower budget makes infrastructure and "
                        "operational overhead more important, which can "
                        "favor simpler architectures."
                    )
                elif new == "high":
                    explanations.append(
                        "The higher budget provides more flexibility "
                        "for infrastructure and operational complexity."
                    )

            # Availability
            old = current_requirements.availability_requirement
            new = modified_requirements.availability_requirement

            if old != new:
                if new in ("high", "critical"):
                    explanations.append(
                        "Higher availability requirements increase the "
                        "importance of fault isolation and resilient "
                        "service design."
                    )
                elif old in ("high", "critical"):
                    explanations.append(
                        "Lower availability requirements may reduce the "
                        "need for additional resilience and redundancy."
                    )

            # Latency
            old = current_requirements.latency_requirement
            new = modified_requirements.latency_requirement

            if old != new:
                if new in ("high", "critical"):
                    explanations.append(
                        "Stricter latency requirements increase the "
                        "importance of communication overhead and "
                        "performance optimization."
                    )
                elif old in ("high", "critical"):
                    explanations.append(
                        "Less demanding latency requirements provide "
                        "more flexibility in architecture selection."
                    )

            # Global distribution
            old = current_requirements.global_distribution
            new = modified_requirements.global_distribution

            if old != new:
                if new is True:
                    explanations.append(
                        "Global distribution increases the importance "
                        "of regional deployment, latency management, "
                        "and geographically aware scaling."
                    )
                elif new is False:
                    explanations.append(
                        "Removing the global distribution requirement "
                        "reduces the need to account for multiple regions."
                    )

            # Real-time requirements
            old = current_requirements.real_time
            new = modified_requirements.real_time

            if old != new:
                if new is True:
                    explanations.append(
                        "Real-time behavior increases the importance "
                        "of predictable processing latency and suitable "
                        "event-processing patterns."
                    )
                elif new is False:
                    explanations.append(
                        "Removing the real-time requirement can simplify "
                        "processing and communication choices."
                    )

            # Compliance
            old = current_requirements.compliance_required
            new = modified_requirements.compliance_required

            if old != new:
                if new is True:
                    explanations.append(
                        "Compliance requirements increase the importance "
                        "of access control, auditability, and appropriate "
                        "security boundaries."
                    )
                elif new is False:
                    explanations.append(
                        "Removing the compliance requirement may reduce "
                        "some security and audit constraints."
                    )

            # Application type
            old = current_requirements.application_type
            new = modified_requirements.application_type

            if old != new:
                explanations.append(
                    f"Application type changed from {old} to {new}, "
                    "which may alter workload, integration, and "
                    "operational priorities."
                )

         
        # Build an accurate recommendation summary
        original_name = self._format_architecture_name(
            original_architecture
        )
        new_name = self._format_architecture_name(
            new_architecture
        )

        
        if recommendation_changed:
            result = (
                f"The original recommendation was {original_name} "
                f"with a score of {original_score}. "
                f"Under the modified requirements, the recommendation "
                f"changed to {new_name} with a score of {new_score}. "
            )
        else:
            result = (
                f"The recommendation remains {new_name}. "
                f"Its score changed from {original_score} "
                f"to {new_score}. "
            )

            score_change = new_score - original_score

            if score_change > 0:
                result += f"This is an increase of {score_change} points. "
            elif score_change < 0:
                result += (
                    f"This is a decrease of {abs(score_change)} "
                    f"{'point' if abs(score_change) == 1 else 'points'}. "
                )
            else:
                result += "The score is unchanged. "

        
        if recommendation_changed:
            
        # The recommendation and winning score are already stated in result.
                if ranking:
                   # Use the scoring engine's authoritative ranking.
                   ranked_architectures = ranking
                elif new_scores:
                    # Fallback for callers that don't supply a ranking.
                    tie_break_priority = {
                        "monolith": 1,
                        "modular_monolith": 2,
                        "microservices": 3,
                    }

                    ranked_architectures = sorted(
                        new_scores.items(),
                        key=lambda item: (
                            -round(item[1]),
                            tie_break_priority.get(item[0], 99),
                        ),
                    )
                else:
                    ranked_architectures = []

                if len(ranked_architectures) > 1:
                    second_architecture, second_score = ranked_architectures[1]

                    result += (
                        f"{self._format_architecture_name(second_architecture)} "
                        f"ranks second with a score of {round(second_score)}. "
                    )

             # Explain how each architecture's displayed score changed.
                if original_scores and new_scores:
                    score_directions = []

                for architecture in (
                    "monolith",
                    "modular_monolith",
                    "microservices",
                ):
                    old_score = round(
                        original_scores.get(architecture, 0)
                    )
                    new_score_value = round(
                        new_scores.get(architecture, 0)
                    )
                    difference = new_score_value - old_score

                    if difference > 0:
                        score_directions.append(
                            f"{self._format_architecture_name(architecture)} "
                            f"increased by {difference} points"
                        )
                    elif difference < 0:
                        score_directions.append(
                            f"{self._format_architecture_name(architecture)} "
                            f"decreased by {abs(difference)} points"
                        )
                    else:
                        score_directions.append(
                            f"{self._format_architecture_name(architecture)} "
                            "remained unchanged"
                        )

                result += (
                    " Architecture score changes: "
                    + "; ".join(score_directions)
                    + ". "
                )
        if explanations:
            result += " ".join(explanations)
        else:
            result += (
                "No specific requirement-level explanation "
                "was identified for this comparison."
            )

        return result
