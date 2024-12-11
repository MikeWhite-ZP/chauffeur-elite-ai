import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSUV() {
  const features = [
    "Professional chauffeur service",
    "Latest model Cadillac Escalade",
    "Premium leather seating",
    "Spacious interior for up to 7 passengers",
    "Advanced climate control",
    "High-end entertainment system",
    "WiFi connectivity",
    "USB charging ports",
    "Privacy glass windows",
    "Extended luggage space",
    "24/7 customer support",
    "Real-time flight tracking",
    "Meet & greet service",
    "Complimentary refreshments"
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
                src="/2024-Cadillac-Escalade-FrontSide_CADESCV22401_640x480-3321341654.jpg"
                alt="2024 Cadillac Escalade"
                className="w-full h-full object-cover object-center rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff";
                  img.alt = "Luxury First Class SUV - Alternative Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Ultimate SUV Luxury</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Experience unparalleled luxury with our First Class SUV service. The Cadillac Escalade, our flagship SUV, represents the pinnacle of automotive excellence and sophistication. With its commanding presence and superior comfort, it's the perfect choice for executives, VIPs, and those who demand the very best in ground transportation.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Each First Class SUV in our fleet is meticulously maintained and equipped with premium amenities to ensure your complete satisfaction. From the premium leather seating to the state-of-the-art entertainment system, every detail has been carefully considered to provide you with an exceptional travel experience.
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
            <h2 className="font-serif text-3xl">Experience First Class Travel</h2>
            <p className="text-lg text-gray-300">
              Book your luxury SUV service today and discover the perfect blend of comfort and sophistication.
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
