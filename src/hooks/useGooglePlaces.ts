import { useEffect, useRef, useCallback, useState } from "react";
import { loadGoogleMapsScript, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

export interface PlaceResult {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  businessName?: string;
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onPlaceSelect: (place: PlaceResult) => void
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !inputRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMapsScript();
        if (cancelled || !inputRef.current) return;

        // Use the classic, reliable Autocomplete API
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address", "name", "types"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.address_components) return;

          const components = place.address_components;
          const get = (type: string) =>
            components.find((c) => c.types.includes(type))?.long_name || "";
          const getShort = (type: string) =>
            components.find((c) => c.types.includes(type))?.short_name || "";

          const streetNumber = get("street_number");
          const route = get("route");
          const address = [streetNumber, route].filter(Boolean).join(" ");

          // Detect if this is a business/establishment (has a name distinct from the address)
          const isEstablishment = place.types?.some(t =>
            ["establishment", "point_of_interest", "store", "restaurant", "food"].includes(t)
          );
          const businessName = isEstablishment && place.name ? place.name : undefined;

          onPlaceSelectRef.current({
            address,
            city: get("locality") || get("sublocality") || get("administrative_area_level_2"),
            state: getShort("administrative_area_level_1"),
            zipCode: get("postal_code"),
            fullAddress: place.formatted_address || "",
            businessName,
          });
        });

        autocompleteRef.current = autocomplete;
        setIsLoaded(true);
      } catch {
        // Google Maps not available — autocomplete won't work, form still usable
        console.warn("Google Places Autocomplete failed to initialize");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inputRef]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!GOOGLE_MAPS_API_KEY) return;

        try {
          await loadGoogleMapsScript();
          const geocoder = new google.maps.Geocoder();
          const { results } = await geocoder.geocode({
            location: { lat: position.coords.latitude, lng: position.coords.longitude },
          });

          if (results?.[0]) {
            const components = results[0].address_components;
            const get = (type: string) =>
              components.find((c) => c.types.includes(type))?.long_name || "";
            const getShort = (type: string) =>
              components.find((c) => c.types.includes(type))?.short_name || "";

            const streetNumber = get("street_number");
            const route = get("route");

            const result: PlaceResult = {
              address: [streetNumber, route].filter(Boolean).join(" "),
              city: get("locality") || get("sublocality"),
              state: getShort("administrative_area_level_1"),
              zipCode: get("postal_code"),
              fullAddress: results[0].formatted_address || "",
            };

            // Update the visible input with the detected address
            if (inputRef.current) {
              inputRef.current.value = result.fullAddress;
            }

            onPlaceSelectRef.current(result);
          }
        } catch {
          console.warn("Geocoding failed for current location");
        }
      },
      () => {
        console.warn("Geolocation denied or unavailable");
      }
    );
  }, [inputRef]);

  return { isLoaded, getCurrentLocation, isAvailable: !!GOOGLE_MAPS_API_KEY };
}
