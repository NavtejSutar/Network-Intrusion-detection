import React, { useState, useEffect } from 'react'
import {
  Shield,
  Play,
  Square,
  Wifi,
  RefreshCw,
  Search,
  Bell,
  Clock
} from 'lucide-react'
import {
  fetchCaptureInterfaces,
  fetchCaptureStatus,
  startCapture,
  stopCapture
} from '../api'

export default function Header({
  onRefresh,
  isRefreshing,
  healthScore = 100,
  onOpenLanding
}) {
  const [interfaces, setInterfaces] = useState([])
  const [selectedInterface, setSelectedInterface] = useState(() => {
    return localStorage.getItem('netguard_selected_interface') || 'auto'
  })
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('netguard_capture_duration')
    return saved ? Number(saved) : 30
  })
  const [status, setStatus] = useState({ running: false, message: 'Checking...' })
  const [actionLoading, setActionLoading] = useState(false)

  const handleInterfaceChange = (newVal) => {
    setSelectedInterface(newVal)
    localStorage.setItem('netguard_selected_interface', newVal)
  }

  const handleDurationChange = (newVal) => {
    setDuration(newVal)
    localStorage.setItem('netguard_capture_duration', String(newVal))
  }

  const loadInterfaces = async () => {
    try {
      const data = await fetchCaptureInterfaces()
      setInterfaces(data)
      const saved = localStorage.getItem('netguard_selected_interface')
      if (!saved || saved === 'auto') {
        const wifi = data.find((i) => i.isWifi)
        if (wifi) {
          setSelectedInterface(wifi.id)
          localStorage.setItem('netguard_selected_interface', wifi.id)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadStatus = async () => {
    try {
      const s = await fetchCaptureStatus()
      setStatus(s)
      if (s.running) {
        if (s.interfaceId) {
          setSelectedInterface(s.interfaceId)
          localStorage.setItem('netguard_selected_interface', s.interfaceId)
        }
        if (s.duration) {
          setDuration(s.duration)
          localStorage.setItem('netguard_capture_duration', String(s.duration))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadInterfaces()
    loadStatus()
    const interval = setInterval(loadStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleCapture = async () => {
    setActionLoading(true)
    try {
      if (status.running) {
        const res = await stopCapture()
        setStatus(res)
      } else {
        const res = await startCapture(selectedInterface, duration)
        setStatus(res)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <header className="border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search network events, IPs, ports..."
            className="w-full bg-[#111726] border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#111726] border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-400 hidden sm:inline">Adapter:</span>
          </div>
          <select
            disabled={status.running}
            value={selectedInterface}
            onChange={(e) => handleInterfaceChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer pr-2 disabled:opacity-50"
          >
            <option value="auto" className="bg-[#111726]">Auto Wi-Fi</option>
            {interfaces.map((i) => (
              <option key={i.id} value={i.id} className="bg-[#111726]">
                #{i.id} {i.description} {i.isWifi ? '(Wi-Fi)' : ''}
              </option>
            ))}
          </select>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 text-xs text-slate-400 hidden sm:flex">
            <span>Cycle:</span>
            <select
              disabled={status.running}
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="15" className="bg-[#111726]">15s</option>
              <option value="30" className="bg-[#111726]">30s</option>
              <option value="60" className="bg-[#111726]">60s</option>
            </select>
          </div>

          <button
            onClick={handleToggleCapture}
            disabled={actionLoading}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer shadow-md ${
              status.running
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-500/20'
            }`}
          >
            {status.running ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop TShark</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start TShark</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#111726]">
          <span className={`w-2 h-2 rounded-full ${status.running ? 'bg-cyan-400 animate-radar' : 'bg-slate-500'}`} />
          <span className="text-xs font-mono text-slate-300 truncate max-w-[130px] hidden sm:inline">
            {status.running ? (status.interfaceName || 'Wi-Fi Active') : 'Capture Idle'}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-[#111726] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
            N
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-white block leading-tight">Navtej Sutar</span>
            <span className="text-[10px] text-slate-400 block font-mono">Sec-Ops Lead</span>
          </div>
        </div>
      </div>
    </header>
  )
}
