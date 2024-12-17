import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Calendar,
  Clock,
  PlusCircle,
  Settings,
  LogOut
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

const menuItems = [
  {
    title: "Dashboard",
    icon: <Home className="w-4 h-4 mr-2" />,
    href: "/passenger/dashboard"
  },
  {
    title: "New Booking",
    icon: <PlusCircle className="w-4 h-4 mr-2" />,
    href: "/passenger/new-booking"
  },
  {
    title: "My Bookings",
    icon: <Calendar className="w-4 h-4 mr-2" />,
    href: "/passenger/bookings"
  },
  {
    title: "Trip History",
    icon: <Clock className="w-4 h-4 mr-2" />,
    href: "/passenger/history"
  },
  {
    title: "Settings",
    icon: <Settings className="w-4 h-4 mr-2" />,
    href: "/passenger/settings"
  }
];

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useUser();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/passenger/dashboard">
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

          {/* Logout */}
          <div className="p-4 border-t">
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
        </main>
      </div>
    </div>
  );
}
