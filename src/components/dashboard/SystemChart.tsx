import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getChartData, type SystemTab } from '../../services/mockData'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--zx-bg-3)', border: '1px solid var(--zx-border-3)', borderRadius: 'var(--zx-radius-2)', padding: '6px 10px', boxShadow: 'var(--zx-shadow-2)' }}>
      <p style={{ fontSize: 'var(--zx-text-xs)', color: 'var(--zx-text-3)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 'var(--zx-text-sm)', fontWeight: 600, color: 'var(--zx-text-1)' }}>{payload[0].value.toFixed(1)}%</p>
    </div>
  )
}

interface SystemChartProps {
  tab: SystemTab
  realUsage?: number
}

export function SystemChart({ tab, realUsage }: SystemChartProps) {
  const data = useMemo(() => getChartData(tab, realUsage), [tab, realUsage])

  const color = useMemo(() => {
    switch (tab) {
      case 'cpu': return { stroke: '#2563EB', fill: '#2563EB' }
      case 'gpu': return { stroke: '#22C55E', fill: '#22C55E' }
      case 'ram': return { stroke: '#3B82F6', fill: '#3B82F6' }
    }
  }, [tab])

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${tab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color.fill} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--zx-border-1)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--zx-text-4)' }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--zx-text-4)' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke={color.stroke} strokeWidth={1.5} fill={`url(#gradient-${tab})`} dot={false} activeDot={{ r: 3, fill: color.stroke, stroke: 'var(--zx-bg-3)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
