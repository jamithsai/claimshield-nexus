"""
ClaimShield Nexus — In-Memory High-Performance Relational Store
Provides indexing and query interfaces for claims, entities, cases, and logs.
"""

from typing import List, Dict, Optional, Any
from .models import Member, Provider, Facility, Claim, SIUCase, AuditLogEntry, User
from .generator import SyntheticHealthcareDatasetGenerator
from .validator import DataQualityEngine

class InMemoryDatabase:
    def __init__(self):
        self.members: Dict[str, Member] = {}
        self.providers: Dict[str, Provider] = {}
        self.facilities: Dict[str, Facility] = {}
        self.claims: List[Claim] = []
        self.claims_by_id: Dict[str, Claim] = {}
        self.claims_by_provider: Dict[str, List[Claim]] = {}
        self.claims_by_member: Dict[str, List[Claim]] = {}
        self.claims_by_facility: Dict[str, List[Claim]] = {}
        
        self.cases: Dict[str, SIUCase] = {}
        self.audit_logs: List[AuditLogEntry] = []
        self.users: Dict[str, User] = {}
        self.dqi_overall: float = 0.96
        self.dqi_report: Dict[str, Any] = {}
        self.is_initialized: bool = False

    def initialize_data(self, num_members: int = 1500, num_providers: int = 80, num_facilities: int = 25):
        if self.is_initialized:
            return
            
        generator = SyntheticHealthcareDatasetGenerator()
        members, providers, facilities, claims = generator.generate_all(
            num_members=num_members, 
            num_providers=num_providers, 
            num_facilities=num_facilities
        )
        
        for m in members:
            self.members[m.member_id] = m
        for p in providers:
            self.providers[p.npi] = p
            self.claims_by_provider[p.npi] = []
        for f in facilities:
            self.facilities[f.facility_id] = f
            self.claims_by_facility[f.facility_id] = []
            
        self.claims = claims
        for c in claims:
            self.claims_by_id[c.claim_id] = c
            if c.billing_provider_npi in self.claims_by_provider:
                self.claims_by_provider[c.billing_provider_npi].append(c)
            if c.member_id not in self.claims_by_member:
                self.claims_by_member[c.member_id] = []
            self.claims_by_member[c.member_id].append(c)
            if c.facility_id in self.claims_by_facility:
                self.claims_by_facility[c.facility_id].append(c)
                
        self.dqi_overall, self.dqi_report = DataQualityEngine.evaluate_claims(self.claims)
        self._seed_default_users()
        self.is_initialized = True

    def _seed_default_users(self):
        default_users = [
            User(user_id="USR-101", username="investigator@acentra.com", full_name="Sarah Jenkins, CFE", role="INVESTIGATOR", assigned_capacity=20),
            User(user_id="USR-102", username="senior@acentra.com", full_name="Robert Vance, CFE, AHFI", role="SENIOR_INVESTIGATOR", assigned_capacity=25),
            User(user_id="USR-103", username="analyst@acentra.com", full_name="Elena Rostova, Data Scientist", role="PROGRAM_INTEGRITY_ANALYST", assigned_capacity=30),
            User(user_id="USR-100", username="admin@acentra.com", full_name="System Administrator", role="ADMIN", assigned_capacity=50)
        ]
        for u in default_users:
            self.users[u.username] = u

    def get_provider(self, npi: str) -> Optional[Provider]:
        return self.providers.get(npi)

    def get_claims_for_provider(self, npi: str) -> List[Claim]:
        return self.claims_by_provider.get(npi, [])

    def get_claims_for_member(self, member_id: str) -> List[Claim]:
        return self.claims_by_member.get(member_id, [])

    def add_case(self, case: SIUCase):
        self.cases[case.case_id] = case

    def get_case(self, case_id: str) -> Optional[SIUCase]:
        return self.cases.get(case_id)

    def list_cases(self) -> List[SIUCase]:
        return list(self.cases.values())

    def add_audit_log(self, log: AuditLogEntry):
        self.audit_logs.append(log)

# Global singleton in-memory database instance
db = InMemoryDatabase()
