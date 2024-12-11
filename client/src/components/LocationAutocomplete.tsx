import { Input } from "@/components/ui/input";
import { Autocomplete } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (window.google && window.google.maps) {
      setLoading(false);
    }
  }, []);

  const onLoad = (autoComplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autoComplete);
    setLoading(false);
    setLoadError(null);
  };

  const onError = (error: Error) => {
    console.error("Google Maps Autocomplete Error:", error);
    setLoadError("Failed to load location search. Please try again.");
    setLoading(false);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    }
  };

  if (loading) {
    return (
      <FormItem>
        <Label>{label}</Label>
        <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading location search...</span>
        </div>
      </FormItem>
    );
  }

  if (loadError) {
    return (
      <FormItem>
        <Label>{label}</Label>
        <div className="text-sm text-destructive py-2">{loadError}</div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-destructive"
        />
      </FormItem>
    );
  }

  return (
    <FormItem>
      <Label>{label}</Label>
      <FormControl>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          restrictions={{
            country: "us"
          }}
          fields={["formatted_address", "geometry", "name"]}
          options={{
            componentRestrictions: { country: "us" },
            types: ["address"]
          }}
        >
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? "border-destructive" : ""}
          />
        </Autocomplete>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
