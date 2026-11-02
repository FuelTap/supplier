// Shared types for the super admin (supplier) pages.

export type ManagerStatus = "pending" | "active" | "inactive";

export type Manager = {
  id: string;
  code: string; // e.g. "MGR-1273"
  name: string;
  email: string;
  phone: string;
  stationId: string | null;
  // Station they had before being suspended, used when reactivating.
  previousStationId: string | null;
  status: ManagerStatus;
  lastLoginAt: string | null; // ISO date
  outstandingOrders: number;
  invitedAt: string; // ISO date
};

// A manager joined with their station, as the pages display it.
export type ManagerView = Manager & {
  station: {
    id: string;
    name: string;
    state: string;
    displayStatus: StationDisplayStatus;
  } | null;
};

export type ComplianceStatus = "pending" | "verified";

export type StationProduct = {
  name: string;
  price: number;
  unit: "L" | "kg";
};

export type StationStats = {
  todaySales: number;
  todaySalesTrend: number; // % vs yesterday
  todayOrders: number;
  todayOrdersTrend: number;
  monthSales: number;
  monthSalesTrend: number; // % vs last month
  monthOrders: number;
  monthOrdersTrend: number;
};

export type Station = {
  id: string;
  code: string; // e.g. "STN-1275"
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  managerId: string | null;
  complianceStatus: ComplianceStatus;
  // Set when the super admin deactivates the station.
  deactivated: boolean;
  outstandingOrders: number;
  closesAt: string; // e.g. "6:00 PM"
  products: StationProduct[];
  stats: StationStats;
  createdAt: string; // ISO date
};

// What the UI shows for a station's status columns.
export type StationDisplayStatus = "active" | "inactive" | "unassigned";

export type StationManagerSummary = Pick<
  Manager,
  "id" | "name" | "email" | "phone" | "status"
>;

// A station joined with its manager, as the pages display it.
export type StationView = Station & {
  manager: StationManagerSummary | null;
  displayStatus: StationDisplayStatus;
};

export type OrderStatus =
  | "new"
  | "ready"
  | "delivered"
  | "out-for-delivery"
  | "cancelled"
  | "scheduled";

export type StationOrder = {
  id: string;
  code: string; // e.g. "ORD-1273"
  frequency: "One-time" | "Recurring";
  customer: string;
  fuelType: string;
  quantity: string; // e.g. "50 L"
  amount: number;
  status: OrderStatus;
};

export type InventoryItem = {
  id: string;
  stationId: string;
  branchName: string;
  managerName: string | null;
  state: string;
  fuelType: "Petrol" | "Diesel" | "Cooking Gas";
  pricePerUnit: number;
  enabled: boolean;
  lastUpdated: string; // ISO date
};

export type TrendPoint = { label: string; value: number };

export type StatValue = { value: number; trend: number };

export type DashboardMetrics = {
  salesThisMonth: StatValue;
  ordersThisMonth: StatValue;
  pendingOrders: StatValue;
  activeStations: StatValue;
  revenueTotal: StatValue;
  revenueTrend: TrendPoint[];
  ordersTotal: StatValue;
  ordersTrend: TrendPoint[];
  topStations: { name: string; revenue: number }[];
  lowestStations: { name: string; revenue: number }[];
};

export type SetupStatus = {
  kybSubmitted: boolean;
  hasManager: boolean;
  hasStation: boolean;
  // True once the "Processing…" hand-off to the full dashboard has been shown.
  completionShown: boolean;
};

export type Company = {
  name: string;
};

export type Invite = {
  token: string;
  email: string;
  role: string;
  organisation: string;
  expiresAt: string; // ISO date
};

export type QueryResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

// Result of an action that the backend may refuse, e.g. suspending a manager
// with outstanding orders.
export type ActionResult =
  | { success: true; message: string }
  | { success: false; blocked: true; message: string }
  | { success: false; blocked?: false; message: string };
