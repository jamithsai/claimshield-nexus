"""
ClaimShield Nexus — High-Fidelity Synthetic Healthcare Data Generator
Generates realistic CMS Medicare/Medicaid encounter populations and injects
clinically grounded FWA scheme archetypes.
"""

import random
import datetime
from typing import List, Dict, Tuple
from faker import Faker
from .models import Member, Provider, Facility, Claim

fake = Faker()
Faker.seed(42)
random.seed(42)

SPECIALTIES = [
    ("Interventional Pain Management", "208VP0014X", "PG-PAIN-MGMT"),
    ("Internal Medicine", "207R00000X", "PG-INT-MED"),
    ("Clinical Laboratory", "291U00000X", "PG-LAB"),
    ("Orthopedic Surgery", "207X00000X", "PG-ORTHO"),
    ("Cardiology", "207RC0000X", "PG-CARDIO"),
    ("Family Medicine", "208D00000X", "PG-FAM-MED"),
    ("Physical Therapy", "225100000X", "PG-PHYS-THER"),
    ("Diagnostic Radiology", "2085R0202X", "PG-RAD")
]

LOCATIONS = [
    ("Miami", "FL", "33101", 25.7617, -80.1918),
    ("Tampa", "FL", "33602", 27.9506, -82.4572),
    ("Orlando", "FL", "32801", 28.5383, -81.3792),
    ("Houston", "TX", "77002", 29.7604, -95.3698),
    ("Dallas", "TX", "75201", 32.7767, -96.7970),
    ("Atlanta", "GA", "30303", 33.7490, -84.3880),
    ("Phoenix", "AZ", "85001", 33.4484, -112.0740),
    ("Los Angeles", "CA", "90012", 34.0522, -118.2437)
]

CPT_REFERENCE = {
    "99211": {"desc": "Office visit Level 1", "fee": 25.0, "time_min": 7},
    "99212": {"desc": "Office visit Level 2", "fee": 58.0, "time_min": 15},
    "99213": {"desc": "Office visit Level 3", "fee": 92.0, "time_min": 25},
    "99214": {"desc": "Office visit Level 4", "fee": 135.0, "time_min": 40},
    "99215": {"desc": "Office visit Level 5", "fee": 188.0, "time_min": 60},
    "80048": {"desc": "Basic metabolic panel", "fee": 45.0, "time_min": 10},
    "80053": {"desc": "Comprehensive metabolic panel", "fee": 72.0, "time_min": 15},
    "80061": {"desc": "Lipid panel", "fee": 65.0, "time_min": 10},
    "80307": {"desc": "Presumptive drug screen", "fee": 120.0, "time_min": 15},
    "82565": {"desc": "Creatinine blood test", "fee": 22.0, "time_min": 5},
    "84520": {"desc": "Urea nitrogen test", "fee": 20.0, "time_min": 5},
    "20610": {"desc": "Arthrocentesis major joint", "fee": 165.0, "time_min": 30},
    "97110": {"desc": "Therapeutic exercises (15m)", "fee": 42.0, "time_min": 15},
    "73721": {"desc": "MRI joint of lower extremity", "fee": 380.0, "time_min": 45},
    "93000": {"desc": "Electrocardiogram routine", "fee": 40.0, "time_min": 15}
}

DIAGNOSIS_CODES = [
    ("M54.5", "Low back pain"),
    ("I10", "Essential hypertension"),
    ("E11.9", "Type 2 diabetes mellitus"),
    ("M25.561", "Pain in right knee"),
    ("F41.1", "Generalized anxiety disorder"),
    ("J44.9", "Chronic obstructive pulmonary disease"),
    ("M79.7", "Fibromyalgia"),
    ("G89.29", "Other chronic pain")
]

