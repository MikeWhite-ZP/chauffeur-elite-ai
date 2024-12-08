export function useLocation() {
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser");
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Convert coordinates to address using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error("Failed to get address");
      }

      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  return { getCurrentLocation };
}
