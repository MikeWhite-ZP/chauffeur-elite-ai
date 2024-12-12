import { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Declare google maps types
declare global {
  interface Window {
    google: typeof google;
    initAutocomplete: () => void;
  }
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const googleMapsApiKey = 'AIzaSyCIsR__dDC5C8P1ApIWtu_Jlns-9AggWO8';
    
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoading(false);
        initializeAutocomplete();
      };
      
      script.onerror = () => {
        setScriptError('Failed to load Google Maps API');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      setIsLoading(false);
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setScriptError('Failed to initialize location search');
    }
  };

  if (scriptError) {
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
        <FormMessage>{scriptError}</FormMessage>
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
            placeholder={isLoading ? "Loading places search..." : placeholder}
            className={error ? "border-destructive pr-10" : "pr-10"}
            disabled={isLoading}
            required
          />
          {isLoading && (
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