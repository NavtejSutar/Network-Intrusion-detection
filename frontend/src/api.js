const BASE_URL = ''

export async function fetchSummary() {
  const res = await fetch(`${BASE_URL}/api/flows/summary`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchLatestFlows(limit = 50) {
  const res = await fetch(`${BASE_URL}/api/flows/latest?limit=${limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchAnomalies(limit = 30) {
  const res = await fetch(`${BASE_URL}/api/flows/anomalies?limit=${limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchFlowById(id) {
  const res = await fetch(`${BASE_URL}/api/flows/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteFlow(id) {
  const res = await fetch(`${BASE_URL}/api/flows/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function cleanupOldFlows(days = 7) {
  const res = await fetch(`${BASE_URL}/api/flows/cleanup?days=${days}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function uploadCsvFlows(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/api/flows/upload-csv`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `Upload failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchCaptureInterfaces() {
  const res = await fetch(`${BASE_URL}/api/capture/interfaces`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchCaptureStatus() {
  const res = await fetch(`${BASE_URL}/api/capture/status`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function startCapture(interfaceId = 'auto', duration = 30) {
  const params = new URLSearchParams({ interfaceId, duration: String(duration) })
  const res = await fetch(`${BASE_URL}/api/capture/start?${params}`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function stopCapture() {
  const res = await fetch(`${BASE_URL}/api/capture/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function analyzeFlowWithAi(id) {
  const res = await fetch(`${BASE_URL}/copilot/analyze?id=${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function streamCopilotChat(prompt, conversationId, onChunk, onDone, onError) {
  try {
    const params = new URLSearchParams({ prompt, conversationId })
    const res = await fetch(`${BASE_URL}/copilot/chat?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      onChunk(chunk)
    }
    if (onDone) onDone()
  } catch (err) {
    if (onError) onError(err)
  }
}
