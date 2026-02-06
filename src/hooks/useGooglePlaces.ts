import { useEffect, useRef, useCallback, useState } from "react";
import { loadGoogleMapsScript, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

export interface PlaceResult {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
}

export function useGooglePlaces(
  containerRef: React.RefObject<HTMLDivElement>,
  onPlaceSelect: (place: PlaceResult) => void
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;
  const autocompleteElementRef = useRef<any>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMapsScript();
        if (cancelled || !containerRef.current) return;

        // Use the new Places API (BasicPlaceAutocompleteElement)
        const placesLib = await google.maps.importLibrary("places") as any;
        if (cancelled || !containerRef.current) return;

        const autocomplete = new placesLib.BasicPlaceAutocompleteElement({
          componentRestrictions: { country: "us" },
          types: ["address"],
        });

        autocomplete.addEventListener("gmp-select", async (event: any) => {
          try {
            const placePrediction = event.placePrediction;
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });

            const components = place.addressComponents || [];
            const get = (type: string) =>
              components.find((c: any) => c.types?.includes(type))?.longText || "";
            const getShort = (type: string) =>
              components.find((c: any) => c.types?.includes(type))?.shortText || "";

            const streetNumber = get("street_number");
            const route = get("route");
            const address = [streetNumber, route].filter(Boolean).join(" ");

            onPlaceSelectRef.current({
              address,
              city: get("locality") || get("sublocality") || get("administrative_area_level_2"),
              state: getShort("administrative_area_level_1"),
              zipCode: get("postal_code"),
              fullAddress: place.formattedAddress || "",
            });
          } catch {
            // Place details fetch failed silently
          }
        });

        // Clear existing content and append the autocomplete element
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(autocomplete);
        autocompleteElementRef.current = autocomplete;
        setIsLoaded(true);
      } catch {
        // Google Maps not available — autocomplete won't work, form still usable
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [containerRef]);

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
