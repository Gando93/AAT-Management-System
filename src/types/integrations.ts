export type IntegrationType = 'payment_gateway' | 'booking_platform' | 'crm' | 'email_service' | 'sms_service' | 'analytics' | 'webhook' | 'api' | 'database' | 'file_sync' | 'custom';
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending' | 'testing' | 'maintenance';
export type AuthenticationType = 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'custom';
export type WebhookEvent = 'booking_created' | 'booking_updated' | 'booking_cancelled' | 'payment_received' | 'customer_created' | 'tour_updated' | 'custom';
export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';
export type SyncStatus = 'success' | 'failed' | 'pending' | 'retrying' | 'cancelled';
export type DataFormat = 'json' | 'xml' | 'csv' | 'form_data' | 'binary';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type RetryStrategy = 'immediate' | 'exponential_backoff' | 'linear' | 'custom';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Integration {
  id: string;
  name: string;
  description?: string;
  type: IntegrationType;
  status: IntegrationStatus;
  provider: string; // e.g., 'stripe', 'booking.com', 'salesforce'
  version: string;
  baseUrl: string;
  authentication: AuthenticationConfig;
  configuration: IntegrationConfiguration;
  webhooks: WebhookConfig[];
  syncRules: SyncRule[];
  isActive: boolean;
  isTestMode: boolean;
  lastSyncAt?: string; // ISO string
  lastErrorAt?: string; // ISO string
  lastErrorMessage?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdBy: string; // User ID
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  credentials: {
    apiKey?: string;
    secret?: string;
    username?: string;
    password?: string;
    token?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scope?: string[];
    custom?: { [key: string]: any };
  };
  headers?: { [key: string]: string };
  queryParams?: { [key: string]: string };
  expiresAt?: string; // ISO string for OAuth tokens
  refreshToken?: string;
}

export interface IntegrationConfiguration {
  timeout: number; // milliseconds
  retryAttempts: number;
  retryStrategy: RetryStrategy;
  retryDelay: number; // milliseconds
  rateLimit: {
    requests: number;
    period: number; // seconds
  };
  dataFormat: DataFormat;
  encoding: string; // e.g., 'utf-8'
  compression: boolean;
  encryption: boolean;
  customSettings?: { [key: string]: any };
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  method: HttpMethod;
  headers: { [key: string]: string };
  authentication?: AuthenticationConfig;
  isActive: boolean;
  retryAttempts: number;
  timeout: number; // milliseconds
  secret?: string; // for webhook signature verification
  filters?: WebhookFilter[];
  transformations?: WebhookTransformation[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface WebhookFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface WebhookTransformation {
  field: string;
  operation: 'map' | 'format' | 'calculate' | 'filter' | 'default';
  value: any;
  condition?: WebhookFilter;
}

export interface SyncRule {
  id: string;
  name: string;
  description?: string;
  sourceField: string;
  targetField: string;
  direction: SyncDirection;
  transformation?: {
    type: 'map' | 'format' | 'calculate' | 'filter';
    value: any;
  };
  isActive: boolean;
  priority: number;
  conditions?: SyncCondition[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface SyncCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  type: 'full' | 'incremental' | 'manual';
  status: SyncStatus;
  direction: SyncDirection;
  startedAt: string; // ISO string
  completedAt?: string; // ISO string
  duration?: number; // milliseconds
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  triggeredBy: string; // User ID or 'system'
  createdAt: string; // ISO string
}

export interface SyncLog {
  id: string;
  syncJobId: string;
  integrationId: string;
  level: LogLevel;
  message: string;
  details?: any;
  timestamp: string; // ISO string
  source?: string; // e.g., 'api', 'webhook', 'scheduler'
}

export interface WebhookEventData {
  id: string;
  webhookId: string;
  integrationId: string;
  event: WebhookEvent;
  payload: any;
  headers: { [key: string]: string };
  status: 'received' | 'processing' | 'processed' | 'failed' | 'ignored';
  processedAt?: string; // ISO string
  errorMessage?: string;
  retryCount: number;
  createdAt: string; // ISO string
}

export interface IntegrationTest {
  id: string;
  integrationId: string;
  name: string;
  description?: string;
  testType: 'connection' | 'authentication' | 'data_sync' | 'webhook' | 'custom';
  configuration: {
    endpoint?: string;
    method?: HttpMethod;
    headers?: { [key: string]: string };
    body?: any;
    expectedResponse?: any;
    timeout?: number;
  };
  isActive: boolean;
  lastRunAt?: string; // ISO string
  lastResult?: 'passed' | 'failed' | 'error';
  lastErrorMessage?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface IntegrationMonitor {
  id: string;
  integrationId: string;
  name: string;
  description?: string;
  metric: 'uptime' | 'response_time' | 'error_rate' | 'throughput' | 'custom';
  threshold: {
    value: number;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
    unit?: string; // e.g., 'ms', '%', 'requests/min'
  };
  isActive: boolean;
  alertChannels: string[]; // Notification channel IDs
  lastAlertAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface IntegrationAlert {
  id: string;
  integrationId: string;
  monitorId: string;
  type: 'threshold_exceeded' | 'connection_failed' | 'sync_failed' | 'webhook_failed' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string; // User ID
  acknowledgedAt?: string; // ISO string
  resolvedAt?: string; // ISO string
  createdAt: string; // ISO string
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description?: string;
  type: IntegrationType;
  provider: string;
  version: string;
  category: string;
  isOfficial: boolean;
  isPublic: boolean;
  configuration: {
    baseUrl: string;
    authentication: AuthenticationConfig;
    webhooks: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>[];
    syncRules: Omit<SyncRule, 'id' | 'createdAt' | 'updatedAt'>[];
    tests: Omit<IntegrationTest, 'id' | 'integrationId' | 'createdAt' | 'updatedAt'>[];
  };
  documentation?: string;
  supportUrl?: string;
  createdBy: string; // User ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface IntegrationUsage {
  id: string;
  integrationId: string;
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  metrics: {
    apiCalls: number;
    webhookEvents: number;
    syncJobs: number;
    dataTransferred: number; // bytes
    errorRate: number; // percentage
    averageResponseTime: number; // milliseconds
    uptime: number; // percentage
  };
  costs?: {
    apiCalls: number;
    dataTransfer: number;
    storage: number;
    total: number;
    currency: string;
  };
  createdAt: string; // ISO string
}

export interface IntegrationAuditLog {
  id: string;
  integrationId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'tested' | 'synced' | 'webhook_received' | 'error_occurred';
  details: { [key: string]: any };
  userId: string;
  userName: string;
  timestamp: string; // ISO string
  ipAddress?: string;
  userAgent?: string;
}
