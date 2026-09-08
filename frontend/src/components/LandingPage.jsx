import React, { useState } from 'react'
import { Shield, ArrowRight, Play, CheckCircle, Activity, Bot, Cpu, UploadCloud, Terminal, ChevronRight, Lock } from 'lucide-react'

export default function LandingPage({ onLaunchConsole }) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Activity,
      title: 'Detect Anomalies',
      desc: 'Real-time multi-vector analysis catching DDoS, PortScans, Infiltration and Botnets instantly.',
      badge: 'Real-Time ML',
    },
    {
      icon: Bot,
      title: 'AI Copilot',
      desc: 'Autonomous agent connected directly to telemetry to inspect flows, triage incidents, and suggest fixes.',
      badge: 'Spring AI',
    },
    {
      icon: Cpu,
      title: 'Flow Telemetry',
      desc: 'Continuous Scapy & TShark bidirectional traffic reconstruction into 15 XGBoost features.',
      badge: 'CIC-IDS 15F',
    },
    {
      icon: UploadCloud,
      title: 'CSV Integration',
      desc: 'Instant batch prediction studio for external PCAP and flow log files with PostgreSQL ingestion.',
      badge: 'Batch Engine',
    },
  ]

  const trustedCompanies = [
    { name: 'ISRO', symbol: '🛰️ ISRO' },
    { name: 'TCS', symbol: '🏢 TCS' },
    { name: 'Infosys', symbol: '🌐 Infosys' },
    { name: 'WIPRO', symbol: '⚙️ WIPRO' },
    { name: 'Tech Mahindra', symbol: '⚡ Tech Mahindra' },
  ]

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <header className="border-b border-slate-800/80 bg-[#070A11]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">NetGuard</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.2
              </span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#telemetry" className="hover:text-cyan-400 transition-colors">Architecture</a>
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <button onClick={onLaunchConsole} className="hover:text-cyan-400 transition-colors">Console Docs</button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchConsole}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span>Launch NOC Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative px-6 lg:px-16 pt-16 pb-24 max-w-7xl mx-auto overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AI-Powered Network Intrusion Detection</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                NetGuard <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  See Threats Before They Spread
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Real-time network monitoring, intelligent XGBoost threat detection, and AI-powered operations insights — all in one unified, modern NOC environment.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchConsole}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Open Operations Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onLaunchConsole}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-medium bg-[#111726] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Start Live Capture</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
                {features.map((f, idx) => {
                  const Icon = f.icon
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveFeature(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeFeature === idx
                          ? 'bg-[#111726] border-cyan-500/40 text-cyan-400'
                          : 'bg-[#0B0F19]/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-2 text-cyan-400" />
                      <div className="font-semibold text-white text-xs">{f.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{f.badge}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-6 rounded-full border border-dashed border-blue-500/20 animate-[spin_40s_linear_infinite_reverse]" />
                <div className="absolute inset-12 rounded-full border border-slate-800" />

                <svg className="w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="140" stroke="#06b6d4" strokeWidth="1" fill="none" strokeDasharray="4 6" opacity="0.4" />
                  <circle cx="200" cy="200" r="90" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.3" />
                  <circle cx="200" cy="200" r="40" fill="#0E1726" stroke="#06b6d4" strokeWidth="1.5" />
                  
                  <line x1="200" y1="200" x2="110" y2="120" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                  <line x1="200" y1="200" x2="310" y2="150" stroke="#f43f5e" strokeWidth="1.5" opacity="0.8" />
                  <line x1="200" y1="200" x2="280" y2="300" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                  
                  <circle cx="110" cy="120" r="5" fill="#06b6d4" />
                  <circle cx="310" cy="150" r="7" fill="#f43f5e" className="animate-ping" />
                  <circle cx="280" cy="300" r="6" fill="#10b981" />
                </svg>

                <div className="absolute top-4 left-0 sm:-left-6 bg-[#0B0F19]/90 border border-rose-500/40 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <span className="font-mono text-[10px] text-rose-400 block font-semibold">Suspicious Flow Detected</span>
                    <span className="font-mono text-[10px] text-slate-400">10.17.34.56 &rarr; 192.168.1.10</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-2 sm:-left-4 bg-[#0B0F19]/90 border border-amber-500/40 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                    !
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 block font-semibold">Anomaly Score: 0.87</span>
                    <span className="text-[10px] text-slate-400">Unusual port activity detected</span>
                  </div>
                </div>

                <div className="absolute bottom-16 right-0 sm:-right-6 bg-[#0B0F19]/90 border border-emerald-500/40 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 block font-semibold">Threat Blocked</span>
                    <span className="font-mono text-[10px] text-slate-400">Source: 203.0.113.45</span>
                  </div>
                </div>

                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#111726] to-[#1A253C] border border-cyan-500/40 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20">
                  <Shield className="w-8 h-8 text-cyan-400" />
                  <span className="text-[9px] font-mono text-cyan-300 font-bold mt-1">SEC-OPS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800/80 bg-[#0B0F19]/40 py-10 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
              Engineered for Mission-Critical Infrastructure & Enterprise Teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              {trustedCompanies.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-semibold tracking-wider font-mono">
                  <span>{c.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">End-to-End Threat Intelligence</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              Combines automated live packet capture, machine learning inference, and generative AI reasoning in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:border-cyan-500/40 transition-all group shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-2">
                    {f.badge}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#070A11] px-6 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>NetGuard Intrusion Defense System</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLaunchConsole} className="hover:text-cyan-400 text-slate-400">Launch Console</button>
          <span>•</span>
          <span>Port 8090 Backend</span>
          <span>•</span>
          <span>Port 5173 Client</span>
        </div>
      </footer>
    </div>
  )
}
