import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const vehicles = [
  {
    image: "https://images.unsplash.com/photo-1678728994157-0bcb3309200f",
    name: "Mercedes S-Class",
    description: "Ultimate luxury sedan"
  },
  {
    image: "https://images.unsplash.com/photo-1549339435-27b266ac6f91",
    name: "BMW 7 Series",
    description: "Executive comfort"
  },
  {
    image: "https://images.unsplash.com/photo-1637479457230-7e09c10e37a6",
    name: "Rolls-Royce Phantom",
    description: "Peak luxury experience"
  },
  {
    image: "https://images.unsplash.com/photo-1655827763440-7905302b75ff",
    name: "Bentley Flying Spur",
    description: "British luxury"
  }
];

export default function VehicleGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-4xl text-center mb-16">Our Fleet</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {vehicles.map((vehicle, index) => (
            <Card
              key={vehicle.name}
              className="overflow-hidden transition-transform duration-300 hover:-translate-y-2"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div
                className="h-48 bg-cover bg-center transition-transform duration-500"
                style={{
                  backgroundImage: `url(${vehicle.image})`,
                  transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)'
                }}
              />
              <CardContent className="p-4">
                <h3 className="font-serif text-xl mb-2">{vehicle.name}</h3>
                <p className="text-gray-600">{vehicle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
