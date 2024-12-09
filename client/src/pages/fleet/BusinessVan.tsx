import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BusinessVan() {
  const features = [
    "Professional chauffeur service",
    "Extended passenger capacity (up to 14)",
    "Premium captain chairs with leather upholstery",
    "Extensive luggage compartment",
    "High-speed WiFi connectivity",
    "Multiple USB charging ports",
    "Tri-zone climate control system",
    "Privacy glass windows",
    "Individual reading lights",
    "High roof for easy movement",
    "Entertainment system",
    "Comfortable armrests"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Business Van Service
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Vehicle Image Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/Mercedes-Sprinter-01-798x466.jpg"
                alt="Mercedes-Benz Sprinter Business Van"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/Mercedes-Sprinter-01-798x466.jpg";
                  e.currentTarget.alt = "Mercedes-Benz Sprinter - Luxury Business Van";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Group Travel Excellence</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Experience ultimate group luxury with our premium Business Van service. Designed for corporate teams, executive groups, and VIP transportation, our spacious luxury vans combine exceptional comfort with sophisticated elegance, ensuring your entire group travels in first-class style.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our meticulously maintained business vans feature extended passenger capacity with premium captain chairs, creating a mobile executive lounge perfect for both business meetings and comfortable travel. The thoughtfully designed interior offers ample headroom, generous legroom, and sophisticated amenities for an unparalleled group transportation experience.
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
              Experience first-class group transportation with our Executive Business Van service.
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
