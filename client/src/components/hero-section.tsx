import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative gradient-hero py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Power Your Future with{" "}
            <span className="text-accent">Clean Energy</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Complete solar energy solutions with professional installation, maintenance, and 24/7 support. 
            Transform your home or business with sustainable energy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-dark text-lg px-8 py-4">
                <i className="fas fa-calculator mr-2"></i>
                Calculate Solar Needs
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="secondary" 
              className="glass-effect text-white hover:bg-white/20 text-lg px-8 py-4"
              onClick={() => {
                const servicesSection = document.getElementById('services');
                servicesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <i className="fas fa-arrow-down mr-2"></i>
              Explore Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
