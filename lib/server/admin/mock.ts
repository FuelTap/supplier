import "server-only";

import type {
  Company,
  DashboardMetrics,
  Invite,
  Manager,
  Station,
  StationOrder,
  StationStats,
} from "./types";

// There is no backend for the super admin pages yet, so every admin server
// action reads and writes this in-memory store. When the API exists, replace
// the bodies of the functions in lib/server/admin/*.ts and delete this file.
//
// Switch the scenario to preview the designs:
// - "new-user": brand-new supplier, setup checklist at 1/4, everything empty.
// - "existing-user": fully set up account with stations, managers and orders.
//
// Handy mock values:
// - Invite link: /admin/register?token=demo-invite (any other token is invalid)
// - Forgot password OTP: any 6 digits work except 000000, which is rejected.
type MockScenario = "new-user" | "existing-user";

export const MOCK_SCENARIO = "existing-user" as MockScenario;

export const MOCK_DELAY_MS = 400;

export const MOCK_INVITE_TOKEN = "demo-invite";

type Store = {
  scenario: MockScenario;
  company: Company;
  kybSubmitted: boolean;
  completionShown: boolean;
  stations: Station[];
  managers: Manager[];
  orders: Record<string, StationOrder[]>;
  invites: Invite[];
};

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const emptyStats: StationStats = {
  todaySales: 0,
  todaySalesTrend: 0,
  todayOrders: 0,
  todayOrdersTrend: 0,
  monthSales: 0,
  monthSalesTrend: 0,
  monthOrders: 0,
  monthOrdersTrend: 0,
};

const defaultProducts: Station["products"] = [
  { name: "Petrol PMS", price: 980, unit: "L" },
  { name: "Diesel AGO", price: 1150, unit: "L" },
  { name: "Cooking Gas", price: 2000, unit: "kg" },
];

