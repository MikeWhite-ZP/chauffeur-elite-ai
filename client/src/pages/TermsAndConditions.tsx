export default function TermsAndConditions() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">Terms and Conditions</h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="font-serif text-3xl mb-4">Acceptance of Terms</h2>
            <p className="text-lg leading-relaxed mb-6">
              By accessing and using USA Luxury Limo's services, you acknowledge and agree to these terms and conditions. These terms govern your use of our chauffeur services and website.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Reservations and Cancellations</h2>
            <ul className="space-y-4 text-gray-300">
              <li>• Advance reservations are required for all services</li>
              <li>• Cancellations must be made at least 24 hours prior to service</li>
              <li>• Late cancellations may incur charges up to the full service amount</li>
              <li>• We reserve the right to charge a cancellation fee for no-shows</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Payment Terms</h2>
            <div className="space-y-4 text-gray-300">
              <p>• Full payment is required at the time of booking</p>
              <p>• We accept all major credit cards</p>
              <p>• Additional charges may apply for wait time, extra stops, or route changes</p>
              <p>• Gratuity is not included in the base fare</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Service Standards</h2>
            <div className="space-y-4 text-gray-300">
              <p>• All chauffeurs are professionally trained and licensed</p>
              <p>• Vehicles are regularly maintained and inspected</p>
              <p>• We maintain comprehensive insurance coverage</p>
              <p>• Service areas may be limited based on location</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Liability</h2>
            <p className="text-lg leading-relaxed mb-6">
              USA Luxury Limo is not liable for delays caused by traffic, weather, or circumstances beyond our control. We maintain comprehensive insurance coverage for our services but are not responsible for lost or damaged personal property.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Privacy Policy</h2>
            <p className="text-lg leading-relaxed mb-6">
              We respect your privacy and protect your personal information. Customer data is collected and used solely for booking and service purposes, in compliance with applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl mb-4">Modifications</h2>
            <p className="text-lg leading-relaxed">
              USA Luxury Limo reserves the right to modify these terms and conditions at any time. Continued use of our services following any changes constitutes acceptance of the modified terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
