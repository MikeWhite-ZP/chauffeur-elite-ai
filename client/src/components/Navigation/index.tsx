import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminNavigation } from "./AdminNavigation";
import { DriverNavigation } from "./DriverNavigation";
import { PassengerNavigation } from "./PassengerNavigation";
import type { User } from "@db/schema";
import { useMemo } from "react";
import { useUser } from "@/hooks/use-user";

interface NavigationProps {
  user: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();

  const roleBasedNavigation = useMemo(() => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return <AdminNavigation />;
      case "driver":
        return <DriverNavigation />;
      case "passenger":
        return <PassengerNavigation />;
      default:
        return null;
    }
  }, [user?.role]);

  const mobileNavLinks = useMemo(() => {
    if (!user) {
      return (
        <>
          <Link href="/fleet/business-sedan">
            <Button variant="ghost" className="w-full justify-start">
              Business Sedan
            </Button>
          </Link>
          <Link href="/fleet/business-suv">
            <Button variant="ghost" className="w-full justify-start">
              Business SUV
            </Button>
          </Link>
          <Link href="/fleet/business-van">
            <Button variant="ghost" className="w-full justify-start">
              Business Van
            </Button>
          </Link>
          <Link href="/fleet/first-class-sedan">
            <Button variant="ghost" className="w-full justify-start">
              First Class Sedan
            </Button>
          </Link>
          <Link href="/fleet/first-class-suv">
            <Button variant="ghost" className="w-full justify-start">
              First Class SUV
            </Button>
          </Link>
        </>
      );
    }

    switch (user.role) {
      case "admin":
        return (
          <>
            <Link href="/admin/booking-management">
              <Button variant="ghost" className="w-full justify-start">
                Booking Management
              </Button>
            </Link>
            <Link href="/admin/user-management">
              <Button variant="ghost" className="w-full justify-start">
                User Management
              </Button>
            </Link>
            <Link href="/admin/fleet-management">
              <Button variant="ghost" className="w-full justify-start">
                Fleet Management
              </Button>
            </Link>
            <Link href="/admin/driver-approvals">
              <Button variant="ghost" className="w-full justify-start">
                Driver Approvals
              </Button>
            </Link>
            <Link href="/admin/reports-and-analytics">
              <Button variant="ghost" className="w-full justify-start">
                Reports & Analytics
              </Button>
            </Link>
          </>
        );
      case "driver":
        return (
          <>
            <Link href="/driver/my-assignments">
              <Button variant="ghost" className="w-full justify-start">
                My Assignments
              </Button>
            </Link>
            <Link href="/driver/schedule">
              <Button variant="ghost" className="w-full justify-start">
                Schedule
              </Button>
            </Link>
          </>
        );
      case "passenger":
        return (
          <>
            <Link href="/book">
              <Button variant="ghost" className="w-full justify-start">
                Book a Ride
              </Button>
            </Link>
            <Link href="/passenger/my-bookings">
              <Button variant="ghost" className="w-full justify-start">
                My Bookings
              </Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  }, [user?.role]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img
              src="/logo-red_200x200px.png"
              alt="USA Luxury Limo"
              className="h-8 w-8"
            />
            <span className="hidden font-bold sm:inline-block">
              USA Luxury Limo
            </span>
          </div>
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex-1 md:flex-initial">
            {roleBasedNavigation}
          </div>

          <div className="flex items-center space-x-2">
            {!user ? (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={() => logout()}>
                  Sign Out
                </Button>
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 px-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col space-y-2">
                  {mobileNavLinks}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
