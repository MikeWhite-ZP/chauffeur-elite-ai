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

// Houston-specific street names
const houstonStreets = [
  "Main", "Westheimer", "Richmond", "Kirby", "Post Oak", "Fannin", "San Felipe",
  "Memorial", "Heights", "Washington", "Shepherd", "Durham", "Montrose", "Bellaire"
];

// Generate common street addresses in Houston
const generateStreetAddresses = () => {
  const addresses: string[] = [];
  // Houston zip codes for major areas
  const zipCodes = [
    77002, 77003, 77004, 77005, // Inner Loop
    77006, 77007, 77008, 77019, // Heights/Montrose
    77024, 77027, 77056, 77057, // Galleria/Memorial
    77030, 77025, 77021, // Medical Center
    77046, 77098, 77401  // West U/Bellaire
  ];
  
  for (let i = 1000; i <= 9999; i += 2000) {
    for (const street of houstonStreets) {
      for (const type of streetTypes.slice(0, 4)) {
        const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
        addresses.push(`${i} ${street} ${type}, Houston, TX ${zipCode}`);
      }
    }
  }
  return addresses;
};

// Common Houston addresses for suggestions
const commonAddresses = [
  // Generated Street Addresses
  ...generateStreetAddresses(),

  // Airports
  "George Bush Intercontinental Airport, 2800 N Terminal Rd, Houston, TX 77032",
  "William P. Hobby Airport, 7800 Airport Blvd, Houston, TX 77061",
  "Sugar Land Regional Airport, 12888 TX-6, Sugar Land, TX 77498",
  "Ellington Airport, 510 Ellington Field, Houston, TX 77034",

  // Hotels - Luxury
  "Four Seasons Hotel Houston, 1300 Lamar St, Houston, TX 77010",
  "The Post Oak Hotel, 1600 West Loop South, Houston, TX 77027",
  "The St. Regis Houston, 1919 Briar Oaks Ln, Houston, TX 77027",
  "Hotel ZaZa Houston Museum District, 5701 Main St, Houston, TX 77005",
  "Marriott Marquis Houston, 1777 Walker St, Houston, TX 77010",
  "The Houstonian Hotel, 111 N Post Oak Ln, Houston, TX 77024",

  // Business Districts
  "Downtown Houston, Houston, TX 77002",
  "Houston Galleria, 5085 Westheimer Rd, Houston, TX 77056",
  "Greenway Plaza, Houston, TX 77046",
  "Energy Corridor, Houston, TX 77079",
  "Texas Medical Center, Houston, TX 77030",
  "Uptown Houston, Houston, TX 77056",

  // Convention & Event Spaces
  "George R. Brown Convention Center, 1001 Avenida De Las Americas, Houston, TX 77010",
  "NRG Park, 1 NRG Pkwy, Houston, TX 77054",
  "Toyota Center, 1510 Polk St, Houston, TX 77002",
  "Minute Maid Park, 501 Crawford St, Houston, TX 77002",
  "Smart Financial Centre, 18111 Lexington Blvd, Sugar Land, TX 77479",

  // Transportation & Shopping
  "Houston Metro Transit Center, 1900 Main St, Houston, TX 77002",
  "Memorial City Mall, 303 Memorial City Way, Houston, TX 77024",
  "The Galleria, 5085 Westheimer Rd, Houston, TX 77056",
  "CityCentre, 800 Town and Country Blvd, Houston, TX 77024",
  "River Oaks District, 4444 Westheimer Rd, Houston, TX 77027"
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
    if (!searchValue) return commonAddresses.slice(0, 10);
    
    const searchLower = searchValue.toLowerCase();
    const searchTerms = searchLower.split(/[\s,]+/);
    
    // Custom address patterns
    const isStreetNumber = /^\d+$/.test(searchValue); // Just numbers
    const isCustomAddress = /^\d+\s+\w+/.test(searchValue); // Number + Street
    const isPartialStreet = houstonStreets.some(street => 
      searchLower.includes(street.toLowerCase())
    );
    
    let suggestions: string[] = [];
    
    if (isCustomAddress) {
      // If it's a full custom address, add it as first suggestion
      const nearestZip = "77002"; // Downtown Houston zip
      suggestions.push(`${searchValue}, Houston, TX ${nearestZip}`);
    }
    
    // Add matching predefined addresses
    suggestions = [
      ...suggestions,
      ...commonAddresses.filter((address) => 
        searchTerms.every(term => address.toLowerCase().includes(term))
      )
    ];
    
    // For partial matches, add common completions
    if (isStreetNumber) {
      const num = searchValue;
      suggestions.push(
        ...houstonStreets.slice(0, 3).map(street => 
          `${num} ${street} St, Houston, TX 77002`
        )
      );
    }
    
    // If no matches found but contains a Houston street name
    if (suggestions.length === 0 && isPartialStreet) {
      suggestions.push(`${searchValue}, Houston, TX`);
    }
    
    return suggestions
      .filter((address, index, self) => 
        self.indexOf(address) === index // Remove duplicates
      )
      .slice(0, 10);
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
