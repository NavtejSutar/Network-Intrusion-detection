import React, { useState } from 'react'
import { X, Bot, ShieldAlert, CheckCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { analyzeFlowWithAi } from '../api'

export default function FlowModal({ flow, onClose, onSwitchToCopilot }) {
  const [analysis, setAnalysis] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [errorAi, setErrorAi] = useState(null)

  if (!flow) return null

  const isBenign = flow.prediction === 'BENIGN'

  const handleRunDiagnosis = async () => {
    setLoadingAi(true)
    setErrorAi(null)
    try {
      const res = await analyzeFlowWithAi(flow.Id)
      setAnalysis(res)
    } catch (err) {
      setErrorAi(err.message || 'Failed to analyze flow with AI')
    } finally {
      setLoadingAi(false)
    }
  }

  const features = [
    { label: 'Bwd Packet Length Std', value: flow.bwdPacketLengthStd },
    { label: 'Average Packet Size', value: flow.averagePacketSize },
    { label: 'Bwd Packet Length Mean', value: flow.bwdPacketLengthMean },
    { label: 'Bwd Header Length', value: flow.bwdHeaderLength },
    { label: 'Packet Length Std', value: flow.packetLengthStd },
    { label: 'Max Packet Length', value: flow.maxPacketLength },
    { label: 'Fwd Packet Length Max', value: flow.fwdPacketLengthMax },
    { label: 'Idle Mean', value: flow.idleMean },
    { label: 'Avg Bwd Segment Size', value: flow.avgBwdSegmentSize },
    { label: 'Total Backward Packets', value: flow.totalBackwardPackets },
    { label: 'Total Length of Bwd Packets', value: flow.totalLengthOfBwdPackets },
    { label: 'Active Std', value: flow.activeStd },
    { label: 'Flow Bytes/sec', value: flow.flowBytesPerSec },
    { label: 'Total Fwd Packets', value: flow.totalFwdPackets },
    { label: 'Idle Max', value: flow.idleMax },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#111726]/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
              FLOW #{flow.Id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono border ${
              isBenign
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {flow.prediction}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Confidence: <strong className="text-white">{flow.confidence}%</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500">Source Endpoint</span>
              <div className="font-mono text-xs font-semibold text-slate-200 mt-1 truncate">
                {flow.srcIp}:{flow.srcPort}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500">Destination Endpoint</span>
              <div className="font-mono text-xs font-semibold text-slate-200 mt-1 truncate">
                {flow.dstIp}:{flow.dstPort}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500">Protocol / Duration</span>
              <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                {flow.protocol} • {flow.duration?.toFixed(3)}s
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500">Total Packets / Bytes</span>
              <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                {flow.totalPackets} pkts • {flow.totalBytes} B
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3">
              15 XGBoost Extracted Flow Features
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {features.map((f) => (
                <div key={f.label} className="p-2.5 rounded-xl bg-[#111726]/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 truncate">{f.label}</div>
                  <div className="font-mono text-xs font-semibold text-cyan-300 mt-0.5">
                    {typeof f.value === 'number' ? Number(f.value.toFixed(4)).toString() : f.value ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#111726] to-cyan-950/20 border border-purple-500/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">AI Incident Diagnostics</h4>
                  <p className="text-[11px] text-slate-400">Request root-cause analysis from the NOC Copilot</p>
                </div>
              </div>
              <button
                onClick={handleRunDiagnosis}
                disabled={loadingAi}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {loadingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Diagnose with AI</span>
                  </>
                )}
              </button>
            </div>

            {errorAi && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorAi}
              </div>
            )}

            {analysis && (
              <div className="mt-4 pt-4 border-t border-purple-500/20 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Severity:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                      analysis.severity?.toLowerCase() === 'high' || analysis.severity?.toLowerCase() === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {analysis.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose()
                      if (onSwitchToCopilot) onSwitchToCopilot(`Explain flow #${flow.Id}`)
                    }}
                    className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 transition-colors font-mono"
                  >
                    <span>Discuss with Copilot</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-xs text-slate-200 bg-[#0B0F19] p-3 rounded-xl border border-slate-800 leading-relaxed">
                  <strong className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-mono">Reason:</strong>
                  {analysis.reason}
                </div>

                <div className="text-xs text-emerald-300 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 leading-relaxed">
                  <strong className="text-emerald-400 block mb-1 text-[11px] uppercase tracking-wider font-mono">Recommendation:</strong>
                  {analysis.recommendation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
