import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LocationTracker from "@/components/LocationTracker";

interface Assignment {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  status: string;
  passengerName: string;
  passengerPhone: string;
}

export default function MyAssignments() {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["driver-assignments"],
    queryFn: async () => {
      const response = await fetch("/api/driver/assignments");
      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments?.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Trip #{assignment.id}</h3>
                    <Badge>{assignment.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    From: {assignment.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    To: {assignment.dropoffLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(assignment.pickupDate).toLocaleString()}
                  </p>
                  <div className="pt-2">
                    <p className="text-sm">
                      Passenger: {assignment.passengerName}
                    </p>
                    <p className="text-sm">
                      Contact: {assignment.passengerPhone}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${assignment.dropoffLocation}&origin=${assignment.pickupLocation}`,
                            '_blank'
                          );
                        });
                      }
                    }}
                  >
                    Start Navigation
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      window.location.href = `tel:${assignment.passengerPhone}`;
                    }}
                  >
                    Call Passenger
                  </Button>
                  {assignment.status === 'in_progress' && (
                    <LocationTracker 
                      bookingId={assignment.id}
                      isActive={assignment.status === 'in_progress'}
                    />
                  )}
                </div>
              </div>
            ))}
            {assignments?.length === 0 && (
              <p className="text-center text-gray-500">
                No assignments found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
