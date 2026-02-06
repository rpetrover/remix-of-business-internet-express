import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Eye } from "lucide-react";
import { getStaticMapUrl, getStreetViewUrl, getStreetViewMetadataUrl, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

interface AddressImageryProps {
  address: string;
}

const AddressImagery = ({ address }: AddressImageryProps) => {
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const [satelliteError, setSatelliteError] = useState(false);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !address) return;

    // Check if street view is available for this address
    fetch(getStreetViewMetadataUrl(address))
      .then((res) => res.json())
      .then((data) => {
        setStreetViewAvailable(data.status === "OK");
      })
      .catch(() => setStreetViewAvailable(false));
  }, [address]);

  if (!GOOGLE_MAPS_API_KEY || !address) return null;

  const satelliteUrl = getStaticMapUrl(address, 18, "600x300");
  const streetViewUrl = getStreetViewUrl(address, "600x300");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
      {/* Satellite View */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Satellite View
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!satelliteError ? (
            <img
              src={satelliteUrl}
              alt={`Satellite view of ${address}`}
              className="w-full h-48 md:h-56 object-cover"
              onError={() => setSatelliteError(true)}
            />
          ) : (
            <div className="w-full h-48 md:h-56 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Satellite imagery unavailable
            </div>
          )}
        </CardContent>
      </Card>

      {/* Street View */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4 text-primary" />
            Street View
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {streetViewAvailable ? (
            <img
              src={streetViewUrl}
              alt={`Street view of ${address}`}
              className="w-full h-48 md:h-56 object-cover"
              onError={() => setStreetViewAvailable(false)}
            />
          ) : (
            <div className="w-full h-48 md:h-56 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Street View not available for this location
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressImagery;
