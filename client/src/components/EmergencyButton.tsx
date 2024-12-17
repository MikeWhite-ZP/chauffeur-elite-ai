import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface EmergencyButtonProps {
  chauffeurId: number;
  bookingId?: number;
}

export default function EmergencyButton({ chauffeurId, bookingId }: EmergencyButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmergency = async () => {
    try {
      setIsSubmitting(true);
      
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const response = await fetch('/api/driver/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chauffeurId,
          bookingId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency signal');
      }

      toast({
        title: "Emergency Signal Sent",
        description: "Support team has been notified and will contact you shortly.",
        variant: "default",
      });
    } catch (error) {
      console.error('Emergency signal error:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency signal. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg"
          className="w-full py-6 text-lg font-bold"
        >
          <AlertTriangle className="mr-2 h-6 w-6" />
          Emergency Support
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Emergency Support Request</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately alert our support team and share your current location.
            Only use this for genuine emergencies.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEmergency}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Emergency Signal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
