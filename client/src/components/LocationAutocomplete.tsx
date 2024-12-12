import { useRef, useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { useLoadScript } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  error
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const debug = import.meta.env.VITE_DEBUG === 'true';

  if (debug) {
    console.log('Google Maps API Key available:', !!apiKey);
    console.log('Current value:', value);
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  if (debug) {
    console.log('Google Maps Script Status:', { 
      isLoaded, 
      hasLoadError: !!loadError, 
      isInitialized,
      hasInitError: !!initError
    });
  }

  const handlePlaceChange = useCallback(() => {
    if (!autocompleteRef.current) return;

    try {
      const place = autocompleteRef.current.getPlace();
      if (debug) {
        console.log('Place selected:', place);
      }

      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    } catch (error) {
      console.error('Error handling place change:', error);
      setInitError('Failed to process selected address');
    }
  }, [onChange, debug]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || isInitialized) return;

    try {
      if (!window.google?.maps?.places) {
        throw new Error('Google Maps Places API not available');
      }

      if (debug) {
        console.log('Initializing Google Places Autocomplete');
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "geometry", "name"],
        types: ["address", "establishment"]
      });

      const listener = autocompleteRef.current.addListener("place_changed", handlePlaceChange);
      setIsInitialized(true);
      setInitError(null);

      if (debug) {
        console.log('Google Places Autocomplete initialized successfully');
      }

      return () => {
        if (google && listener) {
          google.maps.event.removeListener(listener);
        }
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize location search');
      setIsInitialized(false);
    }
  }, [isLoaded, handlePlaceChange, isInitialized, debug]);

  const errorMessage = loadError?.message || initError;

  if (errorMessage) {
    return (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Unable to load location search"
            className="border-destructive"
          />
        </FormControl>
        <FormMessage>Location search is currently unavailable: {errorMessage}</FormMessage>
      </FormItem>
    );
  }

  return (
    <FormItem>
      <Label>{label}</Label>
      <FormControl>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isLoaded ? placeholder : "Loading places search..."}
            className={error ? "border-destructive pr-10" : "pr-10"}
            disabled={!isLoaded}
            required
          />
          {!isLoaded && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}