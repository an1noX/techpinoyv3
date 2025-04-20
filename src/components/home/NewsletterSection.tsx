
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing!");
      setEmail("");
    } else {
      toast.error("Please enter your email address");
    }
  };

  return (
    <section className="py-8 bg-gradient-to-r from-teal-500 to-teal-700 text-white">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="mb-4 md:mb-0 flex flex-col md:flex-row items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Mail className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white text-xl md:text-2xl font-bold">
                Sign Up For A
              </h3>
              <div className="bg-yellow-500 px-3 py-1 rounded-md text-black font-bold mt-1 animate-pulse">
                15% OFF COUPON
              </div>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="bg-white text-black rounded-r-none border-r-0 w-full md:w-64"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-l-none">
              SIGN UP
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
