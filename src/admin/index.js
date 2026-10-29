/**
 * ParkLink Admin Module (Member 3) - Public API & Component Exports
 */

export { default as AdminModule } from "./AdminModule";
export { default as AdminRoutes } from "./AdminRoutes";
export { default as AdminRoute } from "./components/auth/AdminRoute";

// Pages
export { default as AdminDashboardPage } from "./pages/AdminDashboardPage";
export { default as LocationsManagementPage } from "./pages/LocationsManagementPage";
export { default as SlotsManagementPage } from "./pages/SlotsManagementPage";
export { default as ReservationsManagementPage } from "./pages/ReservationsManagementPage";
export { default as ReportsPage } from "./pages/ReportsPage";
export { default as UnauthorizedPage } from "./pages/UnauthorizedPage";

// Services
export * as adminService from "./services/adminService";
export { seedParkingSystemData } from "./services/seedService";

// Hooks
export { useToast, ToastProvider } from "./hooks/useToast";
export { useAdminLiveStats } from "./hooks/useAdminLiveStats";
export { useLocations } from "./hooks/useLocations";

// Utilities
export * from "./utils/formatters";
export * from "./utils/validators";
export * from "./utils/exportCsv";
