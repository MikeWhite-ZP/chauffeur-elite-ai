import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSUV() {
  const features = [
    "Professional uniformed chauffeurs",
    "Latest model luxury SUVs",
    "Plush leather interior",
    "Spacious seating for up to 7 passengers",
    "Advanced climate control system",
    "Premium entertainment system",
    "High-end sound system",
    "Tinted privacy windows",
    "High-speed WiFi connectivity",
    "Multiple USB charging ports",
    "Complimentary bottled water",
    "Extended luggage capacity",
    "24/7 customer support",
    "Real-time flight tracking",
    "Full vehicle insurance",
    "Meet & greet service"
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
                className="w-full h-full object-contain rounded-lg"
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
                Experience unmatched luxury with USA Luxury Limo's First Class SUV service in Houston. Our premium fleet features the latest models of Cadillac Escalade and Lincoln Navigator, setting new standards in luxury ground transportation. These meticulously maintained vehicles offer the perfect combination of sophistication, comfort, and reliability for our discerning clients.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our First Class SUVs are ideal for various occasions - from corporate travel and airport transfers to special events and city tours. Each vehicle comes equipped with plush leather interiors, advanced climate control, and state-of-the-art entertainment systems. The spacious cabin accommodates up to 7 passengers comfortably, making it perfect for both business teams and family groups.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                We pride ourselves on our professional chauffeur service. Our uniformed drivers are not just experienced professionals but also local experts who ensure timely arrivals and smooth journeys throughout Houston and surrounding areas. They undergo rigorous training in customer service and safety protocols to provide you with a secure and comfortable travel experience.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                For airport transfers, we offer complimentary flight tracking and meet & greet service. Our 24/7 customer support ensures that your transportation needs are met at any hour, while our commitment to excellence guarantees a luxury experience that exceeds your expectations.
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
