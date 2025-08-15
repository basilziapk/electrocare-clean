import { useState } from "react";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const { user } = useSimpleAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "I thought solar was complicated, but ElectroCare made it a breeze. Now I'm practically living off sunshine and good vibes.",
      author: "Fatima Ali",
      role: "Business Owner",
      avatar: "FA"
    },
    {
      id: 2,
      text: "My electric bill used to be a monster. ElectroCare tamed it! My wallet is happier, and so is the planet.",
      author: "Hassan Malik",
      role: "Resident",
      avatar: "HM"
    },
    {
      id: 3,
      text: "Seriously, why are you still paying for electricity? ElectroCare is the answer. It's like having a personal sun.",
      author: "Ayesha Tariq",
      role: "Customer",
      avatar: "AT"
    },
    {
      id: 4,
      text: "The installation was smooth and professional. ElectroCare's team exceeded all my expectations.",
      author: "Ahmed Khan",
      role: "Factory Owner",
      avatar: "AK"
    },
    {
      id: 5,
      text: "Best investment I've made for my home. The savings are incredible and the service was outstanding.",
      author: "Zainab Sheikh",
      role: "Homeowner",
      avatar: "ZS"
    },
    {
      id: 6,
      text: "ElectroCare transformed our energy costs. We're now saving 70% on our monthly bills!",
      author: "Usman Ahmad",
      role: "Store Owner",
      avatar: "UA"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 3) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 3 + testimonials.length) % testimonials.length);
  };

  const getDashboardLink = () => {
    switch ((user as any)?.role) {
      case 'admin':
        return '/admin';
      case 'technician':
        return '/technician';
      case 'customer':
        return '/customer';
      default:
        return '/calculator';
    }
  };

  const getDashboardTitle = () => {
    switch ((user as any)?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'technician':
        return 'Technician Dashboard';
      case 'customer':
        return 'Customer Dashboard';
      default:
        return 'Solar Load Calculator';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NewNavigation />
      
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-8 mb-2">
            <img 
              src="/electrocare-logo.png" 
              alt="ElectroCare Logo" 
              className="h-48 w-auto -ml-12"
            />
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome to ElectroCare
              </h1>
              <p className="text-2xl text-white/90">
                One Stop Electric Solutions
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/new-installation">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
                <i className="fas fa-file-invoice mr-2"></i>
                Get Installation Quote
              </Button>
            </Link>
            <Link href="/calculator">
              <Button size="lg" className="bg-yellow-500 text-white hover:bg-yellow-600 text-lg px-8 py-4 font-semibold">
                <i className="fas fa-calculator mr-2"></i>
                Solar Load Calculator
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Solar Panels Decoration - Home Page */}
        <div className="absolute right-0 bottom-0 flex items-end gap-4 opacity-20">
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="white">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="30" x2="90" y2="30" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="70" x2="90" y2="70" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="10" x2="30" y2="90" stroke="white" strokeWidth="2"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2"/>
            <line x1="70" y1="10" x2="70" y2="90" stroke="white" strokeWidth="2"/>
          </svg>
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="white">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M50,10 L50,50 L30,30" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="50" cy="50" r="5" fill="white"/>
            <path d="M20,50 Q35,35 50,50 T80,50" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M20,60 Q35,45 50,60 T80,60" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M20,40 Q35,25 50,40 T80,40" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
          <svg className="w-28 h-28 mr-8" viewBox="0 0 100 100" fill="white">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="30" x2="90" y2="30" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="2"/>
            <line x1="10" y1="70" x2="90" y2="70" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="10" x2="30" y2="90" stroke="white" strokeWidth="2"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2"/>
            <line x1="70" y1="10" x2="70" y2="90" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Services Section with YouTube Video Background */}
      <div className="relative bg-gray-100 py-20 overflow-hidden">
        {/* YouTube Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src="https://www.youtube.com/embed/iCvUFavByJE?autoplay=1&mute=1&loop=1&playlist=iCvUFavByJE&controls=0&showinfo=0&rel=0&modestbranding=1&vq=hd1080"
            title="Background video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
          <div className="absolute inset-0 bg-white/30"></div>
        </div>
        
        {/* Content Cards */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-lightbulb text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Solar System Consultation</h3>
              <p className="text-gray-600 mb-4 text-sm">Expert guidance for your solar energy journey</p>
              <Link href="/services">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
                  <i className="fas fa-arrow-right mr-2"></i>Learn More
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-solar-panel text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Installation Quotes</h3>
              <p className="text-gray-600 mb-4 text-sm">View and manage your solar installations</p>
              <Link href="/new-installation">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                  <i className="fas fa-plus mr-2"></i>Get Quote
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-headset text-green-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Support Center</h3>
              <p className="text-gray-600 mb-4 text-sm">Get help and submit support tickets anytime</p>
              <Link href="/contact">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">Get Support</Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-calculator text-yellow-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Solar Load Calculator</h3>
              <p className="text-gray-600 mb-4 text-sm">Calculate your daily energy needs easily</p>
              <Link href="/calculator">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm">Calculate Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Happy Clients Section */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            Happy Clients
          </h2>
          
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Testimonial Cards */}
            <div className="grid md:grid-cols-3 gap-6 px-12">
              {[0, 1, 2].map((offset) => {
                const index = (currentTestimonial + offset) % testimonials.length;
                const testimonial = testimonials[index];
                
                return (
                  <div
                    key={testimonial.id}
                    className="bg-gradient-to-br from-teal-800 to-cyan-900 rounded-2xl p-6 relative overflow-hidden"
                  >
                    {/* Decorative Quote Icon */}
                    <div className="absolute top-4 left-4 text-6xl text-white/20">
                      "
                    </div>
                    
                    {/* Moon/Circle Decoration */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
                    
                    {/* Testimonial Content */}
                    <div className="relative z-10">
                      <p className="text-white text-sm mb-6 leading-relaxed min-h-[100px]">
                        {testimonial.text}
                      </p>
                      
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{testimonial.author}</p>
                          <p className="text-cyan-200 text-xs">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Why Go Solar Section */}
      <div className="bg-gradient-to-br from-slate-900 to-cyan-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            Why Go Solar?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sunny Savings Card */}
            <div className="bg-gradient-to-br from-cyan-700 to-teal-600 rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                {/* Solar Panel Pattern */}
                <div className="absolute inset-0 opacity-50">
                  <div className="grid grid-cols-4 gap-1 p-4">
                    {[...Array(32)].map((_, i) => (
                      <div key={i} className="bg-blue-900 h-8 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=300&fit=crop" 
                  alt="Solar Installation"
                  className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">Sunny Savings</h3>
                <p className="text-cyan-100 text-sm mb-6 leading-relaxed">
                  Watch your electricity bills shrink faster than a sunburn in July. More money for fun stuff!
                </p>
                <Button className="w-full bg-cyan-800 hover:bg-cyan-900 text-white border-0">
                  Save Now
                </Button>
              </div>
            </div>

            {/* Green Power Card */}
            <div className="bg-gradient-to-br from-cyan-700 to-teal-600 rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-pink-600 to-purple-800 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop" 
                  alt="Sunset Mountains"
                  className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:opacity-100"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">Green Power</h3>
                <p className="text-cyan-100 text-sm mb-6 leading-relaxed">
                  Be a hero for Mother Earth. Our solar solutions mean cleaner air and a happier planet for everyone.
                </p>
                <Button className="w-full bg-cyan-800 hover:bg-cyan-900 text-white border-0">
                  Save Now
                </Button>
              </div>
            </div>

            {/* Smart Tech Card */}
            <div className="bg-gradient-to-br from-cyan-700 to-teal-600 rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-sky-500 to-blue-700 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&h=300&fit=crop" 
                  alt="Solar Technology"
                  className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-1 group-hover:opacity-100"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">Smart Tech</h3>
                <p className="text-cyan-100 text-sm mb-6 leading-relaxed">
                  We use the latest, greatest solar tech. It's so advanced, it practically installs itself (okay, not really, but it's close!).
                </p>
                <Button className="w-full bg-cyan-800 hover:bg-cyan-900 text-white border-0">
                  Save Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
            Solar Energy FAQs
          </h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-5 border">
              <AccordionTrigger className="text-base font-medium text-gray-900 hover:text-blue-600 py-3">
                How long do solar panels last?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm pt-1 pb-3">
                Solar panels typically last 25-30 years or more. Most manufacturers offer warranties 
                guaranteeing at least 80% of the original power output after 25 years. With proper 
                maintenance, many panels continue producing electricity well beyond their warranty period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-5 border">
              <AccordionTrigger className="text-base font-medium text-gray-900 hover:text-blue-600 py-3">
                How long does installation take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm pt-1 pb-3">
                A typical residential solar panel installation takes 1-3 days once all permits are approved. 
                The entire process from consultation to activation usually takes 2-3 months, including site 
                assessment, design, permitting, installation, and utility interconnection.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-5 border">
              <AccordionTrigger className="text-base font-medium text-gray-900 hover:text-blue-600 py-3">
                Will solar lower my bills?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm pt-1 pb-3">
                Yes, solar panels can significantly reduce or even eliminate your electricity bills. 
                The exact savings depend on your system size, energy consumption, local electricity rates, 
                and available sunlight. Many homeowners see 50-90% reduction in their monthly electricity costs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-5 border">
              <AccordionTrigger className="text-base font-medium text-gray-900 hover:text-blue-600 py-3">
                Are there financing options?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm pt-1 pb-3">
                Yes, we offer multiple financing options including solar loans, leases, and power purchase 
                agreements (PPAs). Many customers qualify for $0 down financing. Additionally, federal and 
                state tax credits can reduce the overall cost by 30% or more.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-5 border">
              <AccordionTrigger className="text-base font-medium text-gray-900 hover:text-blue-600 py-3">
                Can panels withstand weather?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm pt-1 pb-3">
                Solar panels are designed to withstand extreme weather conditions including hail, high winds, 
                and heavy snow. They're tested to survive hail up to 1 inch in diameter at 50 mph and wind 
                speeds up to 140 mph. The tempered glass and aluminum frames provide excellent durability.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Contact Section with Map */}
      <div className="relative h-[500px] lg:h-[600px]">
        {/* Full Width Map */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3297.3888679744447!2d72.02608931515!3d34.18938898057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDExJzIxLjgiTiA3MsKwMDEnMzMuOSJF!5e0!3m2!1sen!2s!4v1642528731614!5m2!1sen!2s&gestureHandling=greedy"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
        
        {/* Contact Information Overlay */}
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-2xl p-8 max-w-sm z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
          
          <div className="space-y-4 text-gray-700 text-sm">
            <div>
              <span className="font-semibold">Phone: </span>
              <span>+92 1233218777</span>
            </div>
            
            <div>
              <span className="font-semibold">WhatsApp: </span>
              <a 
                href="https://wa.me/921233218777" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline"
              >
                +92 1233218777
              </a>
            </div>
            
            <div>
              <span className="font-semibold">Email: </span>
              <span>info@solarenergypros.com</span>
            </div>
            
            <div>
              <span className="font-semibold">Location: </span>
              <span>Opposite Haji Gul Plaza, Mardan, KPK, Pakistan</span>
            </div>
            
            <div>
              <span className="font-semibold">Hours: </span>
              <span>Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
