export interface Transaction {
  id: number;
  reference: string;
  transactionType: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  exchangeRate: number | null;
  convertedAmount: number | null;
  targetCurrency: string | null;
  senderName: string;
  receiverName: string;
  senderBank: string;
  receiverBank: string;
  description: string;
  category: string;
  transactionDate: string;
  valueDate: string;
  settlementDate: string | null;
  region: string;
  branch: string;
  channel: string;
  riskScore: number;
  createdAt: string;
}

export interface GridResponse {
  rows: Transaction[];
  lastRow: number;
}

export interface GridRequest {
  startRow: number;
  endRow: number;
  sortModel?: SortModel[];
  filterModel?: Record<string, any>;
  searchTerm?: string;
  advancedSearch?: AdvancedSearchItem[];
}

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export interface AdvancedSearchItem {
  column: string;
  operator: string;
  value: any;
  valueTo?: any;
}

export interface AggregationRequest {
  columns: string[];
  filterModel?: Record<string, any>;
  searchTerm?: string;
  advancedSearch?: AdvancedSearchItem[];
}

export interface AggregationResult {
  [column: string]: {
    sum: number;
    avg: number;
    min: number;
    max: number;
    count: number;
  };
}

export interface DashboardStats {
  totalTransactions: number;
  totalVolume: number;
  avgAmount: number;
  statusBreakdown: { status: string; count: string }[];
  typeBreakdown: { type: string; count: string; volume: string }[];
  volumeByMonth: { month: string; count: string; volume: string }[];
}

export interface FilterGroup {
  group: string;
  items: string[];
}
