import { useState, useCallback } from 'react'
import { FileText, Download, RefreshCw, Check, Printer, Globe } from 'lucide-react'
import { useMetrics, type SystemMetrics } from '../contexts/MetricsContext'
import { formatBytes, formatUptime } from '../services/mockData'

type ExportFormat = 'json' | 'txt' | 'html'

function generateJSON(data: SystemMetrics | null) {
  if (!data) return '{}'
  return JSON.stringify({
    geradoEm: new Date().toISOString(),
    sistema: data.system,
    cpu: data.cpu,
    gpu: data.gpu,
    ram: data.ram,
    disco: data.disk,
    rede: data.network,
    uptime: data.uptime,
  }, null, 2)
}

function generateTXT(data: SystemMetrics | null) {
  if (!data) return 'Sem dados disponiveis'
  const lines = [
    '=== Relatorio do Sistema ZynVault ===',
    `Gerado em: ${new Date().toLocaleString()}`,
    '',
    '--- Sistema ---',
    `Hostname: ${data.system.hostname}`,
    `Plataforma: ${data.system.platform}`,
    `Versao: ${data.system.release}`,
    `Arquitetura: ${data.system.arch}`,
    `Versao Windows: ${data.system.windowsVersion}`,
    `Uptime: ${formatUptime(data.uptime)}`,
    '',
    '--- CPU ---',
    `Modelo: ${data.cpu.name}`,
    `Nucleos: ${data.cpu.cores}`,
    `Velocidade: ${data.cpu.speed} GHz`,
    `Uso: ${data.cpu.usage}%`,
    '',
    '--- GPU ---',
    `Modelo: ${data.gpu.name}`,
    `Fabricante: ${data.gpu.vendor}`,
    `VRAM: ${formatBytes(data.gpu.vramTotal)}`,
    `Uso: ${data.gpu.usage}%`,
    '',
    '--- Memoria ---',
    `Total: ${formatBytes(data.ram.total)}`,
    `Usado: ${formatBytes(data.ram.used)}`,
    `Livre: ${formatBytes(data.ram.free)}`,
    `Uso: ${data.ram.percentage}%`,
    '',
    '--- Armazenamento ---',
    data.disk ? [
      `Total: ${formatBytes(data.disk.total)}`,
      `Usado: ${formatBytes(data.disk.used)}`,
      `Livre: ${formatBytes(data.disk.free)}`,
      `Uso: ${data.disk.percentage}%`,
    ].join('\n') : 'Sem dados do disco',
    '',
    '--- Rede ---',
    `Interface: ${data.network.iface}`,
    `IP: ${data.network.ip}`,
    `Velocidade: ${data.network.speed} Mbps`,
  ]
  return lines.join('\n')
}

