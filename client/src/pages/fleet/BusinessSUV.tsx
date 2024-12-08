import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BusinessSUV() {
  const features = [
    "Professional chauffeur service",
    "Elevated ride height for better views",
    "Spacious interior with extra legroom",
    "Premium leather seating",
    "Enhanced luggage capacity",
    "WiFi connectivity",
    "Device charging ports",
    "Privacy glass windows",
    "Climate-controlled cabin",
    "Complimentary bottled water"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Business SUV Service
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Vehicle Image Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/2024-Chevrolet-Suburban-LT-2024CHS270001_2100_01.png"
                alt="Chevrolet Suburban Business SUV"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff";
                  e.currentTarget.alt = "Luxury Business SUV - Alternative Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Elite SUV Experience</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Elevate your journey with our premium Business SUV service. Offering superior comfort and commanding presence, our luxury SUVs combine spacious interiors with sophisticated style, perfect for executives who demand both comfort and capability.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Whether you're heading to important meetings, airport transfers, or special events, our Business SUVs provide an elevated vantage point and ample space for both passengers and luggage, ensuring a truly premium travel experience.
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
              Experience luxury transportation at its finest with our Business SUV service.
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
