import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TomTomAddress {
  streetNumber?: string;
  streetName?: string;
  municipality: string;
  countrySubdivision: string;
  postalCode?: string;
  country: string;
  freeformAddress: string;
}

interface TomTomResult {
  type: string;
  id: string;
  score: number;
  address: TomTomAddress;
  position: {
    lat: number;
    lon: number;
  };
}

interface TomTomResponse {
  summary: {
    totalResults: number;
    offset: number;
    fuzzyLevel: number;
  };
  results: TomTomResult[];
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, position?: { lat: number; lon: number }) => void;
  placeholder?: string;
  useGeolocation?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Search for address...",
  useGeolocation = false
}: AddressAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [results, setResults] = React.useState<TomTomResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lon: number } | null>(null);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  // Get user's location if geolocation is enabled
  React.useEffect(() => {
    if (useGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [useGeolocation]);

  const searchLocations = React.useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Searching for:', query);
      
      const baseUrl = 'https://api.tomtom.com/search/2/search';
      // Get API key from environment
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
      if (!apiKey) {
        console.error('TomTom API key is missing! Please check your environment variables.');
        setError('Configuration error. Please contact support.');
        return;
      }
      console.log('TomTom API key status:', apiKey ? 'Present' : 'Missing');
      
      const params = new URLSearchParams({
        key: apiKey,
        typeahead: 'true',
        limit: '10',
        countrySet: 'US',
        entityTypeSet: 'Address,Street,POI',
        language: 'en-US',
      });

      // Add location bias if user location is available
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lon.toString());
        console.log('Added location bias:', userLocation);
      }

      // Ensure Texas state filter
      const searchQuery = query.toLowerCase().includes('texas') ? 
        query : `${query}, Texas`;
      
      const url = `${baseUrl}/${encodeURIComponent(searchQuery)}.json?${params.toString()}`;
      console.log('TomTom API request URL:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
      }

      const data: TomTomResponse = await response.json();
      console.log('Received locations:', data);
      
      // Filter results to ensure they're in Texas
      const texasResults = data.results.filter(result => 
        result.address.countrySubdivision.toLowerCase() === 'texas'
      );
      
      console.log('Filtered Texas locations:', texasResults);
      setResults(texasResults);
    } catch (error) {
      console.error('TomTom API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch addresses';
      console.error('Detailed error:', errorMessage);
      setResults([]);
      
      // Show a user-friendly error message in the dropdown
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  React.useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchValue) {
      debounceTimer.current = setTimeout(() => {
        searchLocations(searchValue);
      }, 300); // Reduced debounce time for better responsiveness
    } else {
      setResults([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue, searchLocations]);

  const handleSelect = (result: TomTomResult) => {
    const selectedAddress = result.address.freeformAddress;
    onChange(
      selectedAddress === value ? "" : selectedAddress,
      result.position
    );
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
            ? value.length > 40
              ? value.substring(0, 40) + "..."
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
          ) : error ? (
            <CommandEmpty>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>No address found in Texas.</CommandEmpty>
          ) : (
            <CommandGroup className="max-h-[300px] overflow-auto">
              {results.map((result) => {
                const address = result.address;
                const mainText = [
                  address.streetNumber,
                  address.streetName
                ].filter(Boolean).join(' ');
                
                const secondaryText = [
                  address.municipality,
                  'Texas',
                  address.postalCode
                ].filter(Boolean).join(', ');

                return (
                  <CommandItem
                    key={result.id}
                    value={result.address.freeformAddress}
                    onSelect={() => handleSelect(result)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-start gap-2 w-full">
                      <MapPin className="h-4 w-4 shrink-0 mt-1" />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">
                          {mainText || address.freeformAddress}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {secondaryText}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === result.address.freeformAddress ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
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