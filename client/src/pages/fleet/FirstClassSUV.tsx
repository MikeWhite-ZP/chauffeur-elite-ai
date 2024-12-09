import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSUV() {
  const features = [
    "Professional chauffeur service",
    "Luxurious extended SUV fleet",
    "Premium leather seating",
    "Extended passenger capacity",
    "Advanced climate control",
    "Entertainment system",
    "Premium sound system",
    "Privacy glass windows",
    "WiFi connectivity",
    "USB charging ports",
    "Complimentary refreshments",
    "Ample luggage space",
    "24/7 customer service",
    "Flight monitoring"
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
                alt="2024 Cadillac Escalade"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null; // Prevent infinite loop
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
              <h2 className="font-serif text-3xl">Ultimate Luxury SUV Experience</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Experience the epitome of luxury transportation with our First Class SUV service in Houston. Our premium fleet, featuring vehicles like the Cadillac Escalade and Lincoln Navigator, combines sophisticated style with exceptional comfort. These vehicles are perfect for corporate executives, VIP transportation, special events, and luxury airport transfers.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our First Class SUVs are meticulously maintained and equipped with premium amenities to ensure your complete satisfaction. From the spacious leather interiors to the state-of-the-art entertainment systems, every detail is carefully considered. We provide 24/7 customer service, professional chauffeurs, and flight monitoring for airport transfers, ensuring a seamless and luxurious travel experience throughout Houston and surrounding areas.
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
            <h2 className="font-serif text-3xl">Ready to Experience First Class?</h2>
            <p className="text-lg text-gray-300">
              Book your luxury SUV service today and discover the perfect blend of comfort, style, and sophistication.
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
