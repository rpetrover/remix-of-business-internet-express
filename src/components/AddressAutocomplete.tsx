import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useGooglePlaces, type PlaceResult } from "@/hooks/useGooglePlaces";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

interface AddressAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
}

const AddressAutocomplete = ({
  id,
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Start typing your address...",
  className,
  containerClassName,
  required,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { getCurrentLocation, isAvailable } = useGooglePlaces(inputRef, onPlaceSelect);

  // Keep the DOM input value in sync with the React state value.
  // This is critical because Google Places Autocomplete manipulates the DOM
  // directly, and we use defaultValue to avoid fighting with it during typing.
  // When the parent state changes (e.g. from handlePlaceSelect filling in
  // fields after a Business Name selection), we need to push that into the DOM.
  useEffect(() => {
    if (inputRef.current && isAvailable) {
      // Only sync if the DOM value differs from the React state value
      // to avoid overwriting while the user is actively typing
      if (inputRef.current !== document.activeElement && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }
  }, [value, isAvailable]);

  // If Google Maps API key is not configured, fall back to a regular input
  if (!isAvailable) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        id={id}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        // Don't use HTML required — we validate in JS (handleSubmit)
        // to avoid silent form blocking when Google Places fills fields
        // programmatically without updating the DOM input.
      />

      {/* Current Location button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={getCurrentLocation}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
      >
        <MapPin className="h-3.5 w-3.5 mr-1" />
        Use Current Location
      </Button>
    </div>
  );
};

export default AddressAutocomplete;
