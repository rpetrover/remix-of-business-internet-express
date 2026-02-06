// Google Maps API configuration
// Uses environment variable for the API key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key is not configured"));
  }

  if ((window as any).google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function getStaticMapUrl(address: string, zoom = 18, size = "600x300"): string {
  if (!GOOGLE_MAPS_API_KEY) return "";
  return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=${zoom}&size=${size}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
}

export function getStreetViewUrl(address: string, size = "600x300"): string {
  if (!GOOGLE_MAPS_API_KEY) return "";
  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
}

export function getStreetViewMetadataUrl(address: string): string {
  if (!GOOGLE_MAPS_API_KEY) return "";
  return `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
}
