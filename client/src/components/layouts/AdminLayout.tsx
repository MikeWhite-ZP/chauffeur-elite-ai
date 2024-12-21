import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Users,
  Car,
  Calendar,
  MapPin,
  Settings,
  LogOut
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";

const menuItems = [
  {
    title: "Dashboard",
    icon: <BarChart3 className="w-4 h-4 mr-2" />,
    href: "/admin/dashboard"
  },
  {
    title: "Live Tracking",
    icon: <MapPin className="w-4 h-4 mr-2" />,
    href: "/admin/live-tracking"
  },
  {
    title: "Driver Approvals",
    icon: <Users className="w-4 h-4 mr-2" />,
    href: "/admin/driver-approvals"
  },
  {
    title: "Booking Management",
    icon: <Calendar className="w-4 h-4 mr-2" />,
    href: "/admin/booking-management"
  },
  {
    title: "Fleet Management",
    icon: <Car className="w-4 h-4 mr-2" />,
    href: "/admin/fleet-management"
  },
  {
    title: "Settings",
    icon: <Settings className="w-4 h-4 mr-2" />,
    href: "/admin/settings"
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useUser();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/admin/dashboard">
              <img
                src="/logo-red_200x200px.png"
                alt="USA Luxury Limo"
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-normal hover:bg-gray-100"
                  >
                    {item.icon}
                    {item.title}
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Settings & Logout */}
          <div className="p-4 border-t space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-muted-foreground">Customize</span>
              <ThemeCustomizer />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left font-normal hover:bg-gray-100"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
          <ThemeCustomizer/>
        </main>
      </div>
    </div>
  );
}