function seedExistingUser(): Omit<Store, "scenario" | "invites"> {
  const stations: Station[] = [
    {
      id: "stn-1276",
      code: "STN-1276",
      name: "TotalEnergies - Victoria Island",
      address: "14 Adetokunbo Ademola Street",
      city: "Victoria Island",
      state: "Lagos",
      latitude: 6.4302,
      longitude: 3.4216,
      managerId: "mgr-1275",
      complianceStatus: "verified",
      deactivated: false,
      outstandingOrders: 3,
      closesAt: "6:00 PM",
      products: defaultProducts,
      stats: {
        todaySales: 980_000,
        todaySalesTrend: 1,
        todayOrders: 64,
        todayOrdersTrend: 1,
        monthSales: 980_000,
        monthSalesTrend: 8,
        monthOrders: 64,
        monthOrdersTrend: -0.5,
      },
      createdAt: hoursAgo(24 * 90),
    },
    {
      id: "stn-1275",
      code: "STN-1275",
      name: "TotalEnergies - Lekki Phase 1",
      address: "12 Admiralty Way, Lekki Phase 1",
      city: "Lekki",
      state: "Lagos",
      latitude: 6.4474,
      longitude: 3.4723,
      managerId: "mgr-1276",
      complianceStatus: "verified",
      deactivated: false,
      outstandingOrders: 0,
      closesAt: "8:00 PM",
      products: defaultProducts,
      stats: {
        todaySales: 875_000,
        todaySalesTrend: 2.4,
        todayOrders: 51,
        todayOrdersTrend: 3,
        monthSales: 3_120_000,
        monthSalesTrend: 6,
        monthOrders: 402,
        monthOrdersTrend: 4.2,
      },
      createdAt: hoursAgo(24 * 80),
    },
    {
      id: "stn-1274",
      code: "STN-1274",
      name: "TotalEnergies - Ikeja GRA",
      address: "5 Isaac John Street, Ikeja GRA",
      city: "Ikeja",
      state: "Lagos",
      latitude: 6.5774,
      longitude: 3.3532,
      managerId: "mgr-1271",
      complianceStatus: "pending",
      deactivated: false,
      outstandingOrders: 0,
      closesAt: "6:00 PM",
      products: defaultProducts,
      stats: emptyStats,
      createdAt: hoursAgo(24 * 6),
    },
    {
      id: "stn-1273",
      code: "STN-1273",
      name: "TotalEnergies - Yaba",
      address: "23 Herbert Macaulay Way",
      city: "Yaba",
      state: "Lagos",
      latitude: 6.5095,
      longitude: 3.3711,
      managerId: "mgr-1272",
      complianceStatus: "pending",
      deactivated: false,
      outstandingOrders: 0,
      closesAt: "6:00 PM",
      products: defaultProducts,
      stats: emptyStats,
      createdAt: hoursAgo(24 * 4),
    },
    {
      id: "stn-1272",
      code: "STN-1272",
      name: "TotalEnergies - Wuse 2",
      address: "7 Aminu Kano Crescent, Wuse 2",
      city: "Wuse",
      state: "FCT",
      latitude: 9.0765,
      longitude: 7.4686,
      managerId: "mgr-1277",
      complianceStatus: "verified",
      deactivated: true,
      outstandingOrders: 0,
      closesAt: "7:00 PM",
      products: defaultProducts,
      stats: {
        todaySales: 0,
        todaySalesTrend: 0,
        todayOrders: 0,
        todayOrdersTrend: 0,
        monthSales: 455_000,
        monthSalesTrend: -12,
        monthOrders: 61,
        monthOrdersTrend: -9,
      },
      createdAt: hoursAgo(24 * 120),
    },
    {
      id: "stn-1271",
      code: "STN-1271",
      name: "TotalEnergies - Apapa",
      address: "2 Warehouse Road, Apapa",
      city: "Apapa",
      state: "Lagos",
      latitude: 6.4489,
      longitude: 3.3594,
      managerId: null,
      complianceStatus: "pending",
      deactivated: false,
      outstandingOrders: 0,
      closesAt: "6:00 PM",
      products: defaultProducts,
      stats: emptyStats,
      createdAt: hoursAgo(24 * 2),
    },
  ];

  const managers: Manager[] = [
    {
      id: "mgr-1271",
      code: "MGR-1271",
      name: "Justina Doe",
      email: "justina.doe@totalenergies.com",
      phone: "07012345678",
      stationId: "stn-1274",
      previousStationId: null,
      status: "pending",
      lastLoginAt: null,
      outstandingOrders: 0,
      invitedAt: hoursAgo(30),
    },
    {
      id: "mgr-1272",
      code: "MGR-1272",
      name: "Tunde Ajayi",
      email: "tunde.ajayi@totalenergies.com",
      phone: "08123456789",
      stationId: "stn-1273",
      previousStationId: null,
      status: "pending",
      lastLoginAt: null,
      outstandingOrders: 0,
      invitedAt: hoursAgo(50),
    },
    {
      id: "mgr-1275",
      code: "MGR-1275",
      name: "Chidi Okafor",
      email: "chidi.okafor@totalenergies.com",
      phone: "07012345678",
      stationId: "stn-1276",
      previousStationId: null,
      status: "active",
      lastLoginAt: hoursAgo(2),
      // Has pending orders, so suspending or deleting is blocked.
      outstandingOrders: 3,
      invitedAt: hoursAgo(24 * 90),
    },
    {
      id: "mgr-1276",
      code: "MGR-1276",
      name: "Amina Bello",
      email: "amina.bello@totalenergies.com",
      phone: "08034567890",
      stationId: "stn-1275",
      previousStationId: null,
      status: "active",
      lastLoginAt: hoursAgo(5),
      outstandingOrders: 0,
      invitedAt: hoursAgo(24 * 80),
    },
    {
      id: "mgr-1277",
      code: "MGR-1277",
      name: "David Keller",
      email: "david.keller@totalenergies.com",
      phone: "09012345678",
      stationId: "stn-1272",
      previousStationId: null,
      status: "active",
      lastLoginAt: hoursAgo(26),
      outstandingOrders: 0,
      invitedAt: hoursAgo(24 * 120),
    },
    {
      id: "mgr-1278",
      code: "MGR-1278",
      name: "Ngozi Eze",
      email: "ngozi.eze@totalenergies.com",
      phone: "08098765432",
      // Active but not assigned to any station.
      stationId: null,
      previousStationId: null,
      status: "active",
      lastLoginAt: hoursAgo(72),
      outstandingOrders: 0,
      invitedAt: hoursAgo(24 * 30),
    },
    {
      id: "mgr-1279",
      code: "MGR-1279",
      name: "Sarah Owens",
      email: "sarah.owens@totalenergies.com",
      phone: "08123456780",
      stationId: null,
      // Suspended; Apapa is still unassigned, so reactivating restores it.
      previousStationId: "stn-1271",
      status: "inactive",
      lastLoginAt: hoursAgo(24 * 9),
      outstandingOrders: 0,
      invitedAt: hoursAgo(24 * 60),
    },
    {
      id: "mgr-1280",
      code: "MGR-1280",
      name: "Davidson James",
      email: "davidson.james@totalenergies.com",
      phone: "08123456781",
      stationId: null,
      // Suspended; Lekki Phase 1 has since gone to Amina Bello.
      previousStationId: "stn-1275",
      status: "inactive",
      lastLoginAt: hoursAgo(24 * 14),
      outstandingOrders: 0,
      invitedAt: hoursAgo(24 * 100),
    },
  ];

  const customers = [
    "John Anderson",
    "Sarah Owens",
    "David Keller",
    "Davidson James",
    "Kemi Adeyemi",
    "Bola Tinubu",
  ];
  const statuses: StationOrder["status"][] = [
    "new",
    "ready",
    "delivered",
    "out-for-delivery",
    "cancelled",
    "scheduled",
  ];
  const buildOrders = (seed: number): StationOrder[] =>
    Array.from({ length: 14 }, (_, i) => {
      const diesel = (i + seed) % 3 === 1;
      return {
        id: `ord-${seed}-${i}`,
        code: `ORD-${1273 + i}`,
        frequency: i % 3 === 1 ? "Recurring" : "One-time",
        customer: customers[(i + seed) % customers.length],
        fuelType: diesel ? "Diesel" : "Petrol",
        quantity: `${[50, 100, 20, 80][i % 4]} L`,
        amount: [23_000, 14_700, 11_800, 23_000][i % 4],
        status: statuses[i % statuses.length],
      };
    });

  return {
    company: { name: "Total Energies" },
    kybSubmitted: true,
    completionShown: true,
    stations,
    managers,
    orders: { "stn-1276": buildOrders(0), "stn-1275": buildOrders(2) },
  };
}

