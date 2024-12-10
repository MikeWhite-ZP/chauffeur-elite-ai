import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSUV() {
  const features = [
    "Luxury SUV Service in Houston",
    "Latest Model Vehicles",
    "Professional Uniformed Chauffeurs",
    "Corporate Transportation",
    "Airport Transfer Service",
    "Spacious Leather Interior",
    "Advanced Climate Control",
    "Premium Sound System",
    "High-Speed WiFi",
    "USB Charging Ports",
    "Tinted Windows",
    "Complimentary Water",
    "Extended Luggage Space",
    "Meet & Greet Service",
    "24/7 Support",
    "Real-time Flight Tracking"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          First Class SUV Service
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Vehicle Image Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/2024-Cadillac-Escalade.png"
                alt="2024 Cadillac Escalade - Luxury SUV Service"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff";
                  img.alt = "Luxury SUV - Alternative Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Luxury SUV Transportation</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Welcome to USA Luxury Limo's First Class SUV service in Houston, where we redefine luxury ground transportation. Our fleet features the latest models of Cadillac Escalade and Lincoln Navigator, providing an unmatched blend of style, comfort, and sophistication for our distinguished clients.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Perfect for corporate executives, airport transfers, and special occasions, our First Class SUVs offer spacious interiors that comfortably accommodate up to 7 passengers. Each vehicle is meticulously maintained and equipped with premium amenities to ensure an exceptional travel experience.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our professional chauffeurs are more than just drivers – they're experienced professionals who understand the importance of punctuality, discretion, and superior service. Available 24/7, they ensure safe, comfortable journeys throughout Houston and surrounding areas.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                For airport transfers, we provide complimentary flight tracking and meet & greet service. Our commitment to excellence extends beyond transportation – we create memorable experiences with attention to every detail, from the moment you book until you reach your destination.
              </p>
            </div>

            <div className="bg-white/5 p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-2xl mb-6">Features & Services</h3>
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
            <h2 className="font-serif text-3xl">Experience First Class Travel</h2>
            <p className="text-lg text-gray-300">
              Book your luxury SUV service today and discover the perfect blend of comfort, style, and professional service.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/book" className="bg-white text-black hover:bg-white/90">
                  Book Now
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/about/contact-us" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
