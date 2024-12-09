import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ValentinesDay() {
  const features = [
    "Luxury vehicle of your choice",
    "Professional chauffeur service",
    "Romantic ambiance",
    "Complimentary champagne",
    "Red rose decoration",
    "Mood lighting",
    "Premium sound system",
    "Extended booking hours",
    "Customizable itinerary",
    "Photography stops",
    "Restaurant coordination",
    "Special occasion arrangements"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Valentine's Day Luxury Transportation
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/sedan-luxury.webp"
                alt="Luxury Vehicle for Valentine's Day"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "/sedan-luxury.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Make Your Valentine's Day Unforgettable</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Valentine's Day is a celebration of love, romance, and cherished moments with your special someone. At USA Luxury Limo, we understand the significance of this day and offer exclusive luxury transportation services to make your celebration truly memorable. Our carefully curated Valentine's Day packages combine elegance, comfort, and romantic ambiance to create the perfect setting for your special evening.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Whether you're planning an intimate dinner, a romantic city tour, or a special surprise for your loved one, our professional chauffeurs and luxurious vehicles provide the perfect backdrop for your Valentine's Day celebration. From rose-decorated interiors to champagne service, we pay attention to every detail to ensure your experience is nothing short of extraordinary.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our Valentine's Day service goes beyond transportation – it's about creating magical moments and unforgettable memories. We can assist with restaurant reservations, coordinate surprise elements, and customize your journey to match your vision of the perfect Valentine's Day celebration.
              </p>
            </div>

            <div className="bg-white/5 p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-2xl mb-6">Special Features & Services</h3>
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
            <h2 className="font-serif text-3xl">Plan Your Valentine's Day Experience</h2>
            <p className="text-lg text-gray-300">
              Create lasting memories with our exclusive Valentine's Day luxury transportation service. Book early to ensure availability for this special occasion.
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
