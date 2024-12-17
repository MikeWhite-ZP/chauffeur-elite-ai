import { Switch, Route, useLocation } from "wouter";
import { useUser } from "./hooks/use-user";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./components/layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  // Redirect based on user role
  if (user && location === "/") {
    if (user.role === "admin") {
      setLocation("/admin/dashboard");
    } else if (user.role === "driver") {
      setLocation("/driver/my-assignments");
    } else {
      setLocation("/passenger/dashboard");
    }
  }

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

  // Admin Routes
  if (user.role === "admin") {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/admin/dashboard" component={DashboardPage} />
          {/* Add other admin routes here */}
          <Route>404 Not Found</Route>
        </Switch>
      </AdminLayout>
    );
  }

  // Default Routes
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      {/* Add other public routes here */}
      <Route>404 Not Found</Route>
    </Switch>
  );
}

export default App;
