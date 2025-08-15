import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import ContactSection from "@/components/ContactSection";

interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  systemSize: string;
  panels: number;
  completion: string;
  description: string;
  features: string[];
  image: string;
  savings: string;
  co2Reduced: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "Green Valley Shopping Mall",
    category: "Commercial",
    location: "Islamabad, Pakistan",
    systemSize: "500 kW",
    panels: 1250,
    completion: "December 2024",
    description: "Large-scale rooftop solar installation for one of Islamabad's premier shopping destinations. This project powers 60% of the mall's daytime energy needs.",
    features: ["Tier-1 Solar Panels", "Smart Monitoring System", "Grid-Tied System", "Remote Monitoring"],
    image: "🏢",
    savings: "PKR 2.5M/month",
    co2Reduced: "450 tons/year"
  },
  {
    id: "2",
    title: "Sunrise Textile Factory",
    category: "Industrial",
    location: "Faisalabad, Pakistan",
    systemSize: "2 MW",
    panels: 5000,
    completion: "November 2024",
    description: "Mega solar project for textile manufacturing facility, significantly reducing operational costs and carbon footprint.",
    features: ["Bifacial Panels", "Industrial Grade Inverters", "SCADA System", "Peak Shaving"],
    image: "🏭",
    savings: "PKR 8M/month",
    co2Reduced: "1800 tons/year"
  },
  {
    id: "3",
    title: "Model Town Residential Complex",
    category: "Residential",
    location: "Lahore, Pakistan",
    systemSize: "100 kW",
    panels: 250,
    completion: "October 2024",
    description: "Community solar project serving 50 homes with clean, renewable energy and net metering benefits.",
    features: ["Net Metering", "Battery Backup", "Mobile App Monitoring", "10-Year Warranty"],
    image: "🏘️",
    savings: "PKR 500K/month",
    co2Reduced: "90 tons/year"
  },
  {
    id: "4",
    title: "Punjab Agricultural University",
    category: "Educational",
    location: "Rawalpindi, Pakistan",
    systemSize: "300 kW",
    panels: 750,
    completion: "September 2024",
    description: "Solar installation powering university campus, including laboratories and administrative buildings.",
    features: ["Educational Display", "Research Integration", "Hybrid System", "Weather Station"],
    image: "🎓",
    savings: "PKR 1.5M/month",
    co2Reduced: "270 tons/year"
  },
  {
    id: "5",
    title: "Karachi International Airport Parking",
    category: "Infrastructure",
    location: "Karachi, Pakistan",
    systemSize: "1.5 MW",
    panels: 3750,
    completion: "August 2024",
    description: "Solar canopy installation providing shade for vehicles while generating clean energy for airport operations.",
    features: ["Solar Canopies", "EV Charging Stations", "LED Lighting", "24/7 Monitoring"],
    image: "✈️",
    savings: "PKR 6M/month",
    co2Reduced: "1350 tons/year"
  },
  {
    id: "6",
    title: "Rural Health Centers Network",
    category: "Healthcare",
    location: "Sindh Province, Pakistan",
    systemSize: "200 kW",
    panels: 500,
    completion: "July 2024",
    description: "Off-grid solar systems for 10 rural health centers, ensuring uninterrupted power for critical medical equipment.",
    features: ["Off-Grid System", "Battery Storage", "Medical Grade Power", "Automatic Backup"],
    image: "🏥",
    savings: "PKR 1M/month",
    co2Reduced: "180 tons/year"
  },
  {
    id: "7",
    title: "Serena Hotels Chain",
    category: "Hospitality",
    location: "Multiple Locations",
    systemSize: "800 kW",
    panels: 2000,
    completion: "June 2024",
    description: "Solar installations across 5 luxury hotels, enhancing sustainability credentials and reducing energy costs.",
    features: ["Aesthetic Design", "Pool Heating", "Hot Water System", "Green Certification"],
    image: "🏨",
    savings: "PKR 4M/month",
    co2Reduced: "720 tons/year"
  },
  {
    id: "8",
    title: "Smart City Housing Scheme",
    category: "Residential",
    location: "Gwadar, Pakistan",
    systemSize: "5 MW",
    panels: 12500,
    completion: "May 2024",
    description: "Pakistan's largest residential solar project, powering 500+ homes in a modern housing development.",
    features: ["Smart Grid Integration", "Community Battery", "IoT Sensors", "Energy Trading"],
    image: "🌆",
    savings: "PKR 20M/month",
    co2Reduced: "4500 tons/year"
  },
  {
    id: "9",
    title: "Organic Farms Cooperative",
    category: "Agriculture",
    location: "Punjab, Pakistan",
    systemSize: "600 kW",
    panels: 1500,
    completion: "April 2024",
    description: "Solar-powered irrigation and cold storage systems for organic farming cooperative.",
    features: ["Solar Pumping", "Cold Storage", "Drip Irrigation", "Crop Monitoring"],
    image: "🌾",
    savings: "PKR 3M/month",
    co2Reduced: "540 tons/year"
  }
];

