from app.schemas.architecture import ArchitectureRequest
from app.engine.architecture_profiles import get_architecture_profile


class ArchitectureScoringEngine:
    """
    Deterministic architecture decision engine.

    The LLM extracts requirements.
    This engine makes the actual architecture decision.

    Architectures evaluated in the MVP:
    - Monolith
    - Modular Monolith
    - Microservices
    """

    def __init__(self):
        self.architectures = [
            "monolith",
            "modular_monolith",
            "microservices",
        ]

    def evaluate(self, request: ArchitectureRequest) -> dict:
        # ============================================================
        # WEIGHTS
        # ============================================================

        weights = {
            "traffic": 20,
            "expected_users": 15,
            "team_size": 15,
            "availability": 15,
            "budget": 10,
            "latency": 5,
            "global_distribution": 5,
            "real_time": 5,
            "compliance": 5,
            "application_type": 5,
        }

        # ============================================================
        # BASE SCORES
        # ============================================================

        scores = {
            architecture: 0
            for architecture in self.architectures
        }
        
        score_breakdown = {
            architecture: {}
            for architecture in self.architectures
        }

        reasons = {
            architecture: []
            for architecture in self.architectures
        }

        # ============================================================
        # HELPER
        # ============================================================

        def add_weighted_score(
            criterion: str,
            criterion_scores: dict,
            weight: int,
        ):
            for architecture in self.architectures:
                contribution = (
                    criterion_scores[architecture] * weight / 100
                )

                scores[architecture] += contribution

                score_breakdown[architecture][criterion] = round(
                    contribution,
                    2,
                )

        # ============================================================
        # 1. TRAFFIC
        # ============================================================

        if request.traffic_level == "low":
            criterion_scores = {
                "monolith": 95,
                "modular_monolith": 85,
                "microservices": 55,
            }

            reasons["monolith"].append(
                "Low traffic does not require distributed services."
            )

            reasons["microservices"].append(
                "Distributed services may add unnecessary complexity at low traffic."
            )

        elif request.traffic_level == "medium":
            criterion_scores = {
                "monolith": 75,
                "modular_monolith": 90,
                "microservices": 75,
            }

            reasons["modular_monolith"].append(
                "Moderate traffic benefits from clear internal module boundaries."
            )

        elif request.traffic_level == "high":
            criterion_scores = {
                "monolith": 40,
                "modular_monolith": 85,
                "microservices": 95,
            }

            reasons["modular_monolith"].append(
                "High traffic requires stronger scalability while retaining manageable complexity."
            )

            reasons["microservices"].append(
                "High traffic increases the value of independently scalable services."
            )

        else:
            criterion_scores = {
                architecture: 70
                for architecture in self.architectures
            }

        add_weighted_score(
        "traffic",
        criterion_scores,
        weights["traffic"],
    )

        # ============================================================
        # 2. EXPECTED USERS
        # ============================================================

        if request.expected_users is not None:

            if request.expected_users < 1_000:
                criterion_scores = {
                    "monolith": 95,
                    "modular_monolith": 85,
                    "microservices": 50,
                }

                reasons["monolith"].append(
                    "A small user base usually does not justify distributed-service complexity."
                )

            elif request.expected_users < 100_000:
                criterion_scores = {
                    "monolith": 80,
                    "modular_monolith": 90,
                    "microservices": 70,
                }

                reasons["modular_monolith"].append(
                    "A growing user base benefits from modular structure without full distributed-system overhead."
                )

            elif request.expected_users < 1_000_000:
                criterion_scores = {
                    "monolith": 55,
                    "modular_monolith": 85,
                    "microservices": 90,
                }

                reasons["microservices"].append(
                    "A large user base increases the value of independently scalable services."
                )

            else:
                criterion_scores = {
                    "monolith": 35,
                    "modular_monolith": 75,
                    "microservices": 95,
                }

                reasons["microservices"].append(
                    "A very large user base strongly favors independently scalable services."
                )

        else:
            criterion_scores = {
                architecture: 70
                for architecture in self.architectures
            }

        # IMPORTANT:
        # This must happen for ALL expected-user cases.
        add_weighted_score(
        "expected_users",
        criterion_scores,
        weights["expected_users"],
    )

        # ============================================================
        # 3. TEAM SIZE
        # ============================================================

        if request.team_size is not None:

            if request.team_size <= 3:
                criterion_scores = {
                    "monolith": 95,
                    "modular_monolith": 85,
                    "microservices": 45,
                }

                reasons["monolith"].append(
                    "A small team benefits from simpler deployment and operations."
                )

                reasons["microservices"].append(
                    "A small team may struggle with the operational complexity of multiple services."
                )

            elif request.team_size <= 8:
                criterion_scores = {
                    "monolith": 85,
                    "modular_monolith": 95,
                    "microservices": 70,
                }

                reasons["modular_monolith"].append(
                    "A medium-sized team can maintain clear module boundaries without distributed-service overhead."
                )

            else:
                criterion_scores = {
                    "monolith": 65,
                    "modular_monolith": 85,
                    "microservices": 95,
                }

                reasons["microservices"].append(
                    "Larger teams can benefit from independently owned services."
                )

        else:
            criterion_scores = {
                architecture: 70
                for architecture in self.architectures
            }

        add_weighted_score(
            "team_size",
            criterion_scores,
            weights["team_size"],
        )

        # ============================================================
        # 4. AVAILABILITY
        # ============================================================

        if request.availability_requirement == "low":
            criterion_scores = {
                "monolith": 90,
                "modular_monolith": 85,
                "microservices": 65,
            }

        elif request.availability_requirement == "standard":
            criterion_scores = {
                "monolith": 80,
                "modular_monolith": 90,
                "microservices": 80,
            }

        elif request.availability_requirement == "high":
            criterion_scores = {
                "monolith": 55,
                "modular_monolith": 85,
                "microservices": 95,
            }

            reasons["microservices"].append(
                "High availability increases the value of fault isolation."
            )

        elif request.availability_requirement == "critical":
            criterion_scores = {
                "monolith": 35,
                "modular_monolith": 75,
                "microservices": 98,
            }

            reasons["microservices"].append(
                "Critical availability strongly favors fault isolation and independent scaling."
            )

        else:
            criterion_scores = {
                architecture: 70
                for architecture in self.architectures
            }

        add_weighted_score(
        "availability",
        criterion_scores,
        weights["availability"],
    )


        # ============================================================
        # 5. BUDGET
        # ============================================================

        if request.budget == "low":
            criterion_scores = {
                "monolith": 95,
                "modular_monolith": 90,
                "microservices": 50,
            }

            reasons["monolith"].append(
                "Low budget favors simpler infrastructure and operations."
            )

            reasons["microservices"].append(
                "Microservices generally require more infrastructure and operational investment."
            )

        elif request.budget == "medium":
            criterion_scores = {
                "monolith": 85,
                "modular_monolith": 90,
                "microservices": 75,
            }

        elif request.budget == "high":
            criterion_scores = {
                "monolith": 75,
                "modular_monolith": 85,
                "microservices": 95,
            }

            reasons["microservices"].append(
                "A higher infrastructure budget makes distributed architecture more feasible."
            )

        else:
            criterion_scores = {
                architecture: 70
                for architecture in self.architectures
            }

        add_weighted_score(
        "budget",
        criterion_scores,
        weights["budget"],
    )

        # ============================================================
        # 6. LATENCY
        # ============================================================

        if request.latency_requirement == "critical":
            criterion_scores = {
                "monolith": 95,
                "modular_monolith": 95,
                "microservices": 75,
            }

            reasons["monolith"].append(
                "A simpler architecture can reduce distributed network communication."
            )

            reasons["microservices"].append(
                "Additional service-to-service communication can introduce network latency."
            )

        elif request.latency_requirement == "high":
            criterion_scores = {
                "monolith": 90,
                "modular_monolith": 90,
                "microservices": 80,
            }
            

        elif request.latency_requirement == "standard":
            criterion_scores = {
                "monolith": 85,
                "modular_monolith": 90,
                "microservices": 85,
            }

        else:
            criterion_scores = {
                architecture: 80
                for architecture in self.architectures
            }

        add_weighted_score(
        "latency",
        criterion_scores,
        weights["latency"],
    )
        
        
        # ============================================================
        # 7. REAL-TIME
        # ============================================================

        if request.real_time is True:
            criterion_scores = {
                "monolith": 70,
                "modular_monolith": 90,
                "microservices": 90,
            }

            reasons["modular_monolith"].append(
                "Real-time functionality can be implemented without immediately requiring distributed services."
            )

            reasons["microservices"].append(
                "Distributed services can support independently scalable real-time workloads."
            )

        else:
            criterion_scores = {
                "monolith": 90,
                "modular_monolith": 90,
                "microservices": 80,
            }

        add_weighted_score(
            "real_time",
            criterion_scores,
            weights["real_time"],
        )

        # ============================================================
        # 8. GLOBAL DISTRIBUTION
        # ============================================================

        if request.global_distribution is True:
            criterion_scores = {
                "monolith": 45,
                "modular_monolith": 75,
                "microservices": 98,
            }

            reasons["microservices"].append(
                "Global distribution strongly increases the value of independently scalable services."
            )

        else:
            criterion_scores = {
                "monolith": 90,
                "modular_monolith": 90,
                "microservices": 75,
            }

        add_weighted_score(
        "global_distribution",
        criterion_scores,
        weights["global_distribution"],
    )

        # ============================================================
        # 9. COMPLIANCE
        # ============================================================

        if request.compliance_required is True:
            criterion_scores = {
                "monolith": 65,
                "modular_monolith": 85,
                "microservices": 90,
            }

            reasons["modular_monolith"].append(
                "Clear module boundaries can simplify separation of sensitive domains."
            )

            reasons["microservices"].append(
                "Service boundaries can help isolate sensitive workloads and responsibilities."
            )

        else:
            criterion_scores = {
                architecture: 85
                for architecture in self.architectures
            }

        add_weighted_score(
        "compliance",
        criterion_scores,
        weights["compliance"],
    )

        # ============================================================
        # 10. APPLICATION TYPE
        # ============================================================

        # Application type is intentionally neutral in the MVP.
        # Domain-specific rules can be added later.

        criterion_scores = {
            architecture: 70
            for architecture in self.architectures
        }

        add_weighted_score(
        "application_type",
        criterion_scores,
        weights["application_type"],
    )

         
        # ============================================================
        # RANK ARCHITECTURES WITH EXPLICIT TIE-BREAKING
        # ============================================================

        # Primary rule: highest score wins.
        # Tie-break rule: prefer the simpler architecture.
        tie_break_priority = {
            "monolith": 1,
            "modular_monolith": 2,
            "microservices": 3,
        }
        
        # Round scores first so ranking matches the displayed scores.
        display_scores = {
            architecture: round(score)
            for architecture, score in scores.items()
        }

        tie_break_priority = {
            "monolith": 1,
            "modular_monolith": 2,
            "microservices": 3,
        }

        ranking = sorted(
            scores.items(),
            key=lambda item: (
                -display_scores[item[0]],
                tie_break_priority[item[0]],
            ),
        )

    
        
        # ============================================================
        # ROUND SCORES
        # ============================================================

        scores = {
            architecture: round(score)
            for architecture, score in scores.items()
        }


        # ----------------------------------------------------
        # FINAL RECOMMENDATION
        # ----------------------------------------------------

        # The highest-scoring architecture is recommended.
        # A close score difference is reported separately
        # through decision_strength and the final recommendation reason.

        recommended_architecture = ranking[0][0]
        
        # IMPORTANT: get the profile AFTER final recommendation
        recommended_profile = get_architecture_profile(
            recommended_architecture
        )
        
        # ============================================================
        # DECISION DRIVER INFLUENCE
        # ============================================================

        decision_drivers = []

        def calculate_influence(criterion: str):
            recommended_contribution = score_breakdown[
                recommended_architecture
            ].get(criterion, 0)

            alternative_contributions = [
                score_breakdown[architecture].get(criterion, 0)
                for architecture in self.architectures
                if architecture != recommended_architecture
            ]

            if not alternative_contributions:
                return 0

            strongest_alternative = max(alternative_contributions)

            return round(
                recommended_contribution - strongest_alternative,
                2,
            )
            
        # ============================================================
        # CONFIDENCE
        # ============================================================

        confidence, missing_requirements = self._calculate_confidence(
            request
        )
        
        # ============================================================
        # ASSUMPTIONS
        # ============================================================

        assumptions = []

        if request.traffic_level is None:
            assumptions.append(
                "Traffic level was not provided."
            )

        if request.expected_users is None:
            assumptions.append(
                "Expected user count was not provided."
            )

        if request.team_size is None:
            assumptions.append(
                "Team size was not provided."
            )

        if request.budget is None:
            assumptions.append(
                "Budget constraint was not provided."
            )

        if request.availability_requirement is None:
            assumptions.append(
                "Availability requirement was not provided."
            )

        if request.latency_requirement is None:
            assumptions.append(
                "Latency requirement was not provided."
            )

        if request.global_distribution is None:
            assumptions.append(
                "Global distribution requirement was not provided."
            )

        if request.real_time is None:
            assumptions.append(
                "Real-time requirement was not provided."
            )

        if request.compliance_required is None:
            assumptions.append(
                "No specific compliance requirement was provided."
            )

        if request.application_type is None:
            assumptions.append(
                "Application type was not provided."
            )

        # ============================================================
        # TIE / CLOSE-SCORE HANDLING
        # ============================================================

        top_score = ranking[0][1]
        second_score = ranking[1][1]

        alternative_profiles = {
        architecture: get_architecture_profile(architecture)
        for architecture, _ in ranking
        if architecture != recommended_architecture
}
        score_difference = top_score - second_score 
        
        # ----------------------------------------------------
        # DECISION DRIVERS
        # ----------------------------------------------------
        
        criterion_labels = {
            "team_size": "Team Size",
            "traffic": "Traffic",
            "expected_users": "Expected Users",
            "availability": "Availability",
            "global_distribution": "Global Distribution",
            "latency": "Latency",
            "real_time": "Real-Time Requirements",
            "budget": "Budget",
            "compliance": "Compliance",
            "application_type": "Application Type",
        }

        if score_difference <= 3:
            decision_strength = "close"
        elif score_difference <= 8:
            decision_strength = "moderate"
        else:
            decision_strength = "strong"
            
        # ----------------------------------------------------
        # GENERATE DECISION DRIVERS
        # ----------------------------------------------------

        decision_drivers = []

        def add_driver(
            criterion: str,
            direction: str,
            reason: str,
            weight: int,
        ):
            influence = calculate_influence(criterion)

            if abs(influence) >= 5:
                impact = "high"
            elif abs(influence) >= 2:
                impact = "medium"
            else:
                impact = "low"

            decision_drivers.append({
                "criterion": criterion_labels.get(criterion, criterion),
                "impact": impact,
                "direction": direction,
                "reason": reason,
                "weight": weight,
                "influence": influence,
            })


        if request.team_size is not None:

            if request.team_size <= 3:
                add_driver(
                    "team_size",
                    "Monolith",
                    "A small team benefits from simpler deployment and lower operational overhead.",
                    15,
                )

            elif request.team_size <= 8:
                add_driver(
                    "team_size",
                    "Modular Monolith",
                    "A medium-sized team can maintain clear module boundaries without the operational overhead of distributed services.",
                    15,
                )

            else:
                add_driver(
                    "team_size",
                    "Microservices",
                    "A larger engineering team can benefit from independently owned and deployed services.",
                    15,
                )


        if request.traffic_level == "high":
            add_driver(
                "traffic",
                "Microservices",
                "High traffic increases the value of independently scalable services.",
                20,
            )

        elif request.traffic_level == "medium":
            add_driver(
                "traffic",
                "Modular Monolith",
                "Moderate traffic benefits from stronger internal boundaries without immediately requiring distributed services.",
                20,
            )

        elif request.traffic_level == "low":
            add_driver(
                "traffic",
                "Monolith",
                "Low traffic does not justify the operational complexity of distributed services.",
                20,
            )


        if request.expected_users is not None:

            if request.expected_users >= 1_000_000:
                add_driver(
                    "expected_users",
                    "Microservices",
                    "A very large user base increases the need for independent scaling and workload isolation.",
                    15,
                )

            elif request.expected_users >= 100_000:
                add_driver(
                    "expected_users",
                    "Microservices",
                    "A large user base increases the value of scalable and independently managed workloads.",
                    15,
                )


        if request.availability_requirement in ("high", "critical"):
            add_driver(
                "availability",
                "Microservices",
                "High availability requirements increase the value of fault isolation and independent service scaling.",
                15,
            )


        if request.global_distribution is True:
            add_driver(
                "global_distribution",
                "Microservices",
                "Users across regions increase the value of independently scalable and geographically distributed services.",
                5,
            )


        if request.latency_requirement in ("high", "critical"):
            add_driver(
                "latency",
                "Modular Monolith / Microservices",
                "Low-latency requirements favor architectures that minimize unnecessary communication overhead while still allowing targeted scaling.",
                5,
            )


        if request.real_time is True:
            add_driver(
                "real_time",
                "Modular Monolith / Microservices",
                "Real-time workloads can be handled by a modular monolith, while microservices provide more options for independently scaling real-time components.",
                5,
            )


        if request.budget == "low":
            add_driver(
                "budget",
                "Monolith",
                "A low infrastructure budget favors simpler deployment and lower operational costs.",
                10,
            )

        elif request.budget == "medium":
            add_driver(
                "budget",
                "Modular Monolith",
                "A medium budget can support stronger architecture while avoiding the infrastructure overhead of a fully distributed system.",
                10,
            )

        elif request.budget == "high":
            add_driver(
                "budget",
                "Microservices",
                "A higher infrastructure budget makes distributed architecture more feasible.",
                10,
            )


        if request.compliance_required is True:
            add_driver(
                "compliance",
                "Microservices",
                "Service boundaries can help isolate sensitive workloads and responsibilities.",
                5,
            )

        # ============================================================
        # FINAL RESULT
        # ============================================================

        return {
            "recommended_architecture": recommended_architecture,
            "scores": scores,
            "reasons": reasons,
            "score_breakdown": score_breakdown,
            "ranking": ranking,
            "confidence": confidence,
            "missing_requirements": missing_requirements,
            "assumptions": assumptions,
            "decision_strength": decision_strength,
            "decision_drivers": decision_drivers,
            "recommended_profile": recommended_profile,
            "alternative_profiles": alternative_profiles,
        }

    # ================================================================
    # CONFIDENCE CALCULATION
    # ================================================================

    def _calculate_confidence(
        self,
        request: ArchitectureRequest,
    ) -> tuple[int, list[str]]:

        """
        Calculates confidence based on how many important
        architecture requirements are available.

        This does NOT decide the architecture.
        It only indicates how complete the input requirements are.
        """

        required_fields = [
            ("traffic_level", request.traffic_level),
            ("expected_users", request.expected_users),
            ("team_size", request.team_size),
            (
                "availability_requirement",
                request.availability_requirement,
            ),
            ("budget", request.budget),
            ("latency_requirement", request.latency_requirement),
            ("global_distribution", request.global_distribution),
            ("real_time", request.real_time),
            ("compliance_required", request.compliance_required),
            ("application_type", request.application_type),
        ]

        missing_requirements = []

        for field_name, value in required_fields:
            if value is None:
                missing_requirements.append(field_name)

        total_requirements = len(required_fields)
        provided_requirements = (
            total_requirements - len(missing_requirements)
        )

        if total_requirements == 0:
            confidence = 0
        else:
            confidence = round(
                (provided_requirements / total_requirements) * 100
            )

        return confidence, missing_requirements