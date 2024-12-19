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

type TomTomErrorType =
  | "API_KEY_INVALID"
  | "RATE_LIMIT_EXCEEDED"
  | "NETWORK_ERROR"
  | "INVALID_REQUEST"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

interface TomTomError {
  type: TomTomErrorType;
  message: string;
  retryable: boolean;
}

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

const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 5000,
  MIN_SCORE: 0.5,
};

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
  useGeolocation = false,
}: AddressAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [results, setResults] = React.useState<TomTomResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lon: number } | null>(null);

  React.useEffect(() => {
    if (useGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }),
        (geoError) => console.error("Geolocation error:", geoError)
      );
    }
  }, [useGeolocation]);

  const classifyError = (error: any): TomTomError => {
    if (error.message?.includes("API key")) {
      return { type: "API_KEY_INVALID", message: "Invalid API key", retryable: false };
    }
    if (error.message?.includes("429")) {
      return { type: "RATE_LIMIT_EXCEEDED", message: "Too many requests, please try again later", retryable: true };
    }
    if (error instanceof TypeError || error.message?.includes("network")) {
      return { type: "NETWORK_ERROR", message: "Network connection error", retryable: true };
    }
    if (error.message?.includes("timeout")) {
      return { type: "TIMEOUT", message: "Request timed out", retryable: true };
    }
    if (error.message?.includes("500")) {
      return { type: "SERVER_ERROR", message: "Server error, please try again", retryable: true };
    }
    return { type: "UNKNOWN", message: "An unexpected error occurred", retryable: true };
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const searchLocations = React.useCallback(
    async (query: string) => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      let retryCount = 0;
      let lastError: TomTomError | null = null;

      while (retryCount < API_CONFIG.MAX_RETRIES) {
        try {
          const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
          const isDevelopment = import.meta.env.DEV;
          
          console.log("Searching for:", query);
          console.log("Debug - TomTom API Configuration:", {
            hasApiKey: !!apiKey,
            keyFormat: apiKey ? "Valid format" : "Invalid format",
            isDevelopment
          });
          
          // Check if API key exists and has proper format
          const isInvalidKey = !apiKey || 
                             apiKey === "\"${TOMTOM_API_KEY}\"" || 
                             apiKey === "undefined" || 
                             apiKey === "${TOMTOM_API_KEY}" ||
                             apiKey === '${TOMTOM_API_KEY}';
                             
          if (isInvalidKey) {
            const errorDetails = {
              key: "Missing or Invalid",
              env: isDevelopment ? "development" : "production",
              keyValue: apiKey
            };
            console.error("TomTom API Key Configuration Error:", errorDetails);
            setError("Location search is currently unavailable. Please contact support.");
            setIsLoading(false);
            return;
          }

          // Log successful API key configuration
          console.log("TomTom API successfully configured");

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

          // Using the Places API fuzzy search endpoint
          const baseUrl = "https://api.tomtom.com/search/2/search";
          const params = new URLSearchParams({
            key: apiKey,
            limit: "8",
            countrySet: "US",
            language: "en-US",
            fuzzySearch: "true",
            idxSet: "Str,PAD,Addr",
            entityTypeSet: "Address,Street",
            timeZone: "America/Chicago",
            minFuzzyLevel: "1",
            maxFuzzyLevel: "2"
          });

          if (userLocation) {
            params.append("lat", userLocation.lat.toString());
            params.append("lon", userLocation.lon.toString());
            params.append("radius", "50000");
          }

          const url = `${baseUrl}/${encodeURIComponent(query)}.json?${params.toString()}`;
          const response = await fetch(url, { signal: controller.signal });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errorText || `API Error: ${response.status}`);
          }

          const data = await response.json();
          if (!data.results || !Array.isArray(data.results)) {
            throw new Error("Invalid response format");
          }

          const filteredResults = data.results
            .filter((result) => {
              if (!result.address || !result.position) return false;
              if (!result.address.countrySubdivision) return false;
              if (result.score < API_CONFIG.MIN_SCORE) return false;
              return true;
            })
            .map((result) => ({
              ...result,
              address: {
                ...result.address,
                freeformAddress: result.address.freeformAddress
                  .replace(/, United States$/, "")
                  .replace(/^USA,\s*/, "")
                  .trim(),
              },
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

          setResults(filteredResults);
          return;
        } catch (error: any) {
          console.error(`Address search error (attempt ${retryCount + 1}):`, error);
          lastError = classifyError(error);

          if (!lastError.retryable) break;

          retryCount++;
          if (retryCount < API_CONFIG.MAX_RETRIES) {
            await delay(API_CONFIG.RETRY_DELAY * retryCount);
          }
        }
      }

      if (lastError) {
        setError(lastError.message);
        setResults([]);
      }

      setIsLoading(false);
    },
    [userLocation]
  );

  React.useEffect(() => {
    if (searchValue.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    const handler = setTimeout(() => searchLocations(searchValue), 300);
    return () => clearTimeout(handler);
  }, [searchValue, searchLocations]);

  React.useEffect(() => {
    if (!open) {
      setResults([]);
      setError(null);
    }
  }, [open]);

  const handleSelect = (result: TomTomResult) => {
    onChange(result.address.freeformAddress, result.position);
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
          {value.length > 40 ? `${value.substring(0, 40)}...` : value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={placeholder} value={searchValue} onValueChange={setSearchValue} />
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : error ? (
            <CommandEmpty>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CommandEmpty>
          ) : searchValue.length < 3 ? (
            <CommandEmpty className="p-4 text-sm text-muted-foreground">Enter at least 3 characters to search</CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>No addresses found</CommandEmpty>
          ) : (
            <CommandGroup className="max-h-[300px] overflow-auto">
              {results.map((result) => {
                const address = result.address;
                const mainText = [address.streetNumber, address.streetName].filter(Boolean).join(" ");
                const secondaryText = [address.municipality, address.countrySubdivision, address.postalCode].filter(Boolean).join(", ");

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
                        <div className="font-medium truncate">{mainText || address.freeformAddress}</div>
                        {secondaryText && (
                          <div className="text-sm text-muted-foreground truncate">{secondaryText}</div>
                        )}
                      </div>
                      <Check className={cn("h-4 w-4 shrink-0", value === result.address.freeformAddress ? "opacity-100" : "opacity-0")} />
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
