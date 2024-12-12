import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

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
  const { register } = useFormContext();

  return (
    <FormItem>
      <Label>{label}</Label>
      <FormControl>
        <Input
          {...register(name)}
          type="text"
          placeholder={placeholder}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}