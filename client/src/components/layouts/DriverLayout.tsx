import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Calendar,
  Trophy,
  Car,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

const menuItems = [
  {
    title: "My Assignments",
    icon: <Car className="w-4 h-4 mr-2" />,
    href: "/driver/my-assignments"
  },
  {
    title: "Schedule",
    icon: <Calendar className="w-4 h-4 mr-2" />,
    href: "/driver/schedule"
  },
  {
    title: "Live Location",
    icon: <MapPin className="w-4 h-4 mr-2" />,
    href: "/driver/location"
  },
  {
    title: "Leaderboard",
    icon: <Trophy className="w-4 h-4 mr-2" />,
    href: "/driver/leaderboard"
  },
  {
    title: "Emergency",
    icon: <AlertCircle className="w-4 h-4 mr-2" />,
    href: "/driver/emergency"
  },
  {
    title: "Settings",
    icon: <Settings className="w-4 h-4 mr-2" />,
    href: "/driver/settings"
  }
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useUser();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/driver/dashboard">
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
