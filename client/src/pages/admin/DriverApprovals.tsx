import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Driver {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isApproved: boolean;
  isActive: boolean;
}

export default function DriverApprovals() {
  const { data: drivers, isLoading, refetch } = useQuery<Driver[]>({
    queryKey: ["pending-drivers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/drivers/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch pending drivers");
      }
      return response.json();
    },
  });

  const handleApproval = async (driverId: number, approve: boolean) => {
    try {
      const response = await fetch(`/api/admin/drivers/${driverId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approve }),
      });

      if (!response.ok) {
        throw new Error("Failed to update driver status");
      }

      toast({
        title: "Success",
        description: `Driver ${approve ? "approved" : "rejected"} successfully`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update driver status",
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
        <CardHeader>
          <CardTitle>Driver Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drivers?.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{driver.fullName}</h3>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                  <p className="text-sm text-gray-500">{driver.phoneNumber}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={() => handleApproval(driver.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={driver.isApproved}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(driver.id, false)}
                    variant="destructive"
                    disabled={!driver.isActive}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {drivers?.length === 0 && (
              <p className="text-center text-gray-500">
                No pending driver approvals
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
