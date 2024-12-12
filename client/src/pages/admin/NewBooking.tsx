import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingForm from "@/components/BookingForm";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NewBooking() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation("/admin/booking-management");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin/booking-management")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Create New Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Create a new booking for a customer. Fill in all the required information below.
          </p>
          <BookingForm isAdminForm={true} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
