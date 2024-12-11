import { Input } from "@/components/ui/input";
import { Autocomplete } from "@react-google-maps/api";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";

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

  const onLoad = (autoComplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autoComplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    }
  };

  return (
    <FormItem>
      <Label>{label}</Label>
      <FormControl>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "us" },
            fields: ["formatted_address", "geometry", "name"],
            types: ["address"]
          }}
        >
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? "border-red-500" : ""}
          />
        </Autocomplete>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
