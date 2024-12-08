import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Michael R.",
      location: "Houston, TX",
      rating: 5,
      text: "Exceptional service! Our chauffeur was professional, punctual, and the vehicle was immaculate. USA Luxury Limo has set a new standard for luxury transportation in Houston.",
    },
    {
      name: "Sarah L.",
      location: "The Woodlands, TX",
      rating: 5,
      text: "I've used USA Luxury Limo for both business and personal occasions. Their attention to detail and commitment to customer satisfaction is unmatched. The booking process is seamless, and their fleet is impressive.",
    },
    {
      name: "James K.",
      location: "Sugar Land, TX",
      rating: 5,
      text: "From airport transfers to special events, USA Luxury Limo consistently delivers a first-class experience. Their chauffeurs are knowledgeable and professional, making every ride comfortable and enjoyable.",
    },
    {
      name: "Emily W.",
      location: "Katy, TX",
      rating: 5,
      text: "I booked USA Luxury Limo for my wedding day, and they exceeded all expectations. The vehicle was stunning, the chauffeur was courteous, and the service was impeccable. Highly recommended!",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Testimonials at USA Luxury Limo
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <p className="text-lg leading-relaxed mb-12 text-center text-gray-300">
              Don't just take our word for it. Here's what our valued clients have to say about their experience with USA Luxury Limo's premium chauffeur services.
            </p>

            <div className="grid gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl">{testimonial.name}</h3>
                      <p className="text-gray-400">{testimonial.location}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center pt-12">
            <h2 className="font-serif text-3xl mb-4">Experience Luxury</h2>
            <p className="text-lg text-gray-300 mb-6">
              Join our satisfied clients and experience the epitome of luxury transportation.
            </p>
            <Link href="/book">
              <Button className="bg-white text-black hover:bg-white/90">
                Book Your Luxury Ride
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