function seedNewUser(): Omit<Store, "scenario" | "invites"> {
  return {
    company: { name: "Total Energies" },
    kybSubmitted: false,
    completionShown: false,
    stations: [],
    managers: [],
    orders: {},
  };
}

function createStore(scenario: MockScenario): Store {
  const seed =
    scenario === "existing-user" ? seedExistingUser() : seedNewUser();
  return {
    scenario,
    ...seed,
    invites: [
      {
        token: MOCK_INVITE_TOKEN,
        email: "ada.dennis@totalenergies.com",
        role: "Super Admin",
        organisation: "TotalEnergies",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

// Next can load a server module more than once in development (one copy per
// route bundle), so the store lives on globalThis to keep every page in sync.
const globalForMock = globalThis as typeof globalThis & {
  __fueltapAdminMock?: Store;
};

export function getStore(): Store {
  const existing = globalForMock.__fueltapAdminMock;
  if (!existing || existing.scenario !== MOCK_SCENARIO) {
    globalForMock.__fueltapAdminMock = createStore(MOCK_SCENARIO);
  }
  return globalForMock.__fueltapAdminMock!;
}

export function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildDashboardMetrics(store: Store): DashboardMetrics {
  const activeStations = store.stations.filter(
    (s) =>
      !s.deactivated &&
      s.complianceStatus === "verified" &&
      store.managers.some((m) => m.id === s.managerId && m.status === "active"),
  ).length;

  // A new supplier has no orders yet, so everything stays at zero (the
  // "empty state" dashboard design) even after setup is complete.
  if (store.scenario === "new-user") {
    const zero = { value: 0, trend: 0 };
    return {
      salesThisMonth: zero,
      ordersThisMonth: zero,
      pendingOrders: zero,
      activeStations: { value: activeStations, trend: 0 },
      revenueTotal: zero,
      revenueTrend: [],
      ordersTotal: zero,
      ordersTrend: [],
      topStations: [],
      lowestStations: [],
    };
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const revenue = [0.6, 0.75, 1.5, 1.4, 1.25, 2.05, 2.05, 2.9, 2.9, 3.1, 3.5, 3.8, 4.2];
  const orders = [5, 33, 100, 59, 23, 41, 78, 35, 50, 86, 51, 41, 9];

  return {
    salesThisMonth: { value: 2_004_975, trend: 1 },
    ordersThisMonth: { value: 1_284, trend: 1 },
    pendingOrders: { value: 37, trend: 1 },
    activeStations: { value: activeStations, trend: 1 },
    revenueTotal: { value: 4_800_000, trend: 12 },
    revenueTrend: months.map((label, i) => ({
      label,
      value: Math.round(revenue[i] * 1_000_000),
    })),
    ordersTotal: { value: 386, trend: 6 },
    ordersTrend: months.map((label, i) => ({ label, value: orders[i] })),
    topStations: [
      { name: "Victoria Island", revenue: 980_000 },
      { name: "Lekki Phase 1", revenue: 875_000 },
      { name: "Ikeja GRA", revenue: 742_000 },
      { name: "Yaba", revenue: 610_000 },
      { name: "Wuse 2", revenue: 455_000 },
    ],
    lowestStations: [
      { name: "Apapa", revenue: 96_000 },
      { name: "Yaba", revenue: 121_000 },
      { name: "Surulere", revenue: 158_000 },
      { name: "Ikeja GRA", revenue: 204_000 },
      { name: "Wuse 2", revenue: 231_000 },
    ],
  };
}
