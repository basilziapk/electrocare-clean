import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import ServicesSection from "@/components/services-section";
import SolarCalculator from "@/components/solar-calculator";
import TestimonialsSection from "@/components/testimonials-section";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <SolarCalculator />
      <TestimonialsSection />
      <div className="gradient-hero py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Go Solar?</h2>
          <p className="text-xl text-gray-200 mb-8">Join thousands of satisfied customers who've made the switch to clean, renewable energy.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-file-alt mr-2"></i>
              Get Free Quote
            </button>
            <button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              <i className="fas fa-calendar mr-2"></i>
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
