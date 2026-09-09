import React from 'react'

export default function MarkdownRenderer({ content }) {
  if (!content) return null

  const parseInline = (text) => {
    const parts = []
    let current = text
    let key = 0

    const regex = /(\*\*.*?\*\*|`.*?`|\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g
    let match
    let lastIndex = 0

    while ((match = regex.exec(current)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{current.slice(lastIndex, match.index)}</span>)
      }

      const matchText = match[0]
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={key++} className="font-bold text-white">
            {matchText.slice(2, -2)}
          </strong>
        )
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded bg-[#1A2338] text-orange-300 font-mono text-[11px] border border-orange-500/20">
            {matchText.slice(1, -1)}
          </code>
        )
      } else {
        parts.push(
          <span key={key++} className="font-mono text-orange-400 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20 text-[11px]">
            {matchText}
          </span>
        )
      }
      lastIndex = regex.lastIndex
    }

    if (lastIndex < current.length) {
      parts.push(<span key={key++}>{current.slice(lastIndex)}</span>)
    }

    return parts.length > 0 ? parts : text
  }

  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let inTable = false

  const flushTable = (k) => {
    if (tableRows.length === 0) return null
    const header = tableRows[0]
    const rows = tableRows.slice(1)
    const tableElement = (
      <div key={`table-${k}`} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0E1424]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#161F33]">
              {header.map((col, idx) => (
                <th key={idx} className="px-3 py-2 text-slate-300 font-semibold font-mono text-[11px]">
                  {parseInline(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-slate-300">
                    {parseInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableRows = []
    return tableElement
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const line = rawLine.trim()

    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true
      const cells = line.slice(1, -1).split('|')
      if (!cells.every(c => /^[:-\s]+$/.test(c.trim()))) {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      elements.push(flushTable(i))
      inTable = false
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-xs font-bold uppercase tracking-wider text-orange-400 mt-3 mb-1">
          {parseInline(line.replace('### ', ''))}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-white mt-3.5 mb-1.5 pb-1 border-b border-slate-800">
          {parseInline(line.replace('## ', ''))}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-orange-300 mt-4 mb-2">
          {parseInline(line.replace('# ', ''))}
        </h2>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-slate-300 text-xs pl-1">
          <span className="text-orange-400 mt-1 text-[8px]">•</span>
          <span className="leading-relaxed">{parseInline(line.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-slate-300 text-xs pl-1">
          <span className="font-mono text-orange-400 text-xs">{match[1]}.</span>
          <span className="leading-relaxed">{parseInline(match[2])}</span>
        </div>
      )
    } else if (line.length === 0) {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-slate-300 my-1">
          {parseInline(rawLine)}
        </p>
      )
    }
  }

  if (inTable && tableRows.length > 0) {
    elements.push(flushTable('end'))
  }

  return <div className="space-y-0.5">{elements}</div>
}
