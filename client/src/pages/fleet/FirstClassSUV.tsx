import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSUV() {
  const features = [
    "Professional chauffeur service",
    "Premium leather captain chairs",
    "Extended passenger capacity",
    "Ambient LED lighting",
    "Advanced climate control",
    "High-end entertainment system",
    "Privacy glass windows",
    "Enhanced sound insulation",
    "Wireless device charging",
    "High-speed WiFi connectivity",
    "Premium refreshment center",
    "Extended luggage space"
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
                Experience unmatched luxury with our First Class SUV service. The Cadillac Escalade, our premium SUV offering, represents the perfect blend of sophistication, comfort, and commanding presence. Ideal for executives, VIP transportation, and special occasions, our First Class SUVs deliver an exceptional travel experience.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Each First Class SUV is equipped with premium amenities and maintained to the highest standards. From the plush leather seating to the state-of-the-art entertainment system, every detail is designed to provide maximum comfort and convenience. Whether you're heading to an important business meeting, special event, or require airport transportation, our First Class SUV service ensures a journey that matches your prestigious standards.
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
