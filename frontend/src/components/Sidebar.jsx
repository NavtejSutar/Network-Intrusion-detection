import React from 'react'
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  Activity,
  UploadCloud,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, attackCount = 0, onShowLanding }) {
  const mainNav = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'copilot', label: 'AI Chat', icon: MessageSquare, highlight: true },
    { id: 'flows', label: 'Flow Telemetry', icon: Activity, badge: attackCount > 0 ? attackCount : null },
    { id: 'upload', label: 'CSV Upload', icon: UploadCloud },
  ]

  const bottomNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

  return (
    <aside className="w-full md:w-64 bg-[#090D16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        <div className="px-2 pt-1 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Console Navigation
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        </div>

        <div>
          <nav className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-rose-500/20 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/30">
                      {item.badge}
                    </span>
                  ) : item.highlight ? (
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0E1526] border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Engine Status
            </span>
            <span className="font-mono text-[10px] text-orange-400">15F XGB</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            Multiclass detection online. Real-time inference active.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <button
          onClick={onShowLanding}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#111726] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
            <span>Landing Page</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {bottomNav.map((b) => {
          const Icon = b.icon
          return (
            <div
              key={b.id}
              className="flex items-center gap-3 px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{b.label}</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
