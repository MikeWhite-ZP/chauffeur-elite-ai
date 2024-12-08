import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactUs() {
  const { register, handleSubmit, reset } = useForm<ContactFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: ContactFormData) => {
    // TODO: Implement contact form submission
    console.log('Form data:', data);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    reset();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">Contact USA Luxury Limo</h1>
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Contact Information Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <h2 className="font-serif text-3xl mb-4">Get in Touch</h2>
              <div>
                <h3 className="font-serif text-xl mb-2">Email</h3>
                <p className="text-gray-300">info@usaluxurylimo.com</p>
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">Hours of Operation</h3>
                <p className="text-gray-300">24/7 - Available for your luxury transportation needs</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name", { required: true })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: true })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone", { required: true })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...register("message", { required: true })}
                    className="bg-white/10 border-white/20 text-white min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                  Send Message
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
