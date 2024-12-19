import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Calendar, CreditCard, User } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: JSX.Element;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to USA Luxury Limo",
    description: "Let's take a quick tour of the key features to help you get started.",
    icon: <Car className="w-12 h-12 mb-4 text-primary" />,
  },
  {
    title: "Book Your Ride",
    description: "Easily book luxury transportation services. Choose from our premium fleet of vehicles and specify your pickup and drop-off locations.",
    icon: <Calendar className="w-12 h-12 mb-4 text-primary" />,
    highlight: "/book"
  },
  {
    title: "Real-Time Tracking",
    description: "Track your chauffeur in real-time once your booking is confirmed. Get accurate ETAs and location updates.",
    icon: <MapPin className="w-12 h-12 mb-4 text-primary" />,
    highlight: "/passenger/track"
  },
  {
    title: "Manage Your Profile",
    description: "Update your preferences, view booking history, and manage payment methods in your profile.",
    icon: <User className="w-12 h-12 mb-4 text-primary" />,
    highlight: "/passenger/my-bookings"
  },
  {
    title: "Ready to Go!",
    description: "You're all set to experience luxury transportation. Need help? Contact our 24/7 support team.",
    icon: <CreditCard className="w-12 h-12 mb-4 text-primary" />,
  },
];

export default function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useUser();
  const { toast } = useToast();

  // Show tutorial for new users
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial-completed-${user?.id}`);
    if (user && !hasSeenTutorial) {
      setIsOpen(true);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial-completed-${user.id}`, 'true');
    }
    setIsOpen(false);
    toast({
      title: "Tutorial Completed!",
      description: "You're ready to start using USA Luxury Limo.",
    });
  };

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {currentTutorialStep.icon}
            <DialogTitle className="text-2xl font-semibold">
              {currentTutorialStep.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center pt-4">
            {currentTutorialStep.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
          </Button>
        </DialogFooter>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-4 rounded-full ${
                index === currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