class SyntheticHealthcareDatasetGenerator:
    def __init__(self, start_date: str = "2026-07-01", end_date: str = "2026-09-30"):
        self.start_date = datetime.date.fromisoformat(start_date)
        self.end_date = datetime.date.fromisoformat(end_date)
        self.total_days = (self.end_date - self.start_date).days + 1
        
        self.members: List[Member] = []
        self.providers: List[Provider] = []
        self.facilities: List[Facility] = []
        self.claims: List[Claim] = []
        
    def generate_all(self, num_members: int = 1500, num_providers: int = 80, num_facilities: int = 25) -> Tuple[List[Member], List[Provider], List[Facility], List[Claim]]:
        self._generate_facilities(num_facilities)
        self._generate_providers(num_providers)
        self._generate_members(num_members)
        self._generate_baseline_claims()
        self._inject_fwa_schemes()
        return self.members, self.providers, self.facilities, self.claims

    def _generate_facilities(self, count: int):
        types = ["INPATIENT_HOSPITAL", "OUTPATIENT_CLINIC", "AMBULATORY_SURGICAL_CENTER", "INDEPENDENT_LAB", "SKILLED_NURSING"]
        for i in range(count):
            loc = random.choice(LOCATIONS)
            fac_id = f"FAC-{70000 + i}"
            fac_type = types[i % len(types)]
            name = f"{loc[0]} {fake.company()} {fac_type.replace('_', ' ').title()}"
            self.facilities.append(Facility(
                facility_id=fac_id,
                name=name,
                facility_type=fac_type,
                address=fake.street_address(),
                city=loc[0],
                state=loc[1],
                zip_code=loc[2],
                capacity_beds=random.randint(20, 250),
                accreditation_status="FULL" if i % 10 != 0 else "PROBATIONARY"
            ))

    def _generate_providers(self, count: int):
        for i in range(count):
            spec = SPECIALTIES[i % len(SPECIALTIES)]
            loc = random.choice(LOCATIONS)
            fac = random.choice(self.facilities)
            npi = f"NPI-{1000000000 + i}"
            first = fake.first_name()
            last = fake.last_name()
            self.providers.append(Provider(
                npi=npi,
                provider_name=f"Dr. {first} {last}, MD",
                specialty=spec[0],
                taxonomy_code=spec[1],
                primary_facility_id=fac.facility_id,
                city=loc[0],
                state=loc[1],
                zip_code=loc[2],
                latitude=loc[3] + random.uniform(-0.05, 0.05),
                longitude=loc[4] + random.uniform(-0.05, 0.05),
                enrollment_date="2020-01-15",
                sanction_history=(i == 13),
                peer_group_id=spec[2]
            ))

    def _generate_members(self, count: int):
        plans = ["MEDICARE_ADVANTAGE", "MEDICAID", "COMMERCIAL_PPO", "COMMERCIAL_HMO"]
        for i in range(count):
            loc = random.choice(LOCATIONS)
            dob = fake.date_of_birth(minimum_age=18, maximum_age=85).isoformat()
            self.members.append(Member(
                member_id=f"MBR-{800000 + i}",
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                date_of_birth=dob,
                gender=random.choice(["M", "F"]),
                plan_type=random.choice(plans),
                state=loc[1],
                zip_code=loc[2],
                enrollment_start="2024-01-01",
                risk_adjustment_factor=round(random.uniform(0.7, 2.2), 2)
            ))

    def _generate_baseline_claims(self):
        claim_counter = 100000
        total_baseline = min(15000, len(self.members) * 8)
        for _ in range(total_baseline):
            claim_counter += 1
            prov = random.choice(self.providers)
            mbr = random.choice(self.members)
            diag = random.choice(DIAGNOSIS_CODES)
            
            # Specialty appropriate CPT
            if "Pain" in prov.specialty or "Internal" in prov.specialty or "Family" in prov.specialty:
                cpt = random.choices(["99212", "99213", "99214", "99215"], weights=[15, 55, 25, 5])[0]
            elif "Lab" in prov.specialty:
                cpt = random.choice(["80048", "80053", "80061"])
            elif "Ortho" in prov.specialty:
                cpt = random.choice(["99213", "99214", "20610", "73721"])
            elif "Physical" in prov.specialty:
                cpt = "97110"
            else:
                cpt = "99213"
                
            fee_info = CPT_REFERENCE[cpt]
            srv_day_offset = random.randint(0, self.total_days - 1)
            srv_date = self.start_date + datetime.timedelta(days=srv_day_offset)
            if srv_date.weekday() == 6 and random.random() > 0.05:
                srv_date += datetime.timedelta(days=1)
                
            paid_date = srv_date + datetime.timedelta(days=random.randint(5, 21))
            billed = round(fee_info["fee"] * random.uniform(1.2, 1.8), 2)
            allowed = fee_info["fee"]
            paid = round(allowed * 0.8, 2)
            
            self.claims.append(Claim(
                claim_id=f"CLM-2026-{claim_counter}",
                member_id=mbr.member_id,
                billing_provider_npi=prov.npi,
                rendering_provider_npi=prov.npi,
                facility_id=prov.primary_facility_id,
                service_date=srv_date.isoformat(),
                paid_date=paid_date.isoformat(),
                place_of_service="11",
                primary_diagnosis=diag[0],
                procedure_code=cpt,
                billed_amount=billed,
                allowed_amount=allowed,
                paid_amount=paid,
                claim_status="PAID",
                data_quality_score=1.0,
                synthetic_scheme_tag=None
            ))

    def _inject_fwa_schemes(self):
        """
        Injects 6 distinct, clinically realistic FWA scheme archetypes into the dataset.
        """
        claim_counter = 200000
        n_mbrs = len(self.members)
        if n_mbrs < 10:
            return

        # Scheme 1: Severe Upcoding (Dr. Marcus Sterling, Pain Management)
        p1 = self.providers[0]
        p1.provider_name = "Dr. Marcus Sterling, MD"
        p1.specialty = "Interventional Pain Management"
        p1.city = "Miami"
        p1.state = "FL"
        
        target_m1 = self.members[:max(5, n_mbrs // 5)]
        for day in range(self.total_days):
            cur_date = self.start_date + datetime.timedelta(days=day)
            daily_count = random.randint(8, 16)
            for _ in range(daily_count):
                claim_counter += 1
                mbr = random.choice(target_m1)
                cpt = "99215" if random.random() < 0.90 else "99214"
                fee = CPT_REFERENCE[cpt]["fee"]
                self.claims.append(Claim(
                    claim_id=f"CLM-2026-{claim_counter}",
                    member_id=mbr.member_id,
                    billing_provider_npi=p1.npi,
                    rendering_provider_npi=p1.npi,
                    facility_id=p1.primary_facility_id,
                    service_date=cur_date.isoformat(),
                    paid_date=(cur_date + datetime.timedelta(days=10)).isoformat(),
                    primary_diagnosis="M54.5",
                    procedure_code=cpt,
                    billed_amount=fee * 2.8,
                    allowed_amount=fee,
                    paid_amount=fee * 0.8,
                    claim_status="PAID",
                    data_quality_score=0.98,
                    synthetic_scheme_tag="UPCODING_LEVEL_5"
                ))

        # Scheme 2: Component Lab Panel Unbundling (Apex Diagnostic Labs)
        p2 = self.providers[min(2, len(self.providers)-1)]
        p2.provider_name = "Apex Precision Diagnostics Lab"
        p2.specialty = "Clinical Laboratory"
        target_m2 = self.members[max(0, n_mbrs // 5):max(10, (2 * n_mbrs) // 5)]
        for day in range(0, self.total_days, 2):
            cur_date = self.start_date + datetime.timedelta(days=day)
            for _ in range(4):
                mbr = random.choice(target_m2)
                for unbundled_cpt in ["80048", "82565", "84520", "80307"]:
                    claim_counter += 1
                    fee = CPT_REFERENCE[unbundled_cpt]["fee"]
                    self.claims.append(Claim(
                        claim_id=f"CLM-2026-{claim_counter}",
                        member_id=mbr.member_id,
                        billing_provider_npi=p2.npi,
                        rendering_provider_npi=p2.npi,
                        facility_id=p2.primary_facility_id,
                        service_date=cur_date.isoformat(),
                        paid_date=(cur_date + datetime.timedelta(days=12)).isoformat(),
                        primary_diagnosis="E11.9",
                        procedure_code=unbundled_cpt,
                        billed_amount=fee * 2.2,
                        allowed_amount=fee,
                        paid_amount=fee * 0.8,
                        claim_status="PAID",
                        data_quality_score=0.95,
                        synthetic_scheme_tag="UNBUNDLED_LAB_PANEL"
                    ))

        # Scheme 3: Duplicate Billing Pattern (Dr. Elena Rostova, Orthopedic)
        p3 = self.providers[min(3, len(self.providers)-1)]
        p3.provider_name = "Dr. Elena Rostova, MD"
        p3.specialty = "Orthopedic Surgery"
        target_m3 = self.members[max(0, (2 * n_mbrs) // 5):max(15, (3 * n_mbrs) // 5)]
        for day in range(10, self.total_days - 5, 3):
            cur_date = self.start_date + datetime.timedelta(days=day)
            for _ in range(3):
                mbr = random.choice(target_m3)
                claim_counter += 1
                c1_id = f"CLM-2026-{claim_counter}"
                self.claims.append(Claim(
                    claim_id=c1_id,
                    member_id=mbr.member_id,
                    billing_provider_npi=p3.npi,
                    rendering_provider_npi=p3.npi,
                    facility_id=p3.primary_facility_id,
                    service_date=cur_date.isoformat(),
                    paid_date=(cur_date + datetime.timedelta(days=14)).isoformat(),
                    primary_diagnosis="M25.561",
                    procedure_code="20610",
                    billed_amount=380.0,
                    allowed_amount=165.0,
                    paid_amount=132.0,
                    claim_status="PAID",
                    synthetic_scheme_tag="DUPLICATE_BILLING_ORIGINAL"
                ))
                claim_counter += 1
                dup_date = cur_date + datetime.timedelta(days=1)
                self.claims.append(Claim(
                    claim_id=f"CLM-2026-{claim_counter}",
                    member_id=mbr.member_id,
                    billing_provider_npi=p3.npi,
                    rendering_provider_npi=p3.npi,
                    facility_id=p3.primary_facility_id,
                    service_date=dup_date.isoformat(),
                    paid_date=(dup_date + datetime.timedelta(days=14)).isoformat(),
                    primary_diagnosis="M25.561",
                    procedure_code="20610",
                    billed_amount=380.0,
                    allowed_amount=165.0,
                    paid_amount=132.0,
                    claim_status="PAID",
                    synthetic_scheme_tag="DUPLICATE_BILLING_DUPLICATE"
                ))

        # Scheme 4: Phantom Services & Impossible Timing (Dr. Arthur Pendelton)
        p4 = self.providers[min(4, len(self.providers)-1)]
        p4.provider_name = "Dr. Arthur Pendelton, MD"
        p4.specialty = "Cardiology"
        impossible_date = self.start_date + datetime.timedelta(days=min(45, self.total_days // 2))
        target_m4 = self.members[max(0, (3 * n_mbrs) // 5):max(20, (4 * n_mbrs) // 5)]
        for _ in range(55):
            claim_counter += 1
            mbr = random.choice(target_m4)
            self.claims.append(Claim(
                claim_id=f"CLM-2026-{claim_counter}",
                member_id=mbr.member_id,
                billing_provider_npi=p4.npi,
                rendering_provider_npi=p4.npi,
                facility_id=p4.primary_facility_id,
                service_date=impossible_date.isoformat(),
                paid_date=(impossible_date + datetime.timedelta(days=15)).isoformat(),
                primary_diagnosis="I10",
                procedure_code="93000",
                billed_amount=120.0,
                allowed_amount=40.0,
                paid_amount=32.0,
                claim_status="PAID",
                synthetic_scheme_tag="IMPOSSIBLE_TIMING_PHANTOM"
            ))

        # Scheme 5: Rapid Utilization Surge (Dr. Sophia Lin, Physical Therapy)
        p5 = self.providers[min(6, len(self.providers)-1)]
        p5.provider_name = "Dr. Sophia Lin, DPT"
        p5.specialty = "Physical Therapy"
        target_m5 = self.members[max(0, (4 * n_mbrs) // 5):]
        for day in range(self.total_days):
            cur_date = self.start_date + datetime.timedelta(days=day)
            daily_claims = 2 if day < 30 else (6 if day < 60 else 20)
            for _ in range(daily_claims):
                claim_counter += 1
                mbr = random.choice(target_m5)
                self.claims.append(Claim(
                    claim_id=f"CLM-2026-{claim_counter}",
                    member_id=mbr.member_id,
                    billing_provider_npi=p5.npi,
                    rendering_provider_npi=p5.npi,
                    facility_id=p5.primary_facility_id,
                    service_date=cur_date.isoformat(),
                    paid_date=(cur_date + datetime.timedelta(days=10)).isoformat(),
                    primary_diagnosis="M54.5",
                    procedure_code="97110",
                    units=4,
                    billed_amount=240.0,
                    allowed_amount=168.0,
                    paid_amount=134.4,
                    claim_status="PAID",
                    synthetic_scheme_tag="VELOCITY_SURGE_UTILIZATION"
                ))

        # Scheme 6: Coordinated Collusion Ring (Biscayne Referral Kickback Ring)
        p_ref = self.providers[min(5, len(self.providers)-1)]
        p_ref.provider_name = "Dr. Gregory Vance, MD"
        p_ref.specialty = "Family Medicine"
        shared_cohort = self.members[:max(10, n_mbrs // 4)]
        for day in range(10, self.total_days):
            cur_date = self.start_date + datetime.timedelta(days=day)
            if day % 2 == 0:
                for mbr in shared_cohort[:min(8, len(shared_cohort))]:
                    claim_counter += 1
                    self.claims.append(Claim(
                        claim_id=f"CLM-2026-{claim_counter}",
                        member_id=mbr.member_id,
                        billing_provider_npi=p1.npi,
                        rendering_provider_npi=p1.npi,
                        referring_provider_npi=p_ref.npi,
                        facility_id=self.facilities[0].facility_id,
                        service_date=cur_date.isoformat(),
                        paid_date=(cur_date + datetime.timedelta(days=12)).isoformat(),
                        primary_diagnosis="G89.29",
                        procedure_code="99215",
                        billed_amount=450.0,
                        allowed_amount=188.0,
                        paid_amount=150.4,
                        claim_status="PAID",
                        synthetic_scheme_tag="COORDINATED_COLLUSION_RING"
                    ))
                    claim_counter += 1
                    self.claims.append(Claim(
                        claim_id=f"CLM-2026-{claim_counter}",
                        member_id=mbr.member_id,
                        billing_provider_npi=p2.npi,
                        rendering_provider_npi=p2.npi,
                        referring_provider_npi=p1.npi,
                        facility_id=self.facilities[0].facility_id,
                        service_date=cur_date.isoformat(),
                        paid_date=(cur_date + datetime.timedelta(days=12)).isoformat(),
                        primary_diagnosis="G89.29",
                        procedure_code="80307",
                        billed_amount=280.0,
                        allowed_amount=120.0,
                        paid_amount=96.0,
                        claim_status="PAID",
                        synthetic_scheme_tag="COORDINATED_COLLUSION_RING"
                    ))
