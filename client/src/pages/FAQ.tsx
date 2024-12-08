import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What areas do you serve?",
      answer: "USA Luxury Limo provides premium chauffeur services throughout the greater Houston area, including all major airports, surrounding cities, and inter-city transfers. We serve all of Texas with a focus on delivering exceptional luxury transportation experiences."
    },
    {
      question: "How do I make a reservation?",
      answer: "You can easily make a reservation through our online booking system, available 24/7 on our website. Simply click the 'Book Online' button, select your desired service, and follow the simple booking process. For special requests or assistance, our customer service team is always ready to help."
    },
    {
      question: "What types of vehicles do you offer?",
      answer: "We maintain a diverse fleet of luxury vehicles including Business Sedans, Business SUVs, Business VANs, First-Class Sedans, and First Class SUVs. All our vehicles are late-model, meticulously maintained, and equipped with premium amenities for your comfort."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We understand that plans can change. Our standard cancellation policy requires notice at least 24 hours before your scheduled service. Please contact our customer service team for specific details about cancellations and any applicable fees."
    },
    {
      question: "Do you provide airport transfer services?",
      answer: "Yes, we specialize in airport transfers to and from all major airports in the Houston area. Our chauffeurs monitor flight arrivals in real-time and adjust pickup times accordingly to ensure a smooth experience, whether you're arriving or departing."
    },
    {
      question: "Are your chauffeurs professionally trained?",
      answer: "All our chauffeurs undergo rigorous training, background checks, and regular performance evaluations. They are professionally licensed, experienced in luxury transportation, and committed to providing the highest level of service and discretion."
    },
    {
      question: "Do you offer corporate accounts?",
      answer: "Yes, we offer corporate accounts with specialized services tailored to business needs. Corporate clients enjoy priority booking, consolidated billing, and dedicated account management to ensure seamless transportation solutions for their executives."
    },
    {
      question: "What safety measures do you implement?",
      answer: "Safety is our top priority. We maintain comprehensive insurance coverage, conduct regular vehicle maintenance, and follow strict safety protocols. Our chauffeurs are trained in defensive driving and emergency procedures to ensure your security and peace of mind."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          Frequently Asked Questions
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <p className="text-lg leading-relaxed mb-12 text-center text-gray-300">
              Find answers to common questions about USA Luxury Limo's premium chauffeur services.
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-white/5">
                    <span className="font-serif text-xl text-left">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="text-center pt-12">
            <p className="text-lg text-gray-300 mb-6">
              Have more questions? We're here to help.
            </p>
            <div className="space-x-4">
              <a
                href="/about/contact-us"
                className="inline-block bg-white text-black px-6 py-3 rounded-md hover:bg-white/90 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
