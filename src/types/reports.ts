export type ReportType = 'booking' | 'revenue' | 'customer' | 'agent' | 'tour' | 'vehicle' | 'guide' | 'commission' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';
export type ReportStatus = 'draft' | 'scheduled' | 'generating' | 'completed' | 'failed';
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'donut' | 'funnel' | 'heatmap';
export type MetricType = 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'trend';
export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
export type DateRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom';

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  format: ReportFormat;
  template?: ReportTemplate;
  filters: ReportFilter[];
  metrics: ReportMetric[];
  charts: ReportChart[];
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  createdBy: string; // User ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  lastGeneratedAt?: string; // ISO string
  lastGeneratedBy?: string; // User ID
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: string;
  isDefault: boolean;
  isPublic: boolean;
  template: {
    filters: ReportFilter[];
    metrics: ReportMetric[];
    charts: ReportChart[];
    layout: ReportLayout;
  };
  createdBy: string; // User ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ReportFilter {
  id: string;
  field: string;
  label: string;
  operator: FilterOperator;
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'array';
  isRequired: boolean;
  options?: { label: string; value: any }[];
}

export interface ReportMetric {
  id: string;
  name: string;
  label: string;
  type: MetricType;
  field: string;
  aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
  format?: string; // e.g., 'currency', 'percentage', 'number'
  isVisible: boolean;
  order: number;
}

export interface ReportChart {
  id: string;
  name: string;
  type: ChartType;
  title: string;
  description?: string;
  dataSource: string; // Field or query
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  filters: ReportFilter[];
  options: ChartOptions;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
}

export interface ChartOptions {
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  fill?: boolean;
  radius?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface ReportLayout {
  columns: number;
  rows: number;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'charts' | 'table' | 'text';
  content: any; // Section-specific content
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
}

export interface ReportSchedule {
  id: string;
  frequency: ReportFrequency;
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone: string;
  isActive: boolean;
  nextRunAt?: string; // ISO string
  lastRunAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ReportRecipient {
  id: string;
  type: 'email' | 'user' | 'role';
  value: string; // Email address, user ID, or role name
  name?: string;
  isActive: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: ReportStatus;
  startedAt: string; // ISO string
  completedAt?: string; // ISO string
  duration?: number; // Milliseconds
  fileUrl?: string;
  fileSize?: number; // Bytes
  error?: string;
  generatedBy: string; // User ID
  parameters: { [key: string]: any };
  createdAt: string; // ISO string
}

export interface ReportData {
  id: string;
  reportId: string;
  executionId: string;
  data: any; // The actual report data
  metadata: {
    totalRecords: number;
    generatedAt: string; // ISO string
    dataRange: {
      startDate: string;
      endDate: string;
    };
    filters: { [key: string]: any };
  };
  createdAt: string; // ISO string
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // Seconds
  createdBy: string; // User ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  breakpoints: {
    mobile: { columns: number; rows: number };
    tablet: { columns: number; rows: number };
    desktop: { columns: number; rows: number };
  };
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'kpi' | 'text';
  title: string;
  dataSource: string;
  config: WidgetConfig;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  refreshInterval?: number; // Seconds
}

export interface WidgetConfig {
  chartType?: ChartType;
  metricType?: MetricType;
  format?: string;
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  threshold?: {
    value: number;
    color: string;
    operator: 'greater_than' | 'less_than' | 'equals';
  };
  options?: { [key: string]: any };
}

export interface DashboardFilter {
  id: string;
  field: string;
  label: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number';
  defaultValue?: any;
  options?: { label: string; value: any }[];
  isGlobal: boolean; // Apply to all widgets
}

export interface Analytics {
  id: string;
  name: string;
  description?: string;
  type: 'kpi' | 'trend' | 'comparison' | 'distribution' | 'correlation';
  dataSource: string;
  metrics: AnalyticsMetric[];
  dimensions: AnalyticsDimension[];
  filters: AnalyticsFilter[];
  timeRange: {
    startDate: string;
    endDate: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  isRealTime: boolean;
  refreshInterval: number; // Seconds
  createdBy: string; // User ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  field: string;
  type: MetricType;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct';
  format?: string;
  isVisible: boolean;
  order: number;
}

export interface AnalyticsDimension {
  id: string;
  name: string;
  field: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  isVisible: boolean;
  order: number;
}

export interface AnalyticsFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  isActive: boolean;
}

export interface ExportJob {
  id: string;
  reportId: string;
  format: ReportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number; // Bytes
  requestedBy: string; // User ID
  requestedAt: string; // ISO string
  completedAt?: string; // ISO string
  error?: string;
  parameters: { [key: string]: any };
}

export interface ReportShare {
  id: string;
  reportId: string;
  token: string;
  permissions: {
    view: boolean;
    download: boolean;
    edit: boolean;
  };
  expiresAt?: string; // ISO string
  isActive: boolean;
  sharedBy: string; // User ID
  sharedAt: string; // ISO string
  accessCount: number;
  lastAccessedAt?: string; // ISO string
}

export interface ReportComment {
  id: string;
  reportId: string;
  content: string;
  author: string; // User ID
  authorName: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isResolved: boolean;
  parentId?: string; // For replies
}

export interface ReportAuditLog {
  id: string;
  reportId: string;
  action: 'created' | 'updated' | 'deleted' | 'executed' | 'shared' | 'commented' | 'exported';
  details: { [key: string]: any };
  userId: string;
  userName: string;
  timestamp: string; // ISO string
  ipAddress?: string;
  userAgent?: string;
}


