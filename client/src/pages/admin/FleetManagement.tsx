import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  capacity: number;
  categoryId: number;
  isActive: boolean;
}

export default function FleetManagement() {
  const { data: vehicles, isLoading, refetch } = useQuery<Vehicle[]>({
    queryKey: ["fleet"],
    queryFn: async () => {
      const response = await fetch("/api/admin/fleet");
      if (!response.ok) {
        throw new Error("Failed to fetch fleet");
      }
      return response.json();
    },
  });

  const handleVehicleStatus = async (vehicleId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/fleet/${vehicleId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update vehicle status");
      }

      toast({
        title: "Success",
        description: "Vehicle status updated successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fleet Management</CardTitle>
          <Button>Add New Vehicle</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles?.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {vehicle.make} {vehicle.model} {vehicle.year}
                    </h3>
                    <Badge variant={vehicle.isActive ? "default" : "secondary"}>
                      {vehicle.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    License: {vehicle.licensePlate}
                  </p>
                  <p className="text-sm text-gray-500">
                    Capacity: {vehicle.capacity} passengers
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={() => handleVehicleStatus(vehicle.id, vehicle.isActive)}
                    variant={vehicle.isActive ? "destructive" : "default"}
                  >
                    {vehicle.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline">Edit Details</Button>
                </div>
              </div>
            ))}
            {vehicles?.length === 0 && (
              <p className="text-center text-gray-500">No vehicles found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
