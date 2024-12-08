import { useUser } from "../hooks/use-user";
import BookingWidget from "./BookingWidget";

export default function Hero() {
  const { user } = useUser();

  return (
    <div className="relative h-[90vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1637479457230-7e09c10e37a6)',
          filter: 'brightness(0.6)'
        }}
      />
      
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-serif text-6xl text-white mb-6">
                Luxury Chauffeur Services
              </h1>
              <p className="text-xl text-white/90">
                Experience premium transportation with our professional chauffeur services.
                Travel in style and comfort.
              </p>
            </div>
            <div className="flex justify-end">
              <div className="lg:absolute lg:right-12 lg:top-8 z-20">
                <BookingWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
