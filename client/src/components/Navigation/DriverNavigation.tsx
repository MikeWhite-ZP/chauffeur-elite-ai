import { Link } from "wouter";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DriverNavigation() {
  return (
    <TooltipProvider>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/driver/my-assignments">
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    )}
                  >
                    My Assignments
                  </NavigationMenuLink>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View and manage your current ride assignments</p>
              </TooltipContent>
            </Tooltip>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/driver/schedule">
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    )}
                  >
                    Schedule
                  </NavigationMenuLink>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check your upcoming rides and availability</p>
              </TooltipContent>
            </Tooltip>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/driver/leaderboard">
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    )}
                  >
                    Leaderboard
                  </NavigationMenuLink>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>See how you rank among other drivers</p>
              </TooltipContent>
            </Tooltip>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </TooltipProvider>
  );
}
