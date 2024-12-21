import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { useConfig } from "@/hooks/use-config";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  latitude?: number;
  longitude?: number;
  lastUpdate?: string;
  status: "active" | "inactive" | "maintenance";
}

interface FleetMapProps {
  selectedVehicle?: number;
  onVehicleSelect?: (vehicleId: number) => void;
}

export function FleetMap({ selectedVehicle, onVehicleSelect }: FleetMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<tt.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: number]: tt.Marker }>({});
  const [error, setError] = useState<string>();

  const { data: config, isError: isConfigError } = useConfig();
  
  const { data: vehicles, isError: isVehiclesError } = useQuery<Vehicle[]>({
    queryKey: ["fleet-locations"],
    queryFn: async () => {
      const response = await fetch("/api/admin/fleet/locations");
      if (!response.ok) {
        throw new Error("Failed to fetch fleet locations");
      }
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!config?.TOMTOM_API_KEY,
  });

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;
    if (!config?.TOMTOM_API_KEY) {
      setError("TomTom API key is missing. Please check your configuration.");
      return;
    }

    try {
      const map = tt.map({
        key: config.TOMTOM_API_KEY,
        container: mapElement.current,
        center: [-95.7129, 37.0902], // US center
        zoom: 4,
        style: "basic_night",
      });

      mapInstance.current = map;

      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    } catch (e) {
      setError(`Failed to initialize map: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [config?.TOMTOM_API_KEY]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !vehicles) return;

    // Update or create markers for each vehicle
    vehicles.forEach((vehicle) => {
      if (!vehicle.latitude || !vehicle.longitude) return;

      const existingMarker = markers[vehicle.id];
      if (existingMarker) {
        existingMarker.setLngLat([vehicle.longitude, vehicle.latitude]);
      } else {
        const marker = new tt.Marker({
          color: vehicle.status === "active" ? "#22c55e" : "#ef4444",
        })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setPopup(
            new tt.Popup({ offset: 30 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${vehicle.make} ${vehicle.model}</h3>
                <p class="text-sm">License: ${vehicle.licensePlate}</p>
                <p class="text-sm">Status: ${vehicle.status}</p>
                ${
                  vehicle.lastUpdate
                    ? `<p class="text-sm">Last Update: ${new Date(
                        vehicle.lastUpdate
                      ).toLocaleTimeString()}</p>`
                    : ""
                }
              </div>
            `)
          )
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          onVehicleSelect?.(vehicle.id);
        });

        setMarkers((prev) => ({ ...prev, [vehicle.id]: marker }));
      }
    });

    // Remove markers for vehicles no longer in the data
    Object.entries(markers).forEach(([id, marker]) => {
      if (!vehicles.find((v) => v.id === Number(id))) {
        marker.remove();
        setMarkers((prev) => {
          const updated = { ...prev };
          delete updated[Number(id)];
          return updated;
        });
      }
    });
  }, [vehicles, selectedVehicle, markers]);

  if (isConfigError) {
    setError("Failed to load configuration. Please try again later.");
  }

  if (isVehiclesError) {
    setError("Failed to load vehicle locations. Please try again later.");
  }

  if (error) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden bg-destructive/10 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-destructive font-medium mb-2">Failed to load map</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapElement} className="w-full h-[500px] rounded-lg overflow-hidden" />
  );
}
