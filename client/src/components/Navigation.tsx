import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser } from "../hooks/use-user";
import type { User } from "@db/schema";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { useState } from "react";

type NavigationProps = {
  user: User | null | undefined;
};

const formatUrl = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
};

const formatFleetUrl = (name: string) => formatUrl(name);
export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = {
    aboutUs: [
      "Who Is The USA Luxury Limo",
      "Terms and Conditions",
      "Testimonials",
      "Contact Us",
      "F-A-Q",
    ],
    fleet: [
      "Business Sedan",
      "Business SUV",
      "Business VAN",
      "First Class Sedan",
      "First Class SUV",
    ],
    services: [
      "Valentine's Day",
      "RodeoHouston Show",
      "Airport Transportation",
      "Hourly As Directed Rides",
      "Point To Point Rides",
      "NEMT Service",
      "Online Black Car Service",
      "Inter-City Transfers",
      "Professional Limo Services",
      "Private Chauffeur Service",
      "Private Airport Transportation",
      "Best Ground Transportation",
    ],
    blog: [
      "About Cities",
      "Airport",
      "Black Car & Limousine",
      "Business",
      "Hotel",
      "Travel",
    ],
  };

  return (
    <nav className="bg-black/95 text-white py-2 fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo-red_200x200px.png"
              alt="USA Luxury Limo"
              className="h-12 w-auto mr-2"
            />
            <span className="text-xl font-serif">USA Luxury Limo</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white hover:text-gray-300 bg-transparent">
                    About Us
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 p-2 bg-black/95 border border-white/20">
                      {menuItems.aboutUs.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/about/${item === "Terms and Conditions" ? "terms-conditions" : item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block p-2 text-white hover:bg-white/20 transition-colors"
                            >
                              {item}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white hover:text-gray-300 bg-transparent">
                    Our Fleet
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 p-2 bg-black/95 border border-white/20">
                      {menuItems.fleet.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/fleet/${formatFleetUrl(item)}`}
                              className="block p-2 text-white hover:bg-white/20 transition-colors"
                            >
                              {item}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white hover:text-gray-300 bg-transparent">
                    Our Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 p-2 bg-black/95 border border-white/20">
                      {menuItems.services.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/services/${item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block p-2 text-white hover:bg-white/20 transition-colors"
                            >
                              {item}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white hover:text-gray-300 bg-transparent">
                    Blog
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 p-2 bg-black/95 border border-white/20">
                      {menuItems.blog.map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/blog/${item.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block p-2 text-white hover:bg-white/20 transition-colors"
                            >
                              {item}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                

                {user ? (
                  <NavigationMenuItem>
                    <Button
                      variant="ghost"
                      className="text-white hover:text-gray-300"
                      onClick={() => logout()}
                    >
                      Logout
                    </Button>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem>
                    <Link href="/auth">
                      <Button className="bg-white text-black hover:bg-white/90">
                        Login/Signup
                      </Button>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden absolute top-full left-0 w-full bg-black/95 ${
              isMenuOpen ? "block" : "hidden"
            }`}
          >
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">About Us</h3>
                {menuItems.aboutUs.map((item) => (
                  <Link
                    key={item}
                    href={`/about/${item === "Terms and Conditions" ? "terms-conditions" : item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block pl-4 py-1 hover:text-gray-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Our Fleet</h3>
                {menuItems.fleet.map((item) => (
                  <Link
                    key={item}
                    href={`/fleet/${formatFleetUrl(item)}`}
                    className="block pl-4 py-1 hover:text-gray-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Our Services</h3>
                {menuItems.services.map((item) => (
                  <Link
                    key={item}
                    href={`/services/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block pl-4 py-1 hover:text-gray-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Blog</h3>
                {menuItems.blog.map((item) => (
                  <Link
                    key={item}
                    href={`/blog/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block pl-4 py-1 hover:text-gray-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <div className="pt-4 space-y-2">
                

                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full text-white hover:text-gray-300"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-white text-black hover:bg-white/90">
                      Login/Signup
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
