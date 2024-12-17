import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, Car } from "lucide-react";

export default function NewBooking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Booking</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Details */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="pickup-location">Pickup Location</Label>
                  <Input id="pickup-location" placeholder="Enter pickup address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input id="pickup-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-time">Pickup Time</Label>
                  <Input id="pickup-time" type="time" />
                </div>
              </div>

              {/* Dropoff Details */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dropoff Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="dropoff-location">Dropoff Location</Label>
                  <Input id="dropoff-location" placeholder="Enter dropoff address" />
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle Selection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Vehicle options will be dynamically loaded */}
                <Card className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <img src="/sedan.png" alt="Luxury Sedan" className="w-full h-32 object-cover rounded mb-4" />
                    <h4 className="font-medium">Luxury Sedan</h4>
                    <p className="text-sm text-gray-500">Up to 3 passengers</p>
                  </CardContent>
                </Card>
                {/* Add more vehicle options */}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Continue to Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
