import { useRef, useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

interface LocationAutocompleteProps {
  label: string;
  name: string;
  placeholder?: string;
}

export default function LocationAutocomplete({
  label,
  name,
  placeholder,
}: LocationAutocompleteProps) {
  const { setValue, register } = useFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const handleRef = useCallback((element: HTMLInputElement | null) => {
    if (element) {
      inputRef.current = element;
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setValue(name, place.formatted_address, { shouldValidate: true });
        }
      });

      autocompleteRef.current = autocomplete;
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setScriptError('Failed to initialize location search');
    }
  }, [isLoaded, setValue, name]);

  if (loadError || scriptError) {
    return (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Input
            type="text"
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
            {...register(name)}
            ref={handleRef}
            type="text"
            placeholder={!isLoaded ? "Loading places search..." : placeholder}
            className="pr-10"
            disabled={!isLoaded}
          />
          {!isLoaded && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
