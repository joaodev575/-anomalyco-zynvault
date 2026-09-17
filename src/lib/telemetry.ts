import { api } from "./api";

let _appVersion = "1.0.0";
let _platform = "windows";
let _userId: string | null = null;

export function initTelemetry(userId: string, appVersion?: string, platform?: string) {
  _userId = userId;
  if (appVersion) _appVersion = appVersion;
  if (platform) _platform = platform;
}

export function clearTelemetry() {
  _userId = null;
}

export function trackActivity(action: string, category: string, detail?: string, metadata?: unknown) {
  if (!_userId) return;
  api.logActivity({ action, category, detail, metadata }).catch(() => {});
}

export function trackTelemetry(eventType: string, eventData?: unknown) {
  if (!_userId) return;
  api.logTelemetry({
    eventType,
    eventData,
    appVersion: _appVersion,
    platform: _platform,
  }).catch(() => {});
}

export function trackAppLaunch() {
  trackTelemetry("app_launch", { timestamp: Date.now() });
}

export function trackFeatureUse(feature: string, detail?: string) {
  trackTelemetry("feature_use", { feature, detail, timestamp: Date.now() });
}

export function trackSettingChange(setting: string, oldValue: unknown, newValue: unknown) {
  trackTelemetry("setting_change", { setting, oldValue, newValue, timestamp: Date.now() });
}

export function trackPerformanceMetric(metric: string, value: number) {
  trackTelemetry("performance_metric", { metric, value, timestamp: Date.now() });
}

export function trackError(context: string, error: string) {
  trackTelemetry("error", { context, error, timestamp: Date.now() });
}

// Predefined activity actions
interface ActivityAction {
  action: string;
  category: string;
}

export const ActivityActions: Record<string, ActivityAction> = {
  CLEAN_TEMP: { action: "Limpar temporários", category: "maintenance" },
  EMPTY_RECYCLE: { action: "Esvaziar lixeira", category: "maintenance" },
  FLUSH_DNS: { action: "Limpar DNS", category: "network" },
  OPTIMIZE_MEMORY: { action: "Otimizar memória", category: "optimization" },
  CLEAN_THUMBNAILS: { action: "Limpar cache thumbnails", category: "maintenance" },
  CLEAN_WU_CACHE: { action: "Limpar cache Windows Update", category: "maintenance" },
  RUN_SFC: { action: "Executar SFC", category: "health" },
  RUN_DISM: { action: "Executar DISM", category: "health" },
  RUN_CHKDSK: { action: "Executar CHKDSK", category: "health" },
  ENABLE_GAME_MODE: { action: "Ativar Game Mode", category: "optimization" },
  DISABLE_TELEMETRY: { action: "Desativar telemetria Windows", category: "privacy" },
  DISABLE_VISUAL: { action: "Desativar efeitos visuais", category: "optimization" },
  ENABLE_PERF: { action: "Ativar plano Ultimate Performance", category: "optimization" },
  DISABLE_SERVICES: { action: "Desativar serviços desnecessários", category: "optimization" },
  OPTIMIZE_NETWORK: { action: "Otimizar rede", category: "network" },
  RUN_PING: { action: "Executar ping", category: "network" },
  OPEN_TOOL: { action: "Abrir ferramenta Windows", category: "system" },
  SAVE_SETTINGS: { action: "Salvar configurações", category: "settings" },
  RESET_SETTINGS: { action: "Restaurar configurações padrão", category: "settings" },
  EXPORT_SETTINGS: { action: "Exportar configurações", category: "settings" },
  IMPORT_SETTINGS: { action: "Importar configurações", category: "settings" },
  HEALTH_CHECK: { action: "Executar diagnóstico de saúde", category: "health" },
  CHECK_UPDATE: { action: "Verificar atualizações", category: "system" },
  DOWNLOAD_UPDATE: { action: "Baixar atualização", category: "system" },
};