function generateHTML(data: SystemMetrics | null) {
  if (!data) return '<html><body>Sem dados</body></html>'
  return `<!DOCTYPE html>
<html><head><title>Relatorio ZynVault</title>
<style>
body{font-family:system-ui;background:#0a0a0f;color:#e0e0e0;padding:20px}
h1{color:#3b82f6;font-size:18px}
h2{color:#94a3b8;font-size:13px;border-bottom:1px solid #1e293b;padding-bottom:4px;margin-top:16px}
table{width:100%;border-collapse:collapse;font-size:12px}
td{padding:4px 8px;border-bottom:1px solid #1e293b}
td:first-child{color:#64748b;width:40%}
td:last-child{color:#e2e8f0}
</style></head><body>
<h1>Relatorio do Sistema ZynVault</h1>
<p style="color:#64748b;font-size:11px">Gerado em: ${new Date().toLocaleString()}</p>
<h2>Sistema</h2>
<table>
<tr><td>Hostname</td><td>${data.system.hostname}</td></tr>
<tr><td>Plataforma</td><td>${data.system.platform}</td></tr>
<tr><td>Versao</td><td>${data.system.release}</td></tr>
<tr><td>Arquitetura</td><td>${data.system.arch}</td></tr>
<tr><td>Uptime</td><td>${formatUptime(data.uptime)}</td></tr>
</table>
<h2>CPU</h2>
<table>
<tr><td>Modelo</td><td>${data.cpu.name}</td></tr>
<tr><td>Nucleos</td><td>${data.cpu.cores}</td></tr>
<tr><td>Velocidade</td><td>${data.cpu.speed} GHz</td></tr>
<tr><td>Uso</td><td>${data.cpu.usage}%</td></tr>
</table>
<h2>GPU</h2>
<table>
<tr><td>Modelo</td><td>${data.gpu.name}</td></tr>
<tr><td>Fabricante</td><td>${data.gpu.vendor}</td></tr>
<tr><td>VRAM</td><td>${formatBytes(data.gpu.vramTotal)}</td></tr>
<tr><td>Uso</td><td>${data.gpu.usage}%</td></tr>
</table>
<h2>Memoria</h2>
<table>
<tr><td>Total</td><td>${formatBytes(data.ram.total)}</td></tr>
<tr><td>Usado</td><td>${formatBytes(data.ram.used)}</td></tr>
<tr><td>Livre</td><td>${formatBytes(data.ram.free)}</td></tr>
<tr><td>Uso</td><td>${data.ram.percentage}%</td></tr>
</table>
<h2>Armazenamento</h2>
<table>
${data.disk ? `
<tr><td>Total</td><td>${formatBytes(data.disk.total)}</td></tr>
<tr><td>Usado</td><td>${formatBytes(data.disk.used)}</td></tr>
<tr><td>Livre</td><td>${formatBytes(data.disk.free)}</td></tr>
<tr><td>Uso</td><td>${data.disk.percentage}%</td></tr>
` : '<tr><td>Status</td><td>Sem dados</td></tr>'}
</table>
<h2>Rede</h2>
<table>
<tr><td>Interface</td><td>${data.network.iface}</td></tr>
<tr><td>IP</td><td>${data.network.ip}</td></tr>
<tr><td>Velocidade</td><td>${data.network.speed} Mbps</td></tr>
</table>
</body></html>`
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { data, refresh } = useMetrics()
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, 'idle' | 'done'>>({ json: 'idle', txt: 'idle', html: 'idle' })

  const exportReport = useCallback((format: ExportFormat) => {
    setExportStatus(prev => ({ ...prev, [format]: 'done' }))

    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    if (format === 'json') {
      downloadFile(generateJSON(data), `zynvault-relatorio-${timestamp}.json`, 'application/json')
    } else if (format === 'txt') {
      downloadFile(generateTXT(data), `zynvault-relatorio-${timestamp}.txt`, 'text/plain')
    } else {
      downloadFile(generateHTML(data), `zynvault-relatorio-${timestamp}.html`, 'text/html')
    }

    setTimeout(() => setExportStatus(prev => ({ ...prev, [format]: 'idle' })), 2000)
  }, [data])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-[var(--zx-text-1)]">Relatorios do Sistema</h1>
          <p className="text-[10px] text-[var(--zx-text-3)] mt-0.5">Gerar e exportar relatorios do sistema</p>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] border border-[var(--zx-border-1)] bg-[var(--zx-bg-2)] px-3 py-1.5 text-[9px] font-medium text-[var(--zx-text-2)] hover:bg-[var(--zx-bg-3)] transition-all duration-[var(--zx-transition-1)]"
        >
          <RefreshCw size={10} />
          Atualizar
        </button>
      </div>

      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-3">Resumo do Relatorio</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] p-3 border border-[var(--zx-border-1)]">
            <p className="text-[9px] text-[var(--zx-text-3)] mb-0.5">CPU</p>
            <p className="text-[12px] font-semibold text-[var(--zx-text-1)]">{data?.cpu.usage ?? 0}%</p>
            <p className="text-[8px] text-[var(--zx-text-3)] truncate">{data?.cpu.name || 'N/A'}</p>
          </div>
          <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] p-3 border border-[var(--zx-border-1)]">
            <p className="text-[9px] text-[var(--zx-text-3)] mb-0.5">RAM</p>
            <p className="text-[12px] font-semibold text-[var(--zx-text-1)]">{data?.ram.percentage ?? 0}%</p>
            <p className="text-[8px] text-[var(--zx-text-3)]">{data?.ram ? `${formatBytes(data.ram.used)} / ${formatBytes(data.ram.total)}` : 'N/A'}</p>
          </div>
          <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] p-3 border border-[var(--zx-border-1)]">
            <p className="text-[9px] text-[var(--zx-text-3)] mb-0.5">Disco</p>
            <p className="text-[12px] font-semibold text-[var(--zx-text-1)]">{data?.disk?.percentage ?? 0}%</p>
            <p className="text-[8px] text-[var(--zx-text-3)]">{data?.disk ? `${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)}` : 'N/A'}</p>
          </div>
          <div className="rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] p-3 border border-[var(--zx-border-1)]">
            <p className="text-[9px] text-[var(--zx-text-3)] mb-0.5">GPU</p>
            <p className="text-[12px] font-semibold text-[var(--zx-text-1)]">{data?.gpu.usage ?? 0}%</p>
            <p className="text-[8px] text-[var(--zx-text-3)] truncate">{data?.gpu.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
              <FileText size={12} className="text-[var(--zx-text-3)]" />
            </div>
            <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Relatorio JSON</h3>
          </div>
          <p className="text-[9px] text-[var(--zx-text-3)] mb-3">Formato legivel por maquinas para integracao com API e processamento de dados.</p>
          <button
            onClick={() => exportReport('json')}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] disabled:opacity-50 w-full justify-center transition-all duration-[var(--zx-transition-1)]"
          >
            {exportStatus.json === 'done' ? <Check size={10} /> : <Download size={10} />}
            {exportStatus.json === 'done' ? 'Exportado' : 'Exportar JSON'}
          </button>
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
              <Printer size={12} className="text-[var(--zx-text-3)]" />
            </div>
            <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Relatorio Texto</h3>
          </div>
          <p className="text-[9px] text-[var(--zx-text-3)] mb-3">Formato de texto simples para compartilhamento rapido e registro.</p>
          <button
            onClick={() => exportReport('txt')}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] disabled:opacity-50 w-full justify-center transition-all duration-[var(--zx-transition-1)]"
          >
            {exportStatus.txt === 'done' ? <Check size={10} /> : <Download size={10} />}
            {exportStatus.txt === 'done' ? 'Exportado' : 'Exportar TXT'}
          </button>
        </div>

        <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--zx-radius-2)] bg-[var(--zx-bg-1)] border border-[var(--zx-border-1)]">
              <Globe size={12} className="text-[var(--zx-text-3)]" />
            </div>
            <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)]">Relatorio HTML</h3>
          </div>
          <p className="text-[9px] text-[var(--zx-text-3)] mb-3">Relatorio formatado com estilos para visualizacao em qualquer navegador.</p>
          <button
            onClick={() => exportReport('html')}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-[var(--zx-radius-2)] bg-[var(--zx-brand)] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[var(--zx-brand-hover)] disabled:opacity-50 w-full justify-center transition-all duration-[var(--zx-transition-1)]"
          >
            {exportStatus.html === 'done' ? <Check size={10} /> : <Download size={10} />}
            {exportStatus.html === 'done' ? 'Exportado' : 'Exportar HTML'}
          </button>
        </div>
      </div>

      <div className="zx-panel-strong p-4 rounded-[var(--zx-radius-3)] border border-[var(--zx-border-1)]">
        <h3 className="text-[11px] font-semibold text-[var(--zx-text-1)] mb-2">Detalhes do Sistema</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Hostname</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data?.system.hostname || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Plataforma</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data?.system.platform || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Arquitetura</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data?.system.arch || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Uptime</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data ? formatUptime(data.uptime) : 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Endereco IP</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data?.network.ip || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--zx-border-1)]">
            <span className="text-[9px] text-[var(--zx-text-3)]">Nucleos CPU</span>
            <span className="text-[9px] font-medium text-[var(--zx-text-2)]">{data?.cpu.cores || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
