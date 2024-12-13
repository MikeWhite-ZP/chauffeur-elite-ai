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

// Common street names and patterns
const streetTypes = ["St", "Street", "Ave", "Avenue", "Rd", "Road", "Blvd", "Boulevard", "Ln", "Lane", "Dr", "Drive", "Way", "Ct", "Court", "Pl", "Place"];
const commonStreets = ["Main", "Park", "Oak", "Maple", "Cedar", "Elm", "Pine", "Washington", "Madison", "Jefferson"];
const directions = ["N", "North", "S", "South", "E", "East", "W", "West", "NE", "NW", "SE", "SW"];

// Generate common street addresses
const generateStreetAddresses = () => {
  const addresses: string[] = [];
  // Generate addresses with different patterns
  for (let i = 1; i <= 9999; i += 1000) {
    for (const street of commonStreets) {
      for (const type of streetTypes.slice(0, 4)) { // Use main street types
        addresses.push(`${i} ${street} ${type}, New York, NY ${(10000 + i).toString().slice(1)}`);
      }
    }
  }
  return addresses;
};

// Common US addresses format for suggestions
const commonAddresses = [
  // Generated Street Addresses
  ...generateStreetAddresses(),

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

  // Transportation Hubs
  "Grand Central Terminal, 89 E 42nd St, New York, NY 10017",
  "Penn Station, 234 W 31st St, New York, NY 10001",
  "Port Authority Bus Terminal, 625 8th Ave, New York, NY 10018",
  "World Trade Center Transportation Hub, New York, NY 10007",
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
    if (!searchValue) return commonAddresses.slice(0, 10); // Show first 10 suggestions when empty
    
    const searchLower = searchValue.toLowerCase();
    const searchTerms = searchLower.split(/[\s,]+/); // Split on spaces and commas
    
    // Custom address detection (e.g., "1234 Main St")
    const isCustomAddress = /^\d+\s+\w+/.test(searchValue);
    
    if (isCustomAddress) {
      // Generate a custom address suggestion based on input
      const customAddress = `${searchValue}, New York, NY`;
      return [customAddress, ...commonAddresses.filter((address) =>
        searchTerms.every(term => address.toLowerCase().includes(term))
      )].slice(0, 10);
    }

    return commonAddresses
      .filter((address) => 
        searchTerms.every(term => address.toLowerCase().includes(term))
      )
      .slice(0, 10); // Limit to 10 results for better performance
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
