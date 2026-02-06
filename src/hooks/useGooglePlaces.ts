import { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMapsScript, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

export interface PlaceResult {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onPlaceSelect: (place: PlaceResult) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !inputRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !inputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "us" },
          types: ["address"],
          fields: ["address_components", "formatted_address"],
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

          onPlaceSelectRef.current({
            address,
            city: get("locality") || get("sublocality") || get("administrative_area_level_2"),
            state: getShort("administrative_area_level_1"),
            zipCode: get("postal_code"),
            fullAddress: place.formatted_address || "",
          });
        });

        autocompleteRef.current = autocomplete;
        setIsLoaded(true);
      })
      .catch(() => {
        // Google Maps not available — autocomplete won't work, form still usable
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
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

            onPlaceSelectRef.current({
              address: [streetNumber, route].filter(Boolean).join(" "),
              city: get("locality") || get("sublocality"),
              state: getShort("administrative_area_level_1"),
              zipCode: get("postal_code"),
              fullAddress: results[0].formatted_address || "",
            });
          }
        } catch {
          // Geocoding failed silently
        }
      },
      () => {
        // Geolocation denied or unavailable
      }
    );
  }, []);

  return { isLoaded, getCurrentLocation, isAvailable: !!GOOGLE_MAPS_API_KEY };
}
