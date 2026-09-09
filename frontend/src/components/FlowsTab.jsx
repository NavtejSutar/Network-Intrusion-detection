import React, { useState, useMemo } from 'react'
import { Search, Filter, Trash2, Eye, AlertTriangle, ArrowUpDown, Clock } from 'lucide-react'
import { deleteFlow, cleanupOldFlows } from '../api'

export default function FlowsTab({ flows, onRefresh, onSelectFlow, initialSearch = '' }) {
  const [search, setSearch] = useState(initialSearch)
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [cleanupDays, setCleanupDays] = useState(7)
  const [showCleanupModal, setShowCleanupModal] = useState(false)

  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      const matchSearch =
        !search ||
        f.srcIp?.toLowerCase().includes(search.toLowerCase()) ||
        f.dstIp?.toLowerCase().includes(search.toLowerCase()) ||
        f.prediction?.toLowerCase().includes(search.toLowerCase()) ||
        String(f.srcPort).includes(search) ||
        String(f.dstPort).includes(search) ||
        f.protocol?.toLowerCase().includes(search.toLowerCase())

      const matchAnomaly = filterAnomaliesOnly ? f.prediction !== 'BENIGN' : true

      return matchSearch && matchAnomaly
    })
  }, [flows, search, filterAnomaliesOnly])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm(`Delete flow #${id}?`)) return
    setDeletingId(id)
    try {
      await deleteFlow(id)
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCleanup = async () => {
    try {
      await cleanupOldFlows(cleanupDays)
      setShowCleanupModal(false)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F19] p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IP, port, protocol or threat type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111726] border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-orange-500/50"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterAnomaliesOnly(!filterAnomaliesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filterAnomaliesOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-[#111726] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Anomalies Only</span>
          </button>

          <button
            onClick={() => setShowCleanupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#111726] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Retention</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111726] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800/80 text-[11px]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Endpoints (Src → Dst)</th>
                <th className="py-3 px-4">Proto</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No flows match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => {
                  const isBenign = flow.prediction === 'BENIGN'
                  return (
                    <tr
                      key={flow.Id}
                      onClick={() => onSelectFlow(flow)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-slate-400 font-semibold">#{flow.Id}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[130px]">
                        {flow.timestamp ? flow.timestamp.replace('T', ' ').slice(0, 19) : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-orange-400">{flow.srcIp}</span>
                          <span className="text-slate-500 text-[10px]">:{flow.srcPort}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-slate-300">{flow.dstIp}</span>
                          <span className="text-slate-500 text-[10px]">:{flow.dstPort}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{flow.protocol}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {flow.totalPackets ?? 0} pkts <span className="text-slate-600">|</span> {flow.totalBytes ?? 0} B
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                            isBenign
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isBenign ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {flow.prediction}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${isBenign ? 'bg-emerald-400' : 'bg-rose-400'}`}
                              style={{ width: `${flow.confidence ?? 0}%` }}
                            />
                          </div>
                          <span className="text-slate-300 font-semibold">{flow.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectFlow(flow)}
                            className="p-1 rounded text-slate-400 hover:text-orange-400 transition-colors"
                            title="Inspect telemetry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            disabled={deletingId === flow.Id}
                            onClick={(e) => handleDelete(e, flow.Id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                            title="Delete flow"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCleanupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Prune Historical Telemetry</h3>
            <p className="text-xs text-slate-400">
              Delete historical flows older than the specified retention window to optimize database storage.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Retention Cutoff (Days):</label>
              <input
                type="number"
                min="1"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="w-full bg-[#111726] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanup}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
              >
                Prune Flows
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
