import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'driver' | 'passenger';
  isActive: boolean;
  isApproved: boolean;
}

export default function UserManagement() {
  const { data: users, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      toast({
        title: "Success",
        description: "User status updated successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
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
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.fullName}</h3>
                    <Badge>{user.role}</Badge>
                    {user.role === 'driver' && (
                      <Badge variant={user.isApproved ? "default" : "secondary"}>
                        {user.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={() => handleStatusToggle(user.id, user.isActive)}
                    variant={user.isActive ? "destructive" : "default"}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            ))}
            {users?.length === 0 && (
              <p className="text-center text-gray-500">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
