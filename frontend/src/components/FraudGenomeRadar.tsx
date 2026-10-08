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
import { Dna, Info } from 'lucide-react';
import { FraudGenome } from '../types';

interface FraudGenomeRadarProps {
  genome: FraudGenome;
  peerBenchmark?: FraudGenome;
  entityName?: string;
}

export const FraudGenomeRadar: React.FC<FraudGenomeRadarProps> = ({ 
  genome, 
  peerBenchmark,
  entityName 
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const radarData = [
    { 
      dimension: 'Billing Intensity', 
      score: Math.round(genome.billing_intensity * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.billing_intensity * 100) : 25,
      fullMark: 100,
      description: 'Volume and charge velocity relative to specialty peer group'
    },
    { 
      dimension: 'Procedure Skew', 
      score: Math.round(genome.procedure_deviation * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.procedure_deviation * 100) : 20,
      fullMark: 100,
      description: 'Deviation toward high-reimbursement or complex CPT codes'
    },
    { 
      dimension: 'Temporal Irreg.', 
      score: Math.round(genome.temporal_irregularity * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.temporal_irregularity * 100) : 15,
      fullMark: 100,
      description: 'Billing burst acceleration across consecutive 30-day epochs'
    },
    { 
      dimension: 'Referral Conc.', 
      score: Math.round(genome.referral_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.referral_concentration * 100) : 18,
      fullMark: 100,
      description: 'Gini coefficient concentration of referral sources'
    },
    { 
      dimension: 'Facility Conc.', 
      score: Math.round(genome.facility_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.facility_concentration * 100) : 22,
      fullMark: 100,
      description: 'Proportion of claims routed through specific rendering clinics'
    },
    { 
      dimension: 'Member Conc.', 
      score: Math.round(genome.member_concentration * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.member_concentration * 100) : 12,
      fullMark: 100,
      description: 'Repeated high-frequency billing for identical member subsets'
    },
    { 
      dimension: 'Geographic Anom.', 
      score: Math.round(genome.geographic_anomaly * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.geographic_anomaly * 100) : 10,
      fullMark: 100,
      description: 'Impossible transit distances between consecutive encounters'
    },
    { 
      dimension: 'Network Density', 
      score: Math.round(genome.network_density * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.network_density * 100) : 14,
      fullMark: 100,
      description: 'Bipartite graph clustering coefficient and PageRank score'
    },
    { 
      dimension: 'Financial Exp.', 
      score: Math.round(genome.financial_exposure * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.financial_exposure * 100) : 30,
      fullMark: 100,
      description: 'Cumulative dollar amount of flagged anomalous claim lines'
    },
    { 
      dimension: 'Utilization Dev.', 
      score: Math.round(genome.utilization_deviation * 100), 
      peer: peerBenchmark ? Math.round(peerBenchmark.utilization_deviation * 100) : 20,
      fullMark: 100,
      description: 'Service units per patient encounter exceeding clinical norms'
    },
  ];

  const selectedDimData = radarData.find((d) => d.dimension === selectedDimension);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <Dna className="w-4 h-4 text-[#209B47]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              10-Dimensional Behavioral Fingerprint
            </h3>
            <p className="text-[11px] text-[#042126]/60">Calculated from empirical synthetic claim and network features</p>
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
                      <p className="font-bold text-[#042126]">{data.dimension}</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
        {radarData.map((d, i) => {
          const isHigh = d.score >= 75;
          const isMed = d.score >= 50 && d.score < 75;
          const isSelected = selectedDimension === d.dimension;

          return (
            <button
              key={i} 
              onClick={() => setSelectedDimension(isSelected ? null : d.dimension)}
              className={`p-2 rounded-lg border text-center transition-all ${
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

      {/* Selected Dimension Detail Box */}
      {selectedDimData && (
        <div className="p-3.5 rounded-lg bg-[#F2FCFF] border border-[#209B47]/30 text-xs text-[#042126] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#005F68] uppercase">{selectedDimData.dimension} Detail</span>
            <span className="font-mono text-[#209B47] font-bold">{selectedDimData.score}% vs {selectedDimData.peer}% Peer Norm</span>
          </div>
          <p className="text-[#042126]/70">{selectedDimData.description}</p>
        </div>
      )}
    </div>
  );
};
