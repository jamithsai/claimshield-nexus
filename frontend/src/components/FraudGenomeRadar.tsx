import React, { useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { Dna, Info, HelpCircle, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FraudGenome } from '../types';

interface FraudGenomeRadarProps {
  genome: FraudGenome;
  peerBenchmark?: FraudGenome;
  entityName?: string;
}

interface DimensionMeta {
  key: keyof FraudGenome;
  dimension: string;
  fullName: string;
  score: number;
  peer: number;
  description: string;
  clinicalInterpretation: string;
  siuRelevance: string;
  falsePositiveContext: string;
}

export const FraudGenomeRadar: React.FC<FraudGenomeRadarProps> = ({ 
  genome, 
  peerBenchmark,
  entityName 
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [showReferenceGuide, setShowReferenceGuide] = useState<boolean>(true);

  const dimensionsList: DimensionMeta[] = [
    { 
      key: 'billing_intensity',
      dimension: 'Billing Intensity',
      fullName: 'Aggregate Billing Velocity & Volume',
      score: Math.round(genome.billing_intensity * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.billing_intensity * 100) : 25,
      description: 'Volume and charge velocity relative to specialty peer group',
      clinicalInterpretation: 'Tracks total daily claim submissions, aggregate billed charges, and impossible hour accumulations against specialty medians.',
      siuRelevance: 'Values >75% frequently correlate with "impossible day" billing where rendered services exceed 18-24 clinician working hours in a single calendar day.',
      falsePositiveContext: 'Large group practices billing under a single supervising NPI or multi-provider clinical triage shifts during regional epidemic surges.'
    },
    { 
      key: 'procedure_deviation',
      dimension: 'Procedure Skew',
      fullName: 'CPT / HCPCS Upcoding & Acuity Skew',
      score: Math.round(genome.procedure_deviation * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.procedure_deviation * 100) : 20,
      description: 'Deviation toward high-reimbursement or complex CPT codes',
      clinicalInterpretation: 'Measures skew toward Level 4/5 evaluation and management (E&M) codes or highest-tier surgical modifiers without corresponding documented clinical comorbidities.',
      siuRelevance: 'Upcoding indicator: systematic shifting of routine 99213/99214 outpatient visits to complex 99215 codes to maximize reimbursement.',
      falsePositiveContext: 'Tertiary referral centers treating highly complex, multi-morbid patient populations requiring extensive prolonged evaluation.'
    },
    { 
      key: 'temporal_irregularity',
      dimension: 'Temporal Irreg.',
      fullName: 'Submission Velocity & Weekend/Holiday Irregularity',
      score: Math.round(genome.temporal_irregularity * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.temporal_irregularity * 100) : 15,
      description: 'Billing burst acceleration across consecutive 30-day epochs',
      clinicalInterpretation: 'Evaluates abrupt billing volume accelerations, sudden off-hours batch billing, or holiday spikes inconsistent with clinical facility operating hours.',
      siuRelevance: 'Detects "burst-and-bust" billing schemes where fraudulent syndicates rapidly bill high volumes before regulatory audit intervention.',
      falsePositiveContext: 'Catch-up administrative batch billing following electronic health record (EHR) migration or billing system downtime.'
    },
    { 
      key: 'referral_concentration',
      dimension: 'Referral Conc.',
      fullName: 'Referral Route Gini Concentration',
      score: Math.round(genome.referral_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.referral_concentration * 100) : 18,
      description: 'Gini coefficient concentration of referral sources',
      clinicalInterpretation: 'Quantifies referral monopolization where incoming or outgoing patient traffic is concentrated within a tightly restricted set of external providers.',
      siuRelevance: 'Identifies potential Anti-Kickback Statute (AKS) violations and closed referral reciprocity loops between diagnostic labs, imaging centers, and clinics.',
      falsePositiveContext: 'Single-specialty exclusive provider agreements in rural healthcare access zones with only one hospitalist and one specialist.'
    },
    { 
      key: 'facility_concentration',
      dimension: 'Facility Conc.',
      fullName: 'Rendering Site & Place of Service Bias',
      score: Math.round(genome.facility_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.facility_concentration * 100) : 22,
      description: 'Proportion of claims routed through specific rendering clinics',
      clinicalInterpretation: 'Monitors the proportion of outpatient or surgical claims billed through single shell clinics or high-facility-fee sites of service.',
      siuRelevance: 'Highlights billing misallocation between lower-fee office settings (POS 11) and higher-fee outpatient hospital facilities (POS 19/22).',
      falsePositiveContext: 'Dedicated outpatient surgical center staff who operate primarily out of an affiliated regional hospital wing.'
    },
    { 
      key: 'member_concentration',
      dimension: 'Member Conc.',
      fullName: 'Beneficiary Cycling & Repeat Billing',
      score: Math.round(genome.member_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.member_concentration * 100) : 12,
      description: 'Repeated high-frequency billing for identical member subsets',
      clinicalInterpretation: 'Evaluates whether a high volume of billing is repeatedly attributed to a suspiciously small, non-evolving cohort of insured members.',
      siuRelevance: 'Common signature of identity theft, "phantom patient" rosters, or recurring unrendered recurring therapy claims.',
      falsePositiveContext: 'Chronic disease management cohorts, renal dialysis clinics, or daily infusion oncology regimens.'
    },
    { 
      key: 'geographic_anomaly',
      dimension: 'Geographic Anom.',
      fullName: 'Impossible Transit & Multi-Site Dispersion',
      score: Math.round(genome.geographic_anomaly * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.geographic_anomaly * 100) : 10,
      description: 'Impossible transit distances between consecutive encounters',
      clinicalInterpretation: 'Flags rendering provider encounters at geographically distant physical facilities on the exact same date of service where physical transit is impossible.',
      siuRelevance: 'Strong deterministic indicator of stolen billing credentials, ghost providers, or uncredentialed surrogate billing.',
      falsePositiveContext: 'Telehealth encounters erroneously coded with physical place-of-service coordinates instead of Modifier 95 / POS 02.'
    },
    { 
      key: 'network_density',
      dimension: 'Network Density',
      fullName: 'Bipartite Collusion & PageRank Centrality',
      score: Math.round(genome.network_density * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.network_density * 100) : 14,
      description: 'Bipartite graph clustering coefficient and PageRank score',
      clinicalInterpretation: 'Calculates graph structural clustering and interconnectedness across providers, pharmacies, clinics, and member nodes.',
      siuRelevance: 'Identifies organized healthcare syndicates, coordinated kickback rings, and multi-entity patient sharing networks.',
      falsePositiveContext: 'Integrated Delivery Networks (IDNs) or Accountable Care Organizations (ACOs) with formalized coordinated care pathways.'
    },
    { 
      key: 'financial_exposure',
      dimension: 'Financial Exp.',
      fullName: 'Cumulative Flagged Dollar Exposure',
      score: Math.round(genome.financial_exposure * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.financial_exposure * 100) : 30,
      description: 'Cumulative dollar amount of flagged anomalous claim lines',
      clinicalInterpretation: 'Measures total paid and submitted dollar amounts subject to anomaly triggers normalized against total portfolio risk thresholds.',
      siuRelevance: 'Prioritizes cases for SIU recoupment proceedings and potential civil monetary penalty (CMP) recovery.',
      falsePositiveContext: 'High-cost specialty pharmaceuticals, rare biologic infusions, or complex organ transplant procedures with high legitimate unit costs.'
    },
    { 
      key: 'utilization_deviation',
      dimension: 'Utilization Dev.',
      fullName: 'Per-Encounter Service Unit Density',
      score: Math.round(genome.utilization_deviation * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.utilization_deviation * 100) : 20,
      description: 'Service units per patient encounter exceeding clinical norms',
      clinicalInterpretation: 'Assesses the number of distinct procedure units, add-on codes, or lab panels billed during a single clinical encounter.',
      siuRelevance: 'Detects "unbundling" (billing distinct components of a single procedure separately) and medically unnecessary diagnostic panel expansion.',
      falsePositiveContext: 'Emergency trauma admissions or comprehensive multi-organ full-day diagnostic workups.'
    },
  ];

  const radarData = dimensionsList.map((d) => ({
    dimension: d.dimension,
    score: d.score,
    peer: d.peer,
    fullMark: 100,
    description: d.description,
    fullName: d.fullName
  }));

  const selectedDimData = dimensionsList.find((d) => d.dimension === selectedDimension);

  return (
    <div className="w-full space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <Dna className="w-4 h-4 text-[#209B47]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              10-Dimensional Behavioral Fingerprint
            </h3>
            <p className="text-[11px] text-[#042126]/60">
              Normalized behavioral vector mapping {entityName ? `for ${entityName}` : 'target entity'} against specialty peer baseline
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#209B47] inline-block"></span>
            <span className="text-[#042126] font-semibold">Target Entity</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#005F68] inline-block"></span>
            <span className="text-[#042126]/60">Peer Specialty Norm</span>
          </div>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="w-full h-80 flex items-center justify-center bg-[#F2FCFF]/60 rounded-xl border border-[#042126]/10 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="rgba(4, 33, 38, 0.12)" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#042126', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(4, 33, 38, 0.2)" tick={{ fill: 'rgba(4, 33, 38, 0.6)', fontSize: 9 }} />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#042126]/15 p-3 rounded-lg shadow-md text-xs space-y-1">
                      <p className="font-bold text-[#042126]">{data.fullName || data.dimension}</p>
                      <p className="text-[#209B47] font-mono font-bold">{data.score} / 100 (Target)</p>
                      <p className="text-[#005F68] font-mono">{data.peer} / 100 (Peer Norm)</p>
                      <p className="text-[11px] text-[#042126]/70 pt-1 border-t border-[#042126]/10">{data.description}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Peer Benchmark"
              dataKey="peer"
              stroke="#005F68"
              fill="#005F68"
              fillOpacity={0.15}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <Radar
              name="Target Score"
              dataKey="score"
              stroke="#209B47"
              fill="#209B47"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Dimensional Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#042126]/70 uppercase tracking-wider">
            Select a Dimension to Inspect Investigator Reference:
          </span>
          {selectedDimension && (
            <button
              onClick={() => setSelectedDimension(null)}
              className="text-[11px] font-semibold text-[#005F68] hover:underline"
            >
              Clear Selection
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {radarData.map((d, i) => {
            const isHigh = d.score >= 75;
            const isMed = d.score >= 50 && d.score < 75;
            const isSelected = selectedDimension === d.dimension;

            return (
              <button
                key={i} 
                onClick={() => setSelectedDimension(isSelected ? null : d.dimension)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#209B47] bg-[#209B47]/10 border-[#209B47] shadow-xs'
                    : isHigh 
                    ? 'bg-[#FEE2E2] border-[#FECACA] text-[#B91C1C] hover:bg-[#FEE2E2]/80' 
                    : isMed 
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]/80' 
                    : 'bg-[#F2FCFF] border-[#042126]/10 text-[#042126] hover:bg-[#042126]/5'
                }`}
              >
                <p className="text-[10px] font-semibold truncate">{d.dimension}</p>
                <p className="text-xs font-bold font-mono mt-0.5 tabular-nums">{d.score}%</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Dimension Detail Callout */}
      {selectedDimData && (
        <div className="p-4 rounded-xl bg-[#F2FCFF] border-2 border-[#209B47] text-xs text-[#042126] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#209B47]/20 pb-2">
            <div>
              <span className="font-bold text-[#042126] text-sm">{selectedDimData.fullName}</span>
              <span className="ml-2 text-[11px] text-[#005F68] font-mono">({selectedDimData.dimension})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-[#209B47]/15 text-[#209B47] border border-[#209B47]/30">
                Target: {selectedDimData.score}%
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded font-semibold bg-[#005F68]/10 text-[#005F68] border border-[#005F68]/20">
                Peer: {selectedDimData.peer}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#005F68] uppercase flex items-center space-x-1">
                <Info className="w-3.5 h-3.5" />
                <span>What It Measures</span>
              </span>
              <p className="text-[#042126]/80 text-[11px] leading-relaxed">{selectedDimData.clinicalInterpretation}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#B91C1C] uppercase flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>SIU Investigative Relevance</span>
              </span>
              <p className="text-[#042126]/80 text-[11px] leading-relaxed">{selectedDimData.siuRelevance}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#209B47] uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legitimate Clinical Nuance</span>
              </span>
              <p className="text-[#042126]/80 text-[11px] leading-relaxed">{selectedDimData.falsePositiveContext}</p>
            </div>
          </div>
        </div>
      )}

      {/* Complete 10-Dimensional Reference Guide Accordion */}
      <div className="rounded-xl border border-[#042126]/10 bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowReferenceGuide(!showReferenceGuide)}
          className="w-full p-3.5 bg-[#F2FCFF] hover:bg-[#E8F8EE]/60 flex items-center justify-between text-left transition-colors border-b border-[#042126]/10"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#005F68]" />
            <span className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              10-Dimensional Fraud Genome Reference Guide for Investigators
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[#005F68] font-semibold">
            <span>{showReferenceGuide ? 'Collapse Guide' : 'Expand Guide'}</span>
            {showReferenceGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showReferenceGuide && (
          <div className="p-4 space-y-3 bg-white">
            <p className="text-xs text-[#042126]/70">
              The Fraud Genome models 10 orthogonal behavioral vectors derived from synthetic claims data and bipartite graph metrics. Each dimension is normalized from 0.00 to 1.00 (0% to 100%) against specialty-matched peer baselines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {dimensionsList.map((dim, idx) => {
                const isSelected = selectedDimension === dim.dimension;
                const isHigh = dim.score >= 75;

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDimension(dim.dimension)}
                    className={`p-3 rounded-lg border text-xs space-y-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#209B47] bg-[#209B47]/5 ring-1 ring-[#209B47]' 
                        : isHigh
                        ? 'border-[#FECACA] bg-[#FEE2E2]/30 hover:bg-[#FEE2E2]/50'
                        : 'border-[#042126]/10 bg-[#F2FCFF]/40 hover:bg-[#F2FCFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#042126]">{dim.fullName}</span>
                      </div>
                      <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        isHigh ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#209B47]/10 text-[#209B47]'
                      }`}>
                        {dim.score}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#042126]/70 leading-relaxed">{dim.clinicalInterpretation}</p>

                    <div className="pt-1.5 border-t border-[#042126]/5 flex flex-col space-y-1 text-[10px]">
                      <div>
                        <span className="font-bold text-[#B91C1C]">SIU Concern: </span>
                        <span className="text-[#042126]/80">{dim.siuRelevance}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#209B47]">Clinical Context: </span>
                        <span className="text-[#042126]/70">{dim.falsePositiveContext}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
