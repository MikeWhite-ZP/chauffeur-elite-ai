import Hero from "../components/Hero";
import ServiceTiers from "../components/ServiceTiers";
import VehicleGallery from "../components/VehicleGallery";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServiceTiers />
      <VehicleGallery />
      
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl mb-8 text-center">Experience Luxury Transportation</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-serif text-2xl mb-4">Professional Chauffeurs</h3>
              <p>Expertly trained and professionally attired drivers</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-4">Premium Vehicles</h3>
              <p>Luxury fleet maintained to the highest standards</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-4">24/7 Service</h3>
              <p>Available whenever you need us</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
