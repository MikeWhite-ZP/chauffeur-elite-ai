import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BusinessSedan() {
  const features = [
    "Professional chauffeur service",
    "Complimentary bottled water",
    "Climate-controlled cabin",
    "Premium leather seating",
    "Ample luggage space",
    "WiFi connectivity",
    "Device charging ports",
    "Tinted windows for privacy"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Business Sedan Service
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Vehicle Image Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/sedan-luxury.webp"
                alt="Mercedes-Benz E-Class Business Sedan"
                className="w-full h-full object-cover rounded-lg brightness-90"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1549767742-ccfdeb07b71d";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Luxury Business Travel</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Experience executive-level comfort with our meticulously maintained business sedans. Perfect for corporate travel, airport transfers, and professional engagements, our vehicles combine sophistication with practicality to deliver an unmatched luxury transportation experience.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Each business sedan in our fleet is selected for its exceptional comfort, reliability, and professional appearance, ensuring you arrive at your destination relaxed and ready for business.
              </p>
            </div>

            <div className="bg-white/5 p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-2xl mb-6">Features & Amenities</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Booking Section */}
          <section className="text-center space-y-6">
            <h2 className="font-serif text-3xl">Ready to Book?</h2>
            <p className="text-lg text-gray-300">
              Experience premium transportation with our business sedan service.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/book">
                <Button className="bg-white text-black hover:bg-white/90">
                  Book Now
                </Button>
              </Link>
              <Link href="/about/contact-us">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
