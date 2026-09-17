export type SystemTab = 'cpu' | 'gpu' | 'ram'

export interface SystemMetric {
  usage: number
  temperature: number
  name: string
  uptime: string
}

export interface SystemData {
  cpu: SystemMetric
  gpu: SystemMetric
  ram: SystemMetric & { total: number; used: number }
}

export interface ChartPoint {
  time: string
  value: number
}

export interface QuickAction {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error' | 'disabled'
  icon: string
}

export interface OptimizationRecord {
  id: string
  title: string
  detail: string
  time: string
  status: 'success' | 'info' | 'warning'
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const generateChartData = (base: number, variance: number): ChartPoint[] => {
  const points: ChartPoint[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    points.push({
      time: `${hours}:${minutes}`,
      value: Math.max(5, Math.min(95, base + (Math.random() - 0.5) * variance)),
    })
  }
  return points
}

export const getChartData = (tab: SystemTab, realUsage?: number): ChartPoint[] => {
  const base = realUsage ?? (tab === 'cpu' ? 38 : tab === 'gpu' ? 24 : 68)
  const variance = tab === 'cpu' ? 30 : tab === 'gpu' ? 20 : 15
  return generateChartData(base, variance)
}

export const getQuickActions = (): QuickAction[] => [
  {
    id: 'clean-temp',
    title: 'Clean temporary files',
    description: 'Remove unnecessary system files.',
    status: 'pending',
    icon: 'trash-2',
  },
  {
    id: 'pc-boost',
    title: 'Run PC Boost',
    description: 'Analyze and apply recommended optimizations.',
    status: 'pending',
    icon: 'zap',
  },
  {
    id: 'check-system',
    title: 'Check system',
    description: 'Run a complete system check.',
    status: 'pending',
    icon: 'scan-search',
  },
]

export const getOptimizationHistory = (): OptimizationRecord[] => [
  {
    id: '1',
    title: 'Memory',
    detail: '6.8 GB freed',
    time: '1h ago',
    status: 'success',
  },
  {
    id: '2',
    title: 'Temporary files',
    detail: '2.4 GB removed',
    time: '3h ago',
    status: 'success',
  },
  {
    id: '3',
    title: 'Network',
    detail: 'Settings applied',
    time: 'yesterday',
    status: 'info',
  },
  {
    id: '4',
    title: 'Windows Update',
    detail: 'Pending updates',
    time: 'yesterday',
    status: 'warning',
  },
  {
    id: '5',
    title: 'Disk',
    detail: '1.2 GB optimized',
    time: '2 days ago',
    status: 'success',
  },
]

export const getNotifications = (): Notification[] => [
  {
    id: '1',
    title: 'System optimized',
    message: 'All optimizations were applied successfully.',
    time: '5 min ago',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Update available',
    message: 'A new version of ZynVault is available.',
    time: '1h ago',
    read: false,
    type: 'info',
  },
  {
    id: '3',
    title: 'Warning: Disk almost full',
    message: 'Your C: drive has only 15% free space remaining.',
    time: '3h ago',
    read: true,
    type: 'warning',
  },
]
