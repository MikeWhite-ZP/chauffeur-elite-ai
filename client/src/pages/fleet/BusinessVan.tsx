import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BusinessVan() {
  const features = [
    "Professional chauffeur service",
    "Extended passenger capacity",
    "Premium leather seating",
    "Ample luggage space",
    "WiFi connectivity",
    "Device charging ports",
    "Climate-controlled cabin",
    "Privacy glass windows",
    "Comfortable seating arrangement",
    "Easy entry and exit"
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
                src="/business-van-luxury.png"
                alt="Mercedes-Benz Business Van"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b";
                  e.currentTarget.alt = "Luxury Business Van - Alternative Image";
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
                Experience unmatched comfort and sophistication with our premium Business Van service. Perfect for corporate groups, executive teams, or luxury group travel, our spacious vans combine exceptional comfort with professional elegance.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                With extended passenger capacity and ample luggage space, our business vans ensure that your entire group travels together in style. The thoughtfully designed interior provides both comfort and functionality for an exceptional travel experience.
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
              Experience premium group transportation with our Business Van service.
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
