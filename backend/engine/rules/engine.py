"""
ClaimShield Nexus — FWA Rule Engine
Executes configurable deterministic rules against provider claims and produces evidence events.
"""

from typing import List, Dict
from backend.data.models import Claim, Provider, RuleTriggerEvent
from .upcoding import UpcodingRule
from .unbundling import UnbundlingRule
from .duplicate_billing import DuplicateBillingRule
from .phantom_services import PhantomServicesRule
from .excessive_utilization import ExcessiveUtilizationRule
from .improbable_timing import ImprobableTimingRule

class FWARuleEngine:
    RULES = [
        UpcodingRule,
        UnbundlingRule,
        DuplicateBillingRule,
        PhantomServicesRule,
        ExcessiveUtilizationRule,
        ImprobableTimingRule
    ]

    @classmethod
    def evaluate_provider(cls, provider: Provider, claims: List[Claim]) -> List[RuleTriggerEvent]:
        triggers = []
        for rule_cls in cls.RULES:
            event = rule_cls.evaluate(provider, claims)
            if event is not None:
                triggers.append(event)
        return triggers

    @classmethod
    def calculate_rule_score(cls, triggers: List[RuleTriggerEvent]) -> float:
        if not triggers:
            return 0.0
        # Severity weights
        weights = {"LOW": 15.0, "MEDIUM": 35.0, "HIGH": 70.0, "CRITICAL": 95.0}
        total_score = sum(weights.get(t.severity, 20.0) * t.confidence_contribution for t in triggers)
        return min(100.0, round(total_score, 1))
