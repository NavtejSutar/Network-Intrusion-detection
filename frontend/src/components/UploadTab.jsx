import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { uploadCsvFlows } from '../api'

export default function UploadTab({ onFlowsUploaded, onSelectFlow }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
        setError(null)
      } else {
        setError('Please upload a valid .csv file containing network flow records')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)
    try {
      const data = await uploadCsvFlows(file)
      setResult(data)
      if (onFlowsUploaded) onFlowsUploaded()
    } catch (err) {
      setError(err.message || 'Error running ML prediction on CSV')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white tracking-wide">ML Flow Ingestion & Prediction Studio</h2>
          <p className="text-xs text-slate-400">
            Upload CSV network flow logs to run the 15-feature XGBoost multiclass intrusion detection model and ingest results into PostgreSQL.
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-800 bg-[#111726]/40 hover:border-slate-700 hover:bg-[#111726]/80'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <span className="text-sm font-semibold text-white">
            {file ? file.name : 'Choose a CSV file or drag & drop here'}
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Accepts standard CIC-IDS flow exports, Wireshark/Scapy parsed CSVs with flow statistics
          </p>
          {file && (
            <span className="mt-2 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          {file && (
            <button
              onClick={() => {
                setFile(null)
                setResult(null)
                setError(null)
              }}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running XGBoost Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Prediction & Ingest</span>
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500">Flows Ingested</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{result.totalFlows}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500">Intrusions Flagged</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${result.attacksDetected > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {result.attacksDetected}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500">Benign Traffic</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{result.benignFlows}</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Inference Results Preview</h3>
              <span className="text-xs text-slate-400 font-mono">Saved to PostgreSQL</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#111726] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">DB ID</th>
                    <th className="py-2.5 px-3">Endpoints</th>
                    <th className="py-2.5 px-3">Proto</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Prediction</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.flows?.slice(0, 15).map((f) => {
                    const isBenign = f.prediction === 'BENIGN'
                    return (
                      <tr key={f.Id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-semibold">#{f.Id}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {f.srcIp}:{f.srcPort} → {f.dstIp}:{f.dstPort}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{f.protocol}</td>
                        <td className="py-2.5 px-3 text-slate-400">{f.duration?.toFixed(3)}s</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isBenign
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {f.prediction}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{f.confidence}%</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onSelectFlow(f)}
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
