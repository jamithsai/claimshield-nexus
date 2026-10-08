"""
ClaimShield Nexus — Scheme Fingerprint Similarity Matcher
Compares an entity's Fraud Genome against established reference FWA scheme archetypes using vector cosine similarity.
"""

import numpy as np
from typing import Dict, Any, List
from backend.data.models import FraudGenome

SCHEME_TAXONOMY = [
    {
        "scheme_id": "SCH-UPCODING-SYNDICATE",
        "scheme_name": "Coordinated High-Level E&M Upcoding Syndicate",
        "description": "Systematic billing of Level 4 and Level 5 E&M codes without matching clinical acuity or diagnostic complexity.",
        "reference_genome": [0.92, 0.95, 0.65, 0.88, 0.78, 0.70, 0.60, 0.82, 0.90, 0.85],
        "matching_traits": ["High billing intensity", "Extreme procedure deviation (99215)", "Dense referral concentration"]
    },
    {
        "scheme_id": "SCH-LAB-UNBUNDLING-RING",
        "scheme_name": "Bipartite Lab Panel Fragmenting & Unbundling Ring",
        "description": "Splitting composite laboratory panels into constituent single-analyte CPT codes for inflated per-encounter reimbursement.",
        "reference_genome": [0.85, 0.92, 0.50, 0.95, 0.90, 0.82, 0.45, 0.91, 0.88, 0.78],
        "matching_traits": ["Constituent CPT fragmentation", "Extreme facility concentration", "Bipartite patient sharing"]
    },
    {
        "scheme_id": "SCH-PHANTOM-CAPACITY-BURST",
        "scheme_name": "Phantom Services & Impossible Daily Capacity",
        "description": "Billing daily encounter volumes that mathematically exceed 24 hours of clinical rendering time.",
        "reference_genome": [0.98, 0.60, 0.95, 0.40, 0.50, 0.45, 0.35, 0.40, 0.85, 0.92],
        "matching_traits": ["Impossible single-day hours", "Extreme temporal irregularity", "Weekend billing spikes"]
    },
    {
        "scheme_id": "SCH-DUPLICATE-ROLLING-MILL",
        "scheme_name": "Duplicate Encounter Rolling Mill",
        "description": "Repeated submission of identical injection and evaluation codes across short 24-72 hour intervals.",
        "reference_genome": [0.75, 0.68, 0.70, 0.55, 0.60, 0.88, 0.30, 0.50, 0.72, 0.95],
        "matching_traits": ["Short-interval duplicate codes", "High member concentration", "High utilization deviation"]
    }
]

class SchemeSimilarityMatcher:
    @staticmethod
    def match_genome(genome: FraudGenome) -> Dict[str, Any]:
        vec = np.array([
            genome.billing_intensity,
            genome.procedure_deviation,
            genome.temporal_irregularity,
            genome.referral_concentration,
            genome.facility_concentration,
            genome.member_concentration,
            genome.geographic_anomaly,
            genome.network_density,
            genome.financial_exposure,
            genome.utilization_deviation
        ], dtype=np.float32)
        
        norm_v = np.linalg.norm(vec)
        if norm_v == 0:
            norm_v = 1.0
            
        best_match = None
        highest_sim = -1.0
        all_matches = []
        
        for scheme in SCHEME_TAXONOMY:
            ref_vec = np.array(scheme["reference_genome"], dtype=np.float32)
            norm_ref = np.linalg.norm(ref_vec)
            cosine_sim = float(np.dot(vec, ref_vec) / (norm_v * norm_ref))
            sim_pct = round(max(0.0, min(100.0, cosine_sim * 100.0)), 1)
            
            match_obj = {
                "scheme_id": scheme["scheme_id"],
                "scheme_name": scheme["scheme_name"],
                "description": scheme["description"],
                "similarity_score_pct": sim_pct,
                "matching_traits": scheme["matching_traits"]
            }
            all_matches.append(match_obj)
            
            if cosine_sim > highest_sim:
                highest_sim = cosine_sim
                best_match = match_obj
                
        all_matches.sort(key=lambda x: x["similarity_score_pct"], reverse=True)
        
        return {
            "best_matched_scheme": best_match,
            "all_ranked_matches": all_matches,
            "similarity_metric": "Cosine Vector Similarity (10 Dimensions)",
            "limitations": "Taxonomy match reflects geometric fingerprint proximity; not definitive classification."
        }
