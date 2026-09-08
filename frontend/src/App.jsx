import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OverviewTab from './components/OverviewTab'
import FlowsTab from './components/FlowsTab'
import UploadTab from './components/UploadTab'
import CopilotTab from './components/CopilotTab'
import FlowModal from './components/FlowModal'
import LandingPage from './components/LandingPage'
import { fetchSummary, fetchLatestFlows } from './api'

export default function App() {
  const [viewMode, setViewMode] = useState('console')
  const [activeTab, setActiveTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [flows, setFlows] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [flowSearchFilter, setFlowSearchFilter] = useState('')
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState('')

  const loadData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [sum, fl] = await Promise.all([
        fetchSummary().catch(() => null),
        fetchLatestFlows(60).catch(() => []),
      ])
      if (sum) setSummary(sum)
      if (fl) setFlows(fl)
    } catch (e) {
      console.error(e)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 8000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleSelectFilter = (ip) => {
    setFlowSearchFilter(ip)
    setActiveTab('flows')
  }

  const handleSwitchToCopilot = (prompt) => {
    setCopilotInitialPrompt(prompt)
    setActiveTab('copilot')
  }

  if (viewMode === 'landing') {
    return <LandingPage onLaunchConsole={() => setViewMode('console')} />
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans">
      <Header
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        healthScore={summary?.healthScore ?? 100}
        onOpenLanding={() => setViewMode('landing')}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'flows') setFlowSearchFilter('')
            if (tab !== 'copilot') setCopilotInitialPrompt('')
            setActiveTab(tab)
          }}
          attackCount={summary?.attackFlows ?? 0}
          onShowLanding={() => setViewMode('landing')}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewTab
              summary={summary}
              onSelectFilter={handleSelectFilter}
            />
          )}

          {activeTab === 'flows' && (
            <FlowsTab
              flows={flows}
              onRefresh={loadData}
              onSelectFlow={setSelectedFlow}
              initialSearch={flowSearchFilter}
            />
          )}

          {activeTab === 'upload' && (
            <UploadTab
              onFlowsUploaded={loadData}
              onSelectFlow={setSelectedFlow}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotTab
              initialPrompt={copilotInitialPrompt}
            />
          )}
        </main>
      </div>

      {selectedFlow && (
        <FlowModal
          flow={selectedFlow}
          onClose={() => setSelectedFlow(null)}
          onAskCopilot={handleSwitchToCopilot}
        />
      )}
    </div>
  )
}
