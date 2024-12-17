import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import AuthPage from "./pages/AuthPage";
import DriverLayout from "./components/layouts/DriverLayout";
import PassengerLayout from "./components/layouts/PassengerLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const DriverApprovals = lazy(() => import("./pages/admin/DriverApprovals"));
const LiveTracking = lazy(() => import("./pages/admin/LiveTracking"));
const BookingManagement = lazy(() => import("./pages/admin/BookingManagement"));
const FleetManagement = lazy(() => import("./pages/admin/FleetManagement"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

// Driver pages
const DriverDashboard = lazy(() => import("./pages/driver/DashboardPage"));
const MyAssignments = lazy(() => import("./pages/driver/MyAssignments"));
const Schedule = lazy(() => import("./pages/driver/Schedule"));
const Leaderboard = lazy(() => import("./pages/driver/Leaderboard"));

// Passenger pages
const PassengerDashboard = lazy(() => import("./pages/passenger/DashboardPage"));
const BookingHistory = lazy(() => import("./pages/passenger/BookingHistory"));
const NewBooking = lazy(() => import("./pages/passenger/NewBooking"));

// Homepage for non-authenticated users
const HomePage = lazy(() => import("./pages/HomePage"));

function App() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  // Redirect based on user role
  useEffect(() => {
    if (user && location === "/") {
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else if (user.role === "driver") {
        setLocation("/driver/dashboard");
      } else {
        setLocation("/passenger/dashboard");
      }
    }
  }, [user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Role-based routing
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  switch (user.role) {
    case "admin":
      return (
        <AdminLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/driver-approvals" component={DriverApprovals} />
              <Route path="/admin/live-tracking" component={LiveTracking} />
              <Route path="/admin/booking-management" component={BookingManagement} />
              <Route path="/admin/fleet-management" component={FleetManagement} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route>404 Not Found</Route>
            </Switch>
          </Suspense>
        </AdminLayout>
      );

    case "driver":
      return (
        <DriverLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/driver/dashboard" component={DriverDashboard} />
              <Route path="/driver/my-assignments" component={MyAssignments} />
              <Route path="/driver/schedule" component={Schedule} />
              <Route path="/driver/leaderboard" component={Leaderboard} />
              <Route>404 Not Found</Route>
            </Switch>
          </Suspense>
        </DriverLayout>
      );

    case "passenger":
      return (
        <PassengerLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/passenger/dashboard" component={PassengerDashboard} />
              <Route path="/passenger/bookings" component={BookingHistory} />
              <Route path="/passenger/new-booking" component={NewBooking} />
              <Route>404 Not Found</Route>
            </Switch>
          </Suspense>
        </PassengerLayout>
      );

    default:
      return (
        <Switch>
          <Route path="/" component={HomePage} />
          <Route>404 Not Found</Route>
        </Switch>
      );
  }
}

export default App;