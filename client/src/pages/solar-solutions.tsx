import { useState } from "react";
import { Link } from "wouter";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import ContactSection from "@/components/ContactSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sun, Home, Building2, Factory, Tractor, Fuel } from "lucide-react";

export default function SolarSolutions() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const solutionCategories = [
    {
      id: "why-solar",
      title: "Why Solar Energy ?",
      icon: <Sun className="h-6 w-6" />,
      description: "Discover the benefits of switching to solar energy",
      content: {
        title: "Why Choose Solar Energy?",
        intro: "Solar energy is the cleanest and most abundant renewable energy source available.",
        benefits: [
          {
            title: "Cost Savings",
            description: "Reduce or eliminate your electricity bills with solar power. Most systems pay for themselves in 5-7 years."
          },
          {
            title: "Environmental Impact",
            description: "Solar energy produces clean, renewable power from the sun and helps combat greenhouse gas emissions."
          },
          {
            title: "Energy Independence",
            description: "Become less reliant on the grid and protect yourself from rising energy costs."
          },
          {
            title: "Increased Property Value",
            description: "Homes with solar installations typically sell for more than homes without."
          },
          {
            title: "Government Incentives",
            description: "Take advantage of federal and state tax credits, rebates, and other incentives."
          },
          {
            title: "Low Maintenance",
            description: "Solar panels require minimal maintenance and come with 25+ year warranties."
          }
        ]
      }
    },
    {
      id: "domestic",
      title: "Domestic",
      icon: <Home className="h-6 w-6" />,
      description: "Solar solutions for homes and residential properties",
      content: {
        title: "Residential Solar Solutions",
        intro: "Transform your home into a power-generating asset with our residential solar solutions.",
        features: [
          "Rooftop solar panel installation",
          "Battery storage systems for 24/7 power",
          "Smart monitoring systems",
          "Grid-tied and off-grid options",
          "EV charging station integration",
          "Customized system design for your home"
        ],
        packages: [
          { name: "Starter", size: "3-5 kW", ideal: "Small homes, 2-3 bedrooms", price: "$12,000 - $18,000" },
          { name: "Standard", size: "6-8 kW", ideal: "Medium homes, 3-4 bedrooms", price: "$20,000 - $28,000" },
          { name: "Premium", size: "10+ kW", ideal: "Large homes, 5+ bedrooms", price: "$35,000+" }
        ]
      }
    },
    {
      id: "commercial",
      title: "Commercial",
      icon: <Building2 className="h-6 w-6" />,
      description: "Comprehensive solar systems for businesses",
      content: {
        title: "Commercial Solar Solutions",
        intro: "Reduce operational costs and demonstrate corporate responsibility with commercial solar.",
        features: [
          "Large-scale rooftop installations",
          "Solar carport systems",
          "Ground-mounted solar arrays",
          "Energy management systems",
          "Power purchase agreements (PPA)",
          "Performance monitoring and maintenance"
        ],
        benefits: [
          "30-50% reduction in energy costs",
          "Accelerated depreciation benefits",
          "Enhanced brand reputation",
          "Predictable energy costs",
          "Carbon footprint reduction",
          "Employee engagement opportunities"
        ]
      }
    },
    {
      id: "industrial",
      title: "Industrial",
      icon: <Factory className="h-6 w-6" />,
      description: "Large-scale solar solutions for industrial facilities",
      content: {
        title: "Industrial Solar Solutions",
        intro: "Power your industrial operations with reliable, cost-effective solar energy.",
        features: [
          "Megawatt-scale installations",
          "High-efficiency solar panels",
          "Industrial battery storage",
          "Microgrid solutions",
          "24/7 monitoring and support",
          "Customized financing options"
        ],
        applications: [
          "Manufacturing facilities",
          "Warehouses and distribution centers",
          "Data centers",
          "Cold storage facilities",
          "Processing plants",
          "Mining operations"
        ]
      }
    },
    {
      id: "agriculture",
      title: "Agriculture",
      icon: <Tractor className="h-6 w-6" />,
      description: "Solar power for farms and agricultural operations",
      content: {
        title: "Agricultural Solar Solutions",
        intro: "Enhance farm productivity and reduce operating costs with solar energy.",
        features: [
          "Solar-powered irrigation systems",
          "Greenhouse heating and cooling",
          "Grain drying systems",
          "Livestock facility power",
          "Solar water pumping",
          "Agrivoltaics (dual-use solar)"
        ],
        benefits: [
          "Reduced dependency on diesel generators",
          "Lower operational costs",
          "Reliable power in remote locations",
          "Sustainable farming practices",
          "Additional revenue from land use",
          "Government agricultural incentives"
        ]
      }
    },
    {
      id: "filling-stations",
      title: "Filling Stations",
      icon: <Fuel className="h-6 w-6" />,
      description: "Solar solutions for gas stations and EV charging",
      content: {
        title: "Filling Station Solar Solutions",
        intro: "Future-proof your filling station with solar-powered fuel and EV charging.",
        features: [
          "Canopy-mounted solar panels",
          "EV fast-charging stations",
          "Battery backup systems",
          "LED lighting integration",
          "Smart energy management",
          "Grid services participation"
        ],
        advantages: [
          "Reduced electricity costs",
          "Additional revenue from EV charging",
          "Enhanced customer experience",
          "Environmental leadership",
          "Shade for customers",
          "Brand differentiation"
        ]
      }
    }
  ];

  const renderContent = () => {
    if (!selectedCategory) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutionCategories.map((category) => (
            <Card 
              key={category.id}
              className="cursor-pointer transition-all bg-white hover:bg-green-50 hover:shadow-lg"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {category.icon}
                  </div>
                  <span className="text-lg">{category.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const category = solutionCategories.find(c => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedCategory(null)}
          className="mb-6"
        >
          ← Back to Solutions
        </Button>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-white/20 rounded-lg">
                {category.icon}
              </div>
              {category.content.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 mb-6">{category.content.intro}</p>
            
            {category.content.benefits && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.content.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {typeof benefit === 'string' ? benefit : benefit.title}
                        </h4>
                        {typeof benefit === 'object' && benefit.description && (
                          <p className="text-gray-600 mt-1">{benefit.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {category.content.features && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Features & Services</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {category.content.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {category.content.packages && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Package Options</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {category.content.packages.map((pkg, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold text-blue-600 mb-2">{pkg.size}</p>
                        <p className="text-sm text-gray-600 mb-2">{pkg.ideal}</p>
                        <p className="font-semibold">{pkg.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {category.content.applications && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Applications</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {category.content.applications.map((app, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {category.content.advantages && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Advantages</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {category.content.advantages.map((advantage, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Ready to Get Started?</h3>
              <p className="text-gray-700 mb-4">
                Contact our experts for a free consultation and customized quote for your {category.title.toLowerCase()} solar needs.
              </p>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Free Quote
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Solutions</h1>
          <p className="text-xl">Comprehensive solar energy solutions for every need - from residential homes to industrial facilities</p>
        </div>
        {/* Decorative Icons */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
          <i className="fas fa-solar-panel text-white text-9xl"></i>
        </div>
        <div className="absolute right-48 top-1/4 opacity-20">
          <i className="fas fa-sun text-white text-7xl"></i>
        </div>
        <div className="absolute right-24 bottom-1/4 opacity-20">
          <i className="fas fa-bolt text-white text-6xl"></i>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        
        {renderContent()}
      </div>
      
      <ContactSection />
      <Footer />
    </div>
  );
}