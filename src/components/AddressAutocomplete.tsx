import { useRef } from "react";
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
        required={required}
        autoComplete="off"
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
