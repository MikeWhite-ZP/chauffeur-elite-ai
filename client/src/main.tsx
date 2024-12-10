import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router as WouterRouter } from "wouter";
import "./index.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false
    },
  },
});
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import WhoIsUSALuxuryLimo from "./pages/WhoIsUSALuxuryLimo";
import TermsAndConditions from "./pages/TermsAndConditions";
import Testimonials from "./pages/Testimonials";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import BusinessSedan from "./pages/fleet/BusinessSedan";
import BusinessSUV from "./pages/fleet/BusinessSUV";
import BusinessVan from "./pages/fleet/BusinessVan";
import FirstClassSedan from "./pages/fleet/FirstClassSedan";
import { default as FirstClassSUV } from "./pages/fleet/first-class-suv";
import Navigation from "./components/Navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "./hooks/use-user";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Service worker registration is temporarily disabled to address stability issues
// Will be re-implemented in a future update with proper offline support

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <>
      <Navigation user={user} />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about/who-is-the-usa-luxury-limo" component={WhoIsUSALuxuryLimo} />
        <Route path="/about/terms-conditions" component={TermsAndConditions} />
        <Route path="/about/testimonials" component={Testimonials} />
        <Route path="/about/contact-us" component={ContactUs} />
        <Route path="/about/f-a-q" component={FAQ} />
        <Route path="/fleet/business-sedan" component={BusinessSedan} />
        <Route path="/fleet/business-suv" component={BusinessSUV} />
        <Route path="/fleet/business-van" component={BusinessVan} />
        <Route path="/fleet/first-class-sedan" component={FirstClassSedan} />
        <Route path="/fleet/first-class-suv" component={FirstClassSUV} />
        {!user && <Route path="/auth" component={AuthPage} />}
        {user && (
          <>
            <Route path="/book" component={BookingPage} />
            <Route path="/dashboard" component={DashboardPage} />
            {user.role === 'admin' && (
              <>
                <Route path="/admin/driver-approvals" component={lazy(() => import('./pages/admin/DriverApprovals'))} />
                <Route path="/admin/booking-management" component={lazy(() => import('./pages/admin/BookingManagement'))} />
                <Route path="/admin/user-management" component={lazy(() => import('./pages/admin/UserManagement'))} />
                <Route path="/admin/fleet-management" component={lazy(() => import('./pages/admin/FleetManagement'))} />
                <Route path="/admin/reports-and-analytics" component={lazy(() => import('./pages/admin/ReportsAndAnalytics'))} />
              </>
            )}
            {user.role === 'driver' && (
              <>
                <Route path="/driver/my-assignments" component={lazy(() => import('./pages/driver/MyAssignments'))} />
                <Route path="/driver/schedule" component={lazy(() => import('./pages/driver/Schedule'))} />
              </>
            )}
            {user.role === 'passenger' && (
              <>
                <Route path="/passenger/my-bookings" component={lazy(() => import('./pages/passenger/MyBookings'))} />
              </>
            )}
          </>
        )}
        <Route>404 Page Not Found</Route>
      </Switch>
    </>
  );
}

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create root only if it doesn't exist
const root = createRoot(rootElement);

// Render the app
root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <Router />
          <Toaster />
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
