import React, { useState, useEffect } from 'react'
import {
  ArrowRight,
  Play,
  Activity,
  Bot,
  Cpu,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Globe,
  Radio,
  Server
} from 'lucide-react'

export default function LandingPage({ onLaunchConsole }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [livePacketsCount, setLivePacketsCount] = useState(1284)
  const [threatCount, setThreatCount] = useState(14)

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePacketsCount(prev => prev + Math.floor(Math.random() * 5) + 1)
      if (Math.random() > 0.85) {
        setThreatCount(prev => prev + 1)
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: Activity,
      title: 'Real-Time Anomaly Detection',
      desc: 'Continuous Scapy packet reconstruction and 15-feature multiclass XGBoost detection identifying DDoS, PortScans, and Botnets.',
      badge: 'XGBoost 15F',
      stat: '99.4% Accuracy',
    },
    {
      icon: Bot,
      title: 'Autonomous AI Copilot',
      desc: 'Interactive Spring AI assistant equipped with direct tool access to live telemetry, anomaly history, and mitigation advice.',
      badge: 'Spring AI + Groq',
      stat: '< 450ms Latency',
    },
    {
      icon: Cpu,
      title: 'Automated Wi-Fi Capture',
      desc: 'One-click TShark packet capture with dynamic wireless adapter auto-detection and persistent operational scheduling.',
      badge: 'TShark Engine',
      stat: 'Zero Packet Loss',
    },
    {
      icon: UploadCloud,
      title: 'Batch Flow Studio',
      desc: 'High-throughput CSV ingestion pipeline for offline PCAP dumps with automated database persistence.',
      badge: 'PostgreSQL Sync',
      stat: 'Batch Ingestion',
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
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <header className="border-b border-slate-800/80 bg-[#070A11]/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="NetGuard Logo" className="w-10 h-10 object-contain rounded-full drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">NetGuard</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                NOC AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E1526] border border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry: {livePacketsCount.toLocaleString()} Flows</span>
          </div>

          <button
            onClick={onLaunchConsole}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/20 transition-all cursor-pointer font-medium"
          >
            <span>Launch NOC Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative px-6 lg:px-16 pt-16 pb-20 max-w-7xl mx-auto overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                <span>Next-Gen Autonomous Cyber NOC</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                NetGuard <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                  See Threats Before They Spread
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Autonomous network intrusion detection system combining real-time TShark capture, 15-feature multiclass XGBoost machine learning, and AI-powered operational incident triage.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchConsole}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Open Operations Console</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>

                <button
                  onClick={onLaunchConsole}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-medium bg-[#111726] border border-slate-800 hover:border-orange-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-orange-400" />
                  <span>Start Live Wi-Fi Capture</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
                {features.map((f, idx) => {
                  const Icon = f.icon
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveFeature(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        activeFeature === idx
                          ? 'bg-[#111726] border-orange-500/40 shadow-sm shadow-orange-500/10'
                          : 'bg-[#0B0F19]/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-2 text-orange-400" />
                      <div className="font-semibold text-white text-xs">{f.title}</div>
                      <div className="text-[10px] text-orange-400/90 font-mono mt-0.5">{f.stat}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-dashed border-orange-500/25 animate-spin-reverse" />
                <div className="absolute inset-12 rounded-full border border-amber-500/20" />
                <div className="absolute inset-24 rounded-full border border-dashed border-orange-500/30 animate-spin-slow" />
                <div className="absolute inset-36 rounded-full border border-slate-800" />

                <div className="absolute inset-2 rounded-full pointer-events-none overflow-hidden animate-radar-sweep opacity-75">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(249, 115, 22, 0.45) 0deg, rgba(249, 115, 22, 0.12) 40deg, transparent 75deg, transparent 360deg)'
                    }}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                  <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-orange-500/20 to-transparent absolute" />
                </div>

                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-orange-400/60 uppercase tracking-widest pointer-events-none">000° N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-orange-400/60 uppercase tracking-widest pointer-events-none">180° S</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-orange-400/60 uppercase tracking-widest pointer-events-none">270° W</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-orange-400/60 uppercase tracking-widest pointer-events-none">090° E</div>

                <svg className="w-full h-full pointer-events-none absolute inset-0" viewBox="0 0 480 480">
                  <defs>
                    <linearGradient id="attackBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="benignBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  <line x1="240" y1="240" x2="380" y2="120" stroke="url(#attackBeam)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="240" y1="240" x2="110" y2="130" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 4" />
                  <line x1="240" y1="240" x2="370" y2="360" stroke="url(#benignBeam)" strokeWidth="1.5" />
                  <line x1="240" y1="240" x2="90" y2="340" stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" />

                  <circle cx="380" cy="120" r="14" stroke="#f43f5e" strokeWidth="1" fill="none" opacity="0.6" className="animate-ping-slow" />
                  <circle cx="380" cy="120" r="7" fill="#f43f5e" />
                  <circle cx="380" cy="120" r="3" fill="#ffffff" />

                  <circle cx="110" cy="130" r="10" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.5" className="animate-pulse" />
                  <circle cx="110" cy="130" r="5" fill="#f59e0b" />

                  <circle cx="370" cy="360" r="6" fill="#10b981" />
                  <circle cx="370" cy="360" r="12" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.4" />

                  <circle cx="90" cy="340" r="5" fill="#f97316" />
                </svg>

                <div className="absolute top-1 left-0 sm:-left-6 bg-[#0B0F19]/95 border border-rose-500/50 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs z-20">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <span className="font-mono text-[10px] text-rose-400 block font-bold tracking-wide">ATTACK INTERCEPTED</span>
                    <span className="font-mono text-[10px] text-slate-300">10.17.34.56 &rarr; 192.168.1.10</span>
                  </div>
                </div>

                <div className="absolute top-8 right-0 sm:-right-8 bg-[#0B0F19]/95 border border-orange-500/40 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs z-20">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <div>
                    <span className="font-mono text-[10px] text-orange-400 block font-bold">WLAN SNIFFER ACTIVE</span>
                    <span className="font-mono text-[10px] text-slate-300">802.11ax • Flow Monitored</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-0 sm:-left-8 bg-[#0B0F19]/95 border border-amber-500/50 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs z-20">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    !
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 block font-bold">ANOMALY SCORE: 0.94</span>
                    <span className="text-[10px] text-slate-400 font-mono">DDoS SYN-Flood Neutralized</span>
                  </div>
                </div>

                <div className="absolute bottom-8 right-0 sm:-right-8 bg-[#0B0F19]/95 border border-emerald-500/50 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs z-20">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 block font-bold">AUTONOMOUS SHIELD</span>
                    <span className="font-mono text-[10px] text-slate-300">{threatCount} Threats Blocked</span>
                  </div>
                </div>

                <div className="relative z-10 w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-gradient-to-br from-[#1A2642] via-[#0E1526] to-[#070A11] border-2 border-orange-500/60 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.45)] p-2">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#070A11]/60">
                    <img
                      src="/logo.png"
                      alt="NetGuard Core"
                      className="w-20 sm:w-24 h-20 sm:h-24 object-contain rounded-full drop-shadow-[0_0_16px_rgba(249,115,22,0.7)]"
                    />
                  </div>
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
                <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors text-sm font-semibold tracking-wider font-mono">
                  <span>{c.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-orange-400 uppercase tracking-wider font-bold">Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">End-to-End Cyber Telemetry Stack</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">
              Combines automated live Wi-Fi packet capture, multiclass machine learning inference, and autonomous generative AI reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#090D16] border border-slate-800 hover:border-orange-500/40 transition-all group shadow-sm hover:shadow-orange-500/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 mb-2">
                      {f.badge}
                    </span>
                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Benchmark:</span>
                    <span className="text-orange-400 font-semibold">{f.stat}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#070A11] px-6 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NetGuard" className="w-4 h-4 object-contain" />
          <span>NetGuard Intrusion Defense System</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLaunchConsole} className="hover:text-orange-400 text-slate-400 cursor-pointer">
            Launch NOC Console &rarr;
          </button>
        </div>
      </footer>
    </div>
  )
}
