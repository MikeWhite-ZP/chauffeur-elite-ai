import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Business Class",
    description: "Premium sedan service for business professionals",
    features: [
      "Late model luxury sedan",
      "Professional chauffeur",
      "Complimentary water",
      "WiFi enabled"
    ],
    image: "https://images.unsplash.com/photo-1549339435-27b266ac6f91"
  },
  {
    name: "First Class",
    description: "Ultimate luxury experience for discerning clients",
    features: [
      "Premium luxury vehicle",
      "Executive chauffeur",
      "Premium refreshments",
      "Privacy partition",
      "Extended amenities"
    ],
    image: "https://images.unsplash.com/photo-1678728994157-0bcb3309200f"
  }
];

export default function ServiceTiers() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-4xl text-center mb-16">Service Tiers</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier) => (
            <Card key={tier.name} className="overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${tier.image})` }}
              />
              <CardHeader>
                <CardTitle className="font-serif text-2xl">{tier.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">{tier.description}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
