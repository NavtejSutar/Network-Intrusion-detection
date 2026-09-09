import React from 'react'
import {
  ShieldCheck,
  AlertOctagon,
  Cpu,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export default function OverviewTab({ summary, onSelectFilter }) {
  const healthScore = summary?.healthScore ?? 100
  const totalFlows = summary?.totalFlows ?? 0
  const attackFlows = summary?.attackFlows ?? 0
  const benignFlows = summary?.benignFlows ?? 0
  const attackRatio = summary?.attackRatio ?? '0.00%'
  const avgAttackConfidence = summary?.avgAttackConfidence ?? '0.00%'
  const predictionBreakdown = summary?.predictionBreakdown ?? {}

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-400'
    if (score >= 60) return 'text-amber-400 stroke-amber-400'
    return 'text-rose-500 stroke-rose-500'
  }

  const breakdownEntries = Object.entries(predictionBreakdown)
  const totalBreakdownCount = breakdownEntries.reduce((acc, [, count]) => acc + count, 0)

  const threatColorPalette = {
    'BENIGN': '#10b981',
    'DDoS': '#3b82f6',
    'PortScan': '#8b5cf6',
    'Bot': '#f59e0b',
    'Infiltration': '#ec4899',
    'FTP-Patator': '#f43f5e',
    'SSH-Patator': '#ef4444',
  }

  const getThreatColor = (name) => {
    return threatColorPalette[name] || '#06b6d4'
  }

  let cumulativePercent = 0
  const donutSegments = breakdownEntries.map(([label, count]) => {
    const percent = totalBreakdownCount > 0 ? (count / totalBreakdownCount) * 100 : 0
    const offset = cumulativePercent
    cumulativePercent += percent
    return {
      label,
      count,
      percent: Math.round(percent),
      color: getThreatColor(label),
      strokeDasharray: `${percent} ${100 - percent}`,
      strokeDashoffset: `-${offset}`
    }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Network Telemetry Overview</h2>
          <p className="text-xs text-slate-400">Real-time XGBoost flow classification and health posture</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0E1526] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>Last 60 Minutes Window</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Health Index</span>
            <div className="text-3xl font-bold text-white mt-1 tracking-tight">
              {healthScore}
              <span className="text-sm font-normal text-slate-500"> / 100</span>
            </div>
            <span className={`inline-block mt-2 text-[11px] font-medium ${
              healthScore >= 85 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {healthScore >= 85 ? 'Optimal Security Posture' : healthScore >= 60 ? 'Moderate Alert' : 'Critical Attack Volume'}
            </span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-1000 ease-out ${getScoreColor(healthScore)}`}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <ShieldCheck className={`absolute w-6 h-6 ${getScoreColor(healthScore)}`} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Flows Ingested</span>
            <div className="text-3xl font-bold text-white mt-1 tracking-tight font-mono">{totalFlows}</div>
            <span className="inline-block mt-2 text-[11px] text-slate-400 font-mono">
              Live TShark & Batch
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Anomalous Flows</span>
            <div className={`text-3xl font-bold mt-1 tracking-tight font-mono ${attackFlows > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {attackFlows}
            </div>
            <span className="inline-block mt-2 text-[11px] text-slate-400 font-mono">
              Attack Ratio: <span className="font-semibold text-rose-300">{attackRatio}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Benign Traffic</span>
            <div className="text-3xl font-bold text-emerald-400 mt-1 tracking-tight font-mono">{benignFlows}</div>
            <span className="inline-block mt-2 text-[11px] text-slate-400 font-mono">
              Avg Threat Conf: <span className="font-semibold text-slate-200">{avgAttackConfidence}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#090D16] border border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Flow Ratio Distribution</h3>
                <p className="text-xs text-slate-400">Real-time proportion of benign vs intrusive network traffic</p>
              </div>
              <span className="text-xs font-mono text-orange-400">{totalFlows} flows recorded</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-6 w-full rounded-full bg-[#161F33] overflow-hidden flex border border-slate-800">
                {totalFlows > 0 ? (
                  <>
                    <div
                      style={{ width: `${(benignFlows / totalFlows) * 100}%` }}
                      className="bg-emerald-500 transition-all duration-700"
                      title={`Benign: ${benignFlows}`}
                    />
                    <div
                      style={{ width: `${(attackFlows / totalFlows) * 100}%` }}
                      className="bg-rose-500 transition-all duration-700"
                      title={`Threats: ${attackFlows}`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-mono">
                    No flows active
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Benign Traffic:</span>
                  <span className="font-bold text-white">
                    {benignFlows} ({totalFlows > 0 ? ((benignFlows / totalFlows) * 100).toFixed(1) : 0}%)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-300">Threat / Anomalous:</span>
                  <span className="font-bold text-rose-400">
                    {attackFlows} ({totalFlows > 0 ? ((attackFlows / totalFlows) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1526] border border-slate-800/80 text-xs space-y-2">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Ingestion Status & Operational Window
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Summary calculations dynamically aggregate flows from PostgreSQL within a 60-minute sliding window. Live TShark capture writes flows directly through Scapy 15-feature extraction into Spring Boot.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#090D16] border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">ML Threat Classification Breakdown</h3>
              <span className="text-xs font-mono text-slate-400">XGBoost 15F</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of actual flow classifications in database</p>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#161F33" strokeWidth="3" />
                {donutSegments.length > 0 ? (
                  donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="3.2"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  ))
                ) : (
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#334155" strokeWidth="3" />
                )}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-white font-mono">{totalFlows}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Flows</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
            {donutSegments.length > 0 ? (
              donutSegments.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="truncate max-w-[150px]">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-slate-400">
                    <span>{t.count}</span>
                    <span className="text-[11px] text-slate-500 w-10 text-right">{t.percent}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs">
                No classification records present
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
