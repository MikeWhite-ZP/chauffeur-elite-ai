import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Location {
  display_name: string;
  place_id: number;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  lat?: string;
  lon?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Search for address..."
}: AddressAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  const searchLocations = React.useCallback(async (query: string) => {
    if (!query) {
      setLocations([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Searching for:', query);
      
      // Append Texas only if not already mentioned
      const searchQuery = query.toLowerCase().includes('texas') ? 
        query : `${query}, Texas, USA`;
      
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        countrycodes: 'us',
        state: 'texas',
        limit: '10',
        addressdetails: '1',
      }).toString();
      
      console.log('Fetching from URL:', url.toString());
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'ChauffeurElite/1.0',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
      }

      const data: Location[] = await response.json();
      console.log('Received locations:', data);
      
      // Filter results to ensure they're in Texas and have address details
      const texasLocations = data.filter(loc => {
        if (!loc.address) return false;
        return loc.address.state?.toLowerCase().includes('texas');
      });
      
      console.log('Filtered Texas locations:', texasLocations);
      setLocations(texasLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchValue) {
      debounceTimer.current = setTimeout(() => {
        searchLocations(searchValue);
      }, 500); // Debounce for 500ms
    } else {
      setLocations([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue, searchLocations]);

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
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : locations.length === 0 ? (
            <CommandEmpty>No address found.</CommandEmpty>
          ) : (
            <CommandGroup className="max-h-[300px] overflow-auto">
              {locations.map((location) => {
                // Format the address in a more readable way
                const address = location.address;
                let displayAddress = '';
                
                if (address) {
                  const parts = [];
                  if (address.house_number && address.road) {
                    parts.push(`${address.house_number} ${address.road}`);
                  } else if (address.road) {
                    parts.push(address.road);
                  }
                  if (address.city) parts.push(address.city);
                  if (address.state) parts.push(address.state);
                  if (address.postcode) parts.push(address.postcode);
                  displayAddress = parts.join(', ');
                } else {
                  displayAddress = location.display_name;
                }

                return (
                  <CommandItem
                    key={location.place_id}
                    value={displayAddress}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === displayAddress ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {displayAddress}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}