import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUser } from "../hooks/use-user";

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
          <div className="max-w-3xl">
            <h1 className="font-serif text-6xl text-white mb-6">
              Luxury Chauffeur Services
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Experience premium transportation with our professional chauffeur services.
              Travel in style and comfort.
            </p>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <a 
                  href="https://book.mylimobiz.com/v4/uniontx" 
                  data-ores-widget="quickres" 
                  data-ores-alias="uniontx" 
                  data-redirect-url="https://usaluxurylimo.com/book-now/"
                  className="text-white text-xl hover:text-gray-200"
                >
                  Online Reservations
                </a>
              </div>
              <div className="space-x-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Link href={user ? "/book" : "/auth"}>
                    Book Now
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-black border-white hover:bg-white/90"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
