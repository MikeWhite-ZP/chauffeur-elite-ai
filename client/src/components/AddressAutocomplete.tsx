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
  onChange: (value: string, position: { lat: number; lon: number } | null) => void;
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
      
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
      
      if (!apiKey) {
        throw new Error('TomTom API key is missing. Please check your environment configuration.');
      }

      // Using the TomTom Fuzzy Search API endpoint
      const baseUrl = 'https://api.tomtom.com/search/2/search';
      
      const params = new URLSearchParams({
        key: apiKey,
        limit: '8',
        countrySet: 'US',
        language: 'en-US',
        extendedPostalCodesFor: 'Str',
        minFuzzyLevel: '1',
        maxFuzzyLevel: '2',
        idxSet: 'Str,Addr',
        entityTypeSet: 'Address,Street,POI,Municipality',
        timeZone: 'America/Chicago'
      });

      // Add location bias if user location is available
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lon.toString());
        params.append('radius', '50000'); // 50km radius for local results
      }
      
      const url = `${baseUrl}/${encodeURIComponent(query)}.json?${params.toString()}`;
      console.log('TomTom API request URL:', url);
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.errorText || `API Error: ${response.status}`);
        }

        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid response format from TomTom API');
        }

        // Process and filter results
        const filteredResults = data.results
          .filter(result => {
            // Ensure result has required properties
            if (!result.address || !result.position) return false;
            
            // Filter US addresses only
            if (result.address.country !== 'United States') return false;
            
            // Ensure it has a proper score and address
            return result.score >= 8 && result.address.freeformAddress;
          })
          .map(result => ({
            ...result,
            address: {
              ...result.address,
              // Clean up the address format
              freeformAddress: result.address.freeformAddress
                .replace(/, United States$/, '')
                .replace(/^USA,\s*/, '')
            }
          }))
          .slice(0, 8);

        console.log('Processed locations:', filteredResults);
        setResults(filteredResults);
        setError(null);
      } catch (error) {
        console.error('TomTom API Error:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to fetch address suggestions';
        setResults([]);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, [userLocation]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.trim().length >= 2) {
        searchLocations(searchValue);
      } else {
        setResults([]);
        setError(null);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, searchLocations]);

  // Clear results when closing the popover
  React.useEffect(() => {
    if (!open) {
      setResults([]);
      setError(null);
    }
  }, [open]);

  const handleSelect = (result: TomTomResult) => {
    const selectedAddress = result.address.freeformAddress;
    onChange(
      selectedAddress === value ? "" : selectedAddress,
      result.position ? { lat: result.position.lat, lon: result.position.lon } : null
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
              <span className="ml-2 text-sm text-muted-foreground">
                Searching addresses...
              </span>
            </div>
          ) : error ? (
            <CommandEmpty>
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            </CommandEmpty>
          ) : searchValue.length < 2 ? (
            <CommandEmpty className="p-4 text-sm text-muted-foreground">
              Enter at least 2 characters to search
            </CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty className="p-4">No matching addresses found</CommandEmpty>
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