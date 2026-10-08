import React from 'react';
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
  entityName?: string;
}

export const FraudGenomeRadar: React.FC<FraudGenomeRadarProps> = ({ genome, entityName }) => {
  const radarData = [
    { dimension: 'Billing Intensity', score: Math.round(genome.billing_intensity * 100), fullMark: 100 },
    { dimension: 'Procedure Skew', score: Math.round(genome.procedure_deviation * 100), fullMark: 100 },
    { dimension: 'Temporal Irreg.', score: Math.round(genome.temporal_irregularity * 100), fullMark: 100 },
    { dimension: 'Referral Conc.', score: Math.round(genome.referral_concentration * 100), fullMark: 100 },
    { dimension: 'Facility Conc.', score: Math.round(genome.facility_concentration * 100), fullMark: 100 },
    { dimension: 'Member Conc.', score: Math.round(genome.member_concentration * 100), fullMark: 100 },
    { dimension: 'Geographic Anom.', score: Math.round(genome.geographic_anomaly * 100), fullMark: 100 },
    { dimension: 'Network Density', score: Math.round(genome.network_density * 100), fullMark: 100 },
    { dimension: 'Financial Exp.', score: Math.round(genome.financial_exposure * 100), fullMark: 100 },
    { dimension: 'Utilization Dev.', score: Math.round(genome.utilization_deviation * 100), fullMark: 100 },
  ];

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Fraud Genome™ Fingerprint</span>
              <span className="text-[10px] lowercase px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">
                10-dim vector
              </span>
            </h3>
            <p className="text-xs text-slate-400">Behavioral DNA calculated from empirical claim & network features</p>
          </div>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="w-full h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-bold text-white">{data.dimension}</p>
                      <p className="text-sky-400 font-mono text-sm mt-0.5">{data.score} / 100 Index</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Behavioral Score"
              dataKey="score"
              stroke="#0ea5e9"
              fill="#0284c7"
              fillOpacity={0.45}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimensional Grid Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-800/80">
        {radarData.map((d, i) => {
          const isHigh = d.score >= 75;
          const isMed = d.score >= 50 && d.score < 75;
          return (
            <div 
              key={i} 
              className={`p-2 rounded-lg border text-center transition-all ${
                isHigh 
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-300' 
                  : (isMed ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400')
              }`}
            >
              <p className="text-[10px] font-medium truncate">{d.dimension}</p>
              <p className="text-xs font-bold font-mono mt-0.5">{d.score}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
