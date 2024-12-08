import BookingForm from "../components/BookingForm";
import { Card } from "@/components/ui/card";

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl mb-8">Book Your Chauffeur</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <BookingForm />
          </Card>
          
          <div className="space-y-6">
            <div 
              className="h-64 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1507679799987-c73779587ccf)'
              }}
            />
            
            <div className="bg-black text-white p-6 rounded-lg">
              <h2 className="font-serif text-2xl mb-4">Premium Service Guarantee</h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Professional, certified chauffeurs
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Luxury vehicle fleet
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  24/7 customer support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Complimentary wait time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
