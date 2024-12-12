import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
import { useUser } from "../hooks/use-user";

// Lazy load admin components
const LiveTracking = lazy(() => import('../pages/admin/LiveTracking'));
const DriverApprovals = lazy(() => import('../pages/admin/DriverApprovals'));
const BookingManagement = lazy(() => import('../pages/admin/BookingManagement'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const FleetManagement = lazy(() => import('../pages/admin/FleetManagement'));
const ReportsAndAnalytics = lazy(() => import('../pages/admin/ReportsAndAnalytics'));

export function AdminRoutes() {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        }
      >
        <Route path="/admin/live-tracking" component={LiveTracking} />
        <Route path="/admin/driver-approvals" component={DriverApprovals} />
        <Route path="/admin/booking-management" component={BookingManagement} />
        <Route path="/admin/user-management" component={UserManagement} />
        <Route path="/admin/fleet-management" component={FleetManagement} />
        <Route path="/admin/reports-and-analytics" component={ReportsAndAnalytics} />
      </Suspense>
    </ErrorBoundary>
  );
}
