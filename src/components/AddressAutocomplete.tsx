import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useGooglePlaces, type PlaceResult } from "@/hooks/useGooglePlaces";

interface AddressAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const AddressAutocomplete = ({
  id,
  value,
  onChange,
  onPlaceSelect,
  placeholder = "123 Business Street",
  className,
  required,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { getCurrentLocation, isAvailable } = useGooglePlaces(inputRef, onPlaceSelect);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      {isAvailable && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={getCurrentLocation}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-muted-foreground hover:text-primary"
          title="Use current location"
        >
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Current Location</span>
        </Button>
      )}
    </div>
  );
};

export default AddressAutocomplete;