const categories = ["All", "Commercial", "Industrial", "Residential", "Educational", "Infrastructure", "Healthcare", "Hospitality", "Agriculture"];

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects Portfolio</h1>
          <p className="text-xl">Transforming Pakistan's Energy Landscape, One Project at a Time</p>
          
          {/* Building/Construction Icons - Projects Page */}
          <div className="absolute right-0 top-0 flex items-start gap-4 opacity-20">
            {/* Building 1 */}
            <svg className="w-16 h-24 mt-4" viewBox="0 0 100 120" fill="white">
              <rect x="30" y="40" width="40" height="80" fill="white"/>
              <rect x="35" y="50" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="50" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="35" y="70" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="70" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="35" y="90" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="90" width="10" height="10" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
            
            {/* Building 2 */}
            <svg className="w-20 h-32 mt-2" viewBox="0 0 100 140" fill="white">
              <rect x="25" y="30" width="50" height="110" fill="white"/>
              <rect x="30" y="40" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="40" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="30" y="65" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="65" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="30" y="90" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="90" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="30" y="115" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="55" y="115" width="15" height="15" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
            
            {/* Crane */}
            <svg className="w-28 h-36 mr-8" viewBox="0 0 120 160" fill="white">
              <rect x="50" y="80" width="8" height="80" fill="white"/>
              <line x1="54" y1="80" x2="100" y2="40" stroke="white" strokeWidth="3"/>
              <line x1="100" y1="40" x2="100" y2="60" stroke="white" strokeWidth="2"/>
              <rect x="45" y="150" width="18" height="10" fill="white"/>
            </svg>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer group">
              <div className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110">50+</div>
              <div className="text-sm transition-all duration-300 group-hover:text-white/90">Completed Projects</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer group">
              <div className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110">15 MW</div>
              <div className="text-sm transition-all duration-300 group-hover:text-white/90">Total Capacity</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer group">
              <div className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110">30,000+</div>
              <div className="text-sm transition-all duration-300 group-hover:text-white/90">Solar Panels Installed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer group">
              <div className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110">13,500</div>
              <div className="text-sm transition-all duration-300 group-hover:text-white/90">Tons CO₂ Reduced/Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-white hover:bg-green-50 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-4xl">{project.image}</div>
                  <Badge className="bg-green-100 text-green-800">
                    {project.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-map-marker-alt"></i>
                    {project.location}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">System Size</div>
                      <div className="font-semibold">{project.systemSize}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Solar Panels</div>
                      <div className="font-semibold">{project.panels.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Monthly Savings</div>
                      <div className="font-semibold text-green-600">{project.savings}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">CO₂ Reduced</div>
                      <div className="font-semibold text-blue-600">{project.co2Reduced}</div>
                    </div>
                  </div>

                  {expandedProject === project.id && (
                    <div className="pt-3 border-t space-y-3">
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <div>
                        <div className="text-sm font-semibold mb-2">Key Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {project.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-500">
                          Completed: {project.completion}
                        </span>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          View Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ContactSection />
      <Footer />
    </div>
  );
}