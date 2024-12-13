import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Common US addresses format for suggestions
const commonAddresses = [
  // Airports - Major
  "JFK International Airport, Queens, NY 11430",
  "LaGuardia Airport, Queens, NY 11371",
  "Newark Liberty International Airport, Newark, NJ 07114",
  "Teterboro Airport, Teterboro, NJ 07608",
  "Westchester County Airport, White Plains, NY 10604",

  // Hotels - Luxury
  "The Plaza Hotel, 768 5th Ave, New York, NY 10019",
  "Waldorf Astoria, 301 Park Ave, New York, NY 10022",
  "The Ritz-Carlton, 50 Central Park South, New York, NY 10019",
  "Four Seasons Hotel, 57 E 57th St, New York, NY 10022",
  "The Peninsula New York, 700 5th Ave, New York, NY 10019",
  "Mandarin Oriental, 80 Columbus Circle, New York, NY 10023",

  // Business Districts
  "World Trade Center, Manhattan, NY 10007",
  "Empire State Building, 350 5th Ave, New York, NY 10118",
  "Rockefeller Center, 45 Rockefeller Plaza, New York, NY 10111",
  "Hudson Yards, 20 Hudson Yards, New York, NY 10001",
  "Times Square, Manhattan, NY 10036",
  "Wall Street, Manhattan, NY 10005",
  "MetroTech Center, Brooklyn, NY 11201",

  // Convention & Event Spaces
  "Javits Center, 429 11th Ave, New York, NY 10001",
  "Madison Square Garden, 4 Pennsylvania Plaza, New York, NY 10001",
  "Barclays Center, 620 Atlantic Ave, Brooklyn, NY 11217",
  "Radio City Music Hall, 1260 6th Ave, New York, NY 10020",
  "Carnegie Hall, 881 7th Avenue, New York, NY 10019",

  // Shopping & Entertainment
  "Fifth Avenue Shopping District, 5th Ave, New York, NY 10022",
  "SoHo Shopping District, Manhattan, NY 10012",
  "Broadway Theater District, Manhattan, NY 10036",
  "Chelsea Market, 75 9th Ave, New York, NY 10011",

  // Cultural Institutions
  "Metropolitan Museum of Art, 1000 5th Ave, New York, NY 10028",
  "Museum of Modern Art, 11 W 53rd St, New York, NY 10019",
  "Lincoln Center, 10 Lincoln Center Plaza, New York, NY 10023",
  "American Museum of Natural History, Central Park West, NY 10024",

  // Transportation Hubs
  "Grand Central Terminal, 89 E 42nd St, New York, NY 10017",
  "Penn Station, 234 W 31st St, New York, NY 10001",
  "Port Authority Bus Terminal, 625 8th Ave, New York, NY 10018",
  "World Trade Center Transportation Hub, New York, NY 10007",

  // Popular Tourist Areas
  "Central Park, Manhattan, NY 10022",
  "Brooklyn Bridge, Brooklyn Bridge, New York, NY 10038",
  "High Line Park, Manhattan, NY 10011",
  "Battery Park, New York, NY 10004",
  "Statue of Liberty Ferry Terminal, New York, NY 10004"
];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Search for address..."
}: AddressAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const filteredAddresses = React.useMemo(() => {
    if (!searchValue) return commonAddresses;
    
    return commonAddresses.filter((address) =>
      address.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? value.length > 30
              ? value.substring(0, 30) + "..."
              : value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No address found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredAddresses.map((address) => (
              <CommandItem
                key={address}
                value={address}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === address ? "opacity-100" : "opacity-0"
                  )}
                />
                {address}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
