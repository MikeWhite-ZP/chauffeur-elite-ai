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

// Texas cities with their common streets and zip codes
const texasCities = [
  {
    city: "Houston",
    streets: ["Main", "Westheimer", "Richmond", "Kirby", "Post Oak", "Fannin", "San Felipe", "Memorial"],
    zipCodes: [77002, 77027, 77056, 77024, 77030] // Major areas
  },
  {
    city: "Dallas",
    streets: ["Main", "Commerce", "McKinney", "Ross", "Live Oak", "Preston", "Oak Lawn", "Mockingbird"],
    zipCodes: [75201, 75202, 75204, 75205, 75219] // Downtown and Uptown
  },
  {
    city: "Austin",
    streets: ["Congress", "Lamar", "Guadalupe", "Cesar Chavez", "6th", "5th", "MLK", "Riverside"],
    zipCodes: [78701, 78703, 78704, 78705, 78731] // Central Austin
  },
  {
    city: "San Antonio",
    streets: ["Broadway", "Commerce", "Market", "Houston", "Alamo", "River Walk", "St Mary's", "McCullough"],
    zipCodes: [78205, 78215, 78204, 78212, 78216] // Downtown and Alamo Heights
  },
  {
    city: "Fort Worth",
    streets: ["Main", "Houston", "Commerce", "Sundance Square", "University", "Camp Bowie", "7th", "Magnolia"],
    zipCodes: [76102, 76104, 76107, 76109, 76110] // Downtown and Near Southside
  }
];

// Generate common street addresses across Texas
const generateStreetAddresses = () => {
  const addresses: string[] = [];
  
  for (const cityData of texasCities) {
    for (let i = 1000; i <= 9999; i += 2000) {
      for (const street of cityData.streets.slice(0, 4)) {
        for (const type of streetTypes.slice(0, 2)) {
          const zipCode = cityData.zipCodes[Math.floor(Math.random() * cityData.zipCodes.length)];
          addresses.push(`${i} ${street} ${type}, ${cityData.city}, TX ${zipCode}`);
        }
      }
    }
  }
  return addresses;
};

// Major Texas locations for suggestions
const commonAddresses = [
  // Generated Street Addresses
  ...generateStreetAddresses(),

  // Major Airports
  "Dallas/Fort Worth International Airport, 2400 Aviation Dr, DFW Airport, TX 75261",
  "George Bush Intercontinental Airport, 2800 N Terminal Rd, Houston, TX 77032",
  "Austin-Bergstrom International Airport, 3600 Presidential Blvd, Austin, TX 78719",
  "San Antonio International Airport, 9800 Airport Blvd, San Antonio, TX 78216",
  "William P. Hobby Airport, 7800 Airport Blvd, Houston, TX 77061",
  "Dallas Love Field, 8008 Herb Kelleher Way, Dallas, TX 75235",

  // Convention Centers & Event Venues
  "Kay Bailey Hutchison Convention Center, 650 S Griffin St, Dallas, TX 75202",
  "George R. Brown Convention Center, 1001 Avenida De Las Americas, Houston, TX 77010",
  "Austin Convention Center, 500 E Cesar Chavez St, Austin, TX 78701",
  "Henry B. González Convention Center, 900 E Market St, San Antonio, TX 78205",
  "AT&T Stadium, 1 AT&T Way, Arlington, TX 76011",
  "NRG Stadium, 1 NRG Pkwy, Houston, TX 77054",
  "Alamodome, 100 Montana St, San Antonio, TX 78203",

  // Hotels - Luxury
  "The Ritz-Carlton Dallas, 2121 McKinney Ave, Dallas, TX 75201",
  "Four Seasons Hotel Houston, 1300 Lamar St, Houston, TX 77010",
  "Four Seasons Hotel Austin, 98 San Jacinto Blvd, Austin, TX 78701",
  "The St. Anthony Hotel, 300 E Travis St, San Antonio, TX 78205",
  "Omni Fort Worth Hotel, 1300 Houston St, Fort Worth, TX 76102",

  // Business & Shopping Districts
  "Downtown Dallas, Dallas, TX 75201",
  "Uptown Dallas, Dallas, TX 75201",
  "Downtown Houston, Houston, TX 77002",
  "The Domain, 11410 Century Oaks Terrace, Austin, TX 78758",
  "The Pearl District, 303 Pearl Pkwy, San Antonio, TX 78215",
  "Sundance Square, 420 Main St, Fort Worth, TX 76102",
  "The Galleria, 5085 Westheimer Rd, Houston, TX 77056",
  "NorthPark Center, 8687 N Central Expy, Dallas, TX 75225",

  // Tourist Attractions
  "The Alamo, 300 Alamo Plaza, San Antonio, TX 78205",
  "Space Center Houston, 1601 NASA Pkwy, Houston, TX 77058",
  "Texas State Capitol, 1100 Congress Ave, Austin, TX 78701",
  "River Walk, 849 E Commerce St, San Antonio, TX 78205",
  "Fort Worth Stockyards, 2501 Rodeo Plaza, Fort Worth, TX 76164",
  "San Antonio SeaWorld, 10500 Sea World Dr, San Antonio, TX 78251",
  
  // Medical Centers
  "Texas Medical Center, Houston, TX 77030",
  "UT Southwestern Medical Center, 5323 Harry Hines Blvd, Dallas, TX 75390",
  "Dell Seton Medical Center, 1500 Red River St, Austin, TX 78701",
  "Methodist Hospital, 7700 Floyd Curl Dr, San Antonio, TX 78229"
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
    const isPartialStreet = texasCities.some(cityData => 
      cityData.streets.some(street => searchLower.includes(street.toLowerCase()))
    );
    
    let suggestions: string[] = [];
    
    if (isCustomAddress) {
      // If it's a full custom address, add suggestions for major Texas cities
      suggestions.push(
        ...texasCities.slice(0, 3).map(cityData => 
          `${searchValue}, ${cityData.city}, TX ${cityData.zipCodes[0]}`
        )
      );
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
