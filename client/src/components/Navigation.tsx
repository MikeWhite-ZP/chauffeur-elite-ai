import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser } from "../hooks/use-user";
import type { User } from "@db/schema";

type NavigationProps = {
  user: User | null;
};

export default function Navigation({ user }: NavigationProps) {
  const { logout } = useUser();

  return (
    <nav className="bg-black/95 text-white py-4 fixed w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl">
          LuxDrive
        </Link>

        <div className="space-x-6">
          {user ? (
            <>
              <Link href="/book" className="hover:text-gray-300">
                Book
              </Link>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-white text-black hover:bg-white/90">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
