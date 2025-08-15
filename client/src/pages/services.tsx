import { useState } from "react";
import { Link } from "wouter";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import ContactSection from "@/components/ContactSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SuccessModal } from "@/components/crud-modals";
import { 
  Lightbulb, 
  Wrench, 
  Settings, 
  Droplets, 
  Gauge,
  ChevronRight,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  ClipboardCheck
} from "lucide-react";

// Service request form schema
const serviceRequestSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Estimated price is required"),
  duration: z.string().min(1, "Duration is required"),
  requirements: z.string().optional(),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

export default function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      requirements: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceRequestForm) => {
      const response = await apiRequest("/api/services", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      setShowSuccessModal(true);
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      form.reset();
      setShowRequestForm(false);
    },
  });

  const services = [
    {
      id: "consultancy",
      title: "Solar System Consultancy",
      icon: <Lightbulb className="h-6 w-6" />,
      shortDescription: "Expert guidance for your solar energy journey",
      content: {
        title: "Solar System Consultancy Services",
        description: "Our expert consultants provide comprehensive guidance to help you make informed decisions about solar energy adoption. We analyze your energy needs, assess your property, and design the optimal solar solution for maximum efficiency and savings.",
        features: [
          "Energy consumption analysis and audit",
          "Site assessment and feasibility study",
          "System design and sizing recommendations",
          "Financial analysis and ROI calculations",
          "Regulatory compliance guidance",
          "Vendor selection assistance",
          "Project management consultation",
          "Grid connection advisory"
        ],
        process: [
          { step: "Initial Consultation", description: "Understanding your energy needs and goals" },
          { step: "Site Survey", description: "Detailed assessment of your property" },
          { step: "System Design", description: "Custom solar solution tailored to your needs" },
          { step: "Financial Planning", description: "Cost analysis and financing options" },
          { step: "Implementation Roadmap", description: "Step-by-step plan for solar adoption" }
        ],
        benefits: [
          "Make informed investment decisions",
          "Optimize system size and configuration",
          "Maximize return on investment",
          "Ensure regulatory compliance",
          "Avoid common pitfalls"
        ]
      }
    },
    {
      id: "installation",
      title: "Solar System Installation",
      icon: <Wrench className="h-6 w-6" />,
      shortDescription: "Professional installation by certified technicians",
      content: {
        title: "Solar System Installation Services",
        description: "Our certified installation team ensures your solar system is installed safely, efficiently, and to the highest standards. We handle everything from permits to final commissioning.",
        features: [
          "Professional installation by certified technicians",
          "Complete system setup and configuration",
          "Electrical connections and grid integration",
          "Mounting system installation",
          "Inverter and battery setup",
          "System testing and commissioning",
          "Documentation and warranty registration",
          "Post-installation support"
        ],
        installationTypes: [
          { type: "Rooftop Installation", description: "Optimal for homes and commercial buildings" },
          { type: "Ground Mount", description: "Ideal for properties with land availability" },
          { type: "Carport Solar", description: "Dual-purpose shade and power generation" },
          { type: "Building Integrated", description: "Seamlessly integrated solar solutions" }
        ],
        timeline: [
          "Day 1-2: Site preparation and mounting structure",
          "Day 3-4: Panel installation and DC wiring",
          "Day 5: Inverter installation and AC connections",
          "Day 6: System testing and commissioning",
          "Day 7: Final inspection and handover"
        ]
      }
    },
    {
      id: "maintenance",
      title: "Solar System Maintenance",
      icon: <Settings className="h-6 w-6" />,
      shortDescription: "Keep your system running at peak performance",
      content: {
        title: "Solar System Maintenance Services",
        description: "Regular maintenance ensures your solar system operates at maximum efficiency throughout its lifespan. Our comprehensive maintenance packages protect your investment and maximize energy production.",
        features: [
          "Regular system health checks",
          "Performance monitoring and analysis",
          "Preventive maintenance schedules",
          "Component testing and diagnostics",
          "Inverter maintenance and updates",
          "Electrical connection inspections",
          "Warranty claim assistance",
          "24/7 emergency support"
        ],
        maintenancePackages: [
          {
            name: "Basic",
            frequency: "Annual",
            includes: ["Visual inspection", "Basic cleaning", "Performance report", "Warranty support"]
          },
          {
            name: "Standard",
            frequency: "Bi-annual",
            includes: ["Comprehensive inspection", "Professional cleaning", "Thermal imaging", "Detailed reporting", "Priority support"]
          },
          {
            name: "Premium",
            frequency: "Quarterly",
            includes: ["All Standard features", "Preventive replacements", "Remote monitoring", "24/7 support", "Performance guarantee"]
          }
        ],
        commonIssues: [
          "Reduced power output",
          "Inverter failures",
          "Panel degradation",
          "Wiring issues",
          "Monitoring system errors",
          "Grid connection problems"
        ]
      }
    },
    {
      id: "cleaning",
      title: "Solar Panel Cleaning",
      icon: <Droplets className="h-6 w-6" />,
      shortDescription: "Professional cleaning for optimal performance",
      content: {
        title: "Solar Panel Cleaning Services",
        description: "Dirty solar panels can lose up to 30% of their efficiency. Our professional cleaning service ensures your panels operate at maximum capacity, increasing energy production and extending system life.",
        features: [
          "Professional cleaning equipment and techniques",
          "Eco-friendly cleaning solutions",
          "Safety-compliant procedures",
          "Pre and post-cleaning performance analysis",
          "Bird dropping and debris removal",
          "Anti-soiling coating application",
          "Scheduled cleaning programs",
          "Emergency cleaning services"
        ],
        cleaningProcess: [
          "Initial inspection and assessment",
          "Performance measurement before cleaning",
          "Gentle brushing and debris removal",
          "Deionized water cleaning",
          "Final rinse and drying",
          "Post-cleaning performance verification"
        ],
        frequency: {
          residential: "Every 6-12 months",
          commercial: "Every 3-6 months",
          industrial: "Every 2-3 months",
          dusty: "Monthly in high-dust areas"
        },
        benefits: [
          "Increase energy output by up to 30%",
          "Extend panel lifespan",
          "Maintain warranty validity",
          "Improve system ROI",
          "Early problem detection"
        ]
      }
    },
    {
      id: "net-metering",
      title: "Net Metering in Pakistan",
      icon: <Gauge className="h-6 w-6" />,
      shortDescription: "Sell excess power back to the grid",
      content: {
        title: "Net Metering Services in Pakistan",
        description: "Net metering allows you to sell excess solar power back to the grid, turning your solar system into a revenue generator. We handle the complete net metering process with DISCOs across Pakistan.",
        features: [
          "Complete net metering application process",
          "DISCO liaison and coordination",
          "Documentation preparation and submission",
          "Technical requirements compliance",
          "Meter installation coordination",
          "Agreement facilitation",
          "Post-connection support",
          "Billing reconciliation assistance"
        ],
        process: [
          { step: "Application Submission", description: "Prepare and submit application to DISCO" },
          { step: "Technical Review", description: "DISCO reviews system specifications" },
          { step: "Site Inspection", description: "DISCO inspects installation site" },
          { step: "Agreement Signing", description: "Sign net metering agreement" },
          { step: "Meter Installation", description: "Bi-directional meter installation" },
          { step: "Connection", description: "System connection and testing" }
        ],
        discosCovered: [
          "LESCO (Lahore Electric Supply Company)",
          "K-Electric (Karachi)",
          "IESCO (Islamabad Electric Supply Company)",
          "FESCO (Faisalabad Electric Supply Company)",
          "MEPCO (Multan Electric Power Company)",
          "GEPCO (Gujranwala Electric Power Company)",
          "PESCO (Peshawar Electric Supply Company)",
          "QESCO (Quetta Electric Supply Company)"
        ],
        benefits: [
          "Earn from excess energy production",
          "Reduce electricity bills to zero",
          "Contribute to national grid",
          "Increase property value",
          "Support green energy transition"
        ]
      }
    },
    {
      id: "energy-audit",
      title: "Energy Audit",
      icon: <ClipboardCheck className="h-6 w-6" />,
      shortDescription: "Comprehensive analysis of your energy consumption",
      content: {
        title: "Energy Audit Services",
        description: "Our detailed energy audits help you understand your current energy usage patterns and identify opportunities for optimization. We provide actionable recommendations to reduce costs and improve efficiency before and after solar installation.",
        features: [
          "Complete energy consumption analysis",
          "Load profiling and peak demand assessment",
          "Equipment efficiency evaluation",
          "Power quality analysis",
          "Energy wastage identification",
          "Cost-benefit analysis",
          "Customized energy saving recommendations",
          "Post-audit implementation support"
        ],
        auditProcess: [
          { step: "Initial Consultation", description: "Understanding your energy concerns and goals" },
          { step: "Data Collection", description: "Gathering utility bills and consumption history" },
          { step: "On-site Inspection", description: "Detailed examination of electrical systems and equipment" },
          { step: "Analysis & Calculations", description: "Processing data to identify inefficiencies" },
          { step: "Report Generation", description: "Comprehensive report with findings and recommendations" },
          { step: "Implementation Planning", description: "Roadmap for energy efficiency improvements" }
        ],
        auditTypes: [
          {
            name: "Basic Energy Audit",
            description: "Walk-through assessment with immediate recommendations",
            duration: "2-4 hours",
            ideal: "Small homes and offices"
          },
          {
            name: "Detailed Energy Audit",
            description: "Comprehensive analysis with monitoring and detailed report",
            duration: "1-2 days",
            ideal: "Commercial buildings and large homes"
          },
          {
            name: "Investment Grade Audit",
            description: "In-depth analysis with financial modeling and ROI calculations",
            duration: "3-5 days",
            ideal: "Industrial facilities and large commercial properties"
          }
        ],
        benefits: [
          "Reduce energy bills by 20-40%",
          "Identify hidden energy wastage",
          "Optimize solar system sizing",
          "Improve equipment lifespan",
          "Enhance comfort and productivity",
          "Support sustainability goals"
        ]
      }
    }
  ];

  const renderContent = () => {
    if (!selectedService) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card 
              key={service.id}
              className="cursor-pointer transition-all bg-white hover:bg-green-50 hover:shadow-lg"
              onClick={() => setSelectedService(service.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {service.icon}
                  </div>
                  <span className="text-lg">{service.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{service.shortDescription}</p>
                <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const service = services.find(s => s.id === selectedService);
    if (!service) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedService(null)}
          className="mb-6"
        >
          ← Back to Services
        </Button>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-white/20 rounded-lg">
                {service.icon}
              </div>
              {service.content.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 mb-6">{service.content.description}</p>
            
            {service.content.features && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Key Features
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {service.content.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.process && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Our Process
                </h3>
                <div className="space-y-3">
                  {service.content.process.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.step}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.installationTypes && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Installation Types</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {service.content.installationTypes.map((type, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">{type.type}</h4>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.maintenancePackages && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Maintenance Packages
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {service.content.maintenancePackages.map((pkg, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <p className="text-sm text-gray-600">{pkg.frequency}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {pkg.includes.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.cleaningProcess && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Cleaning Process</h3>
                <div className="space-y-2">
                  {service.content.cleaningProcess.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.discosCovered && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  DISCOs We Work With
                </h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {service.content.discosCovered.map((disco, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{disco}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.auditProcess && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Audit Process
                </h3>
                <div className="space-y-3">
                  {service.content.auditProcess.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.step}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.auditTypes && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Audit Types Available</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {service.content.auditTypes.map((type, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                        <p className="text-sm text-gray-600">{type.duration}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-600 italic">Ideal for: {type.ideal}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {service.content.benefits && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Benefits</h3>
                <div className="bg-green-50 p-6 rounded-lg">
                  <ul className="space-y-2">
                    {service.content.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Ready to Get Started?</h3>
              <p className="text-gray-700 mb-4">
                Contact our experts today for a free consultation and quote for {service.title.toLowerCase()}.
              </p>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Free Consultation
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Services</h1>
          <p className="text-xl">Comprehensive solar energy services from consultation to maintenance - your complete solar solution partner</p>
        </div>
        
        {/* Service Tools Decoration - Services Page */}
        <div className="absolute right-0 bottom-0 flex items-end gap-4 opacity-20">
          {/* Wrench Icon */}
          <svg className="w-16 h-16" viewBox="0 0 100 100" fill="white">
            <path d="M75 25 L60 40 L40 20 L20 40 L35 55 L50 40 L65 55 L80 40 Z" fill="none" stroke="white" strokeWidth="3"/>
            <rect x="35" y="50" width="10" height="30" fill="white"/>
            <circle cx="40" cy="85" r="5" fill="white"/>
          </svg>
          
          {/* Gear Icon */}
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="white">
            <path d="M50 30 L55 35 L60 30 L65 35 L60 40 L65 45 L60 50 L65 55 L60 60 L65 65 L60 70 L55 65 L50 70 L45 65 L40 70 L35 65 L40 60 L35 55 L40 50 L35 45 L40 40 L35 35 L40 30 L45 35 L50 30 Z" fill="white"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="3"/>
          </svg>
          
          {/* Lightning Bolt */}
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="white">
            <path d="M60 10 L30 50 L45 50 L40 90 L70 40 L55 40 Z" fill="white"/>
          </svg>
          
          {/* Tool Box */}
          <svg className="w-28 h-28 mr-8" viewBox="0 0 100 100" fill="white">
            <rect x="20" y="40" width="60" height="40" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="35" y="30" width="30" height="15" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="20" y1="55" x2="80" y2="55" stroke="white" strokeWidth="2"/>
            <rect x="45" y="60" width="10" height="15" fill="white"/>
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
        
        {/* Service Request Form Section */}
        {!selectedService && (
          <div className="mt-16 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 py-16 px-8 rounded-2xl shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Request a Custom Service</h2>
                <p className="text-lg text-blue-100">
                  Can't find what you're looking for? Submit a custom service request and our experts will get back to you.
                </p>
              </div>
            
              {!showRequestForm ? (
                <div className="text-center">
                  <Button 
                    onClick={() => setShowRequestForm(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Request Custom Service
                  </Button>
                </div>
              ) : (
                <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <i className="fas fa-clipboard-list text-blue-600"></i>
                      Custom Service Request Form
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createServiceMutation.mutate(data))} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter service name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="installation">Installation</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="repair">Repair</SelectItem>
                                  <SelectItem value="energy-audit">Energy Audit</SelectItem>
                                  <SelectItem value="net-metering">Net Metering</SelectItem>
                                  <SelectItem value="custom">Custom Service</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the service you need in detail..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Price (PKR)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 50000" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2-3 days, 1 week" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requirements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special requirements or preferences..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-4">
                        <Button 
                          type="submit" 
                          disabled={createServiceMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createServiceMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane mr-2"></i>
                              Submit Request
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setShowRequestForm(false);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ContactSection />
      <Footer />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Service Request Submitted!"
        message="Your custom service request has been successfully submitted. Our team will review it and contact you soon."
      />
    </div>
  );
}