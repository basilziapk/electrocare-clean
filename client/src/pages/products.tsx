import { useState } from "react";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import ContactSection from "@/components/ContactSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MonocrystallinePanelSVG, PolycrystallinePanelSVG, BifacialPanelSVG, GenericSolarPanelSVG } from "@/components/solar-panel-images";

interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  price?: string;
  image?: string;
  specifications?: Record<string, string>;
  warranty?: string;
  certifications?: string[];
}

interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  products: Product[];
}

const productCategories: ProductCategory[] = [
  {
    id: "solar-panels",
    title: "Solar Panels",
    description: "High-efficiency solar panels for residential and commercial use",
    icon: "fas fa-solar-panel",
    products: [
      {
        id: "panel-1",
        name: "Monocrystalline 550W Panel",
        description: "Premium efficiency solar panel with 25-year warranty",
        features: [
          "550W power output",
          "21.5% efficiency",
          "Monocrystalline silicon cells",
          "Weather resistant",
          "25-year performance warranty"
        ],
        price: "Rs. 28,000",
        specifications: {
          "Power Output": "550W",
          "Module Efficiency": "21.5%",
          "Cell Type": "Monocrystalline Silicon",
          "Dimensions": "2279 x 1134 x 35mm",
          "Weight": "28.9 kg",
          "Voltage (Vmp)": "41.7V",
          "Current (Imp)": "13.20A",
          "Temperature Coefficient": "-0.35%/°C",
          "Operating Temperature": "-40°C to +85°C",
          "Frame Material": "Anodized Aluminum Alloy",
          "Glass": "3.2mm Tempered Glass"
        },
        warranty: "25 years linear power warranty, 12 years product warranty",
        certifications: ["IEC 61215", "IEC 61730", "ISO 9001:2015", "CE Marked"]
      },
      {
        id: "panel-2",
        name: "Polycrystalline 450W Panel",
        description: "Cost-effective solar panel for budget-conscious customers",
        features: [
          "450W power output",
          "18% efficiency",
          "Polycrystalline silicon cells",
          "Durable aluminum frame",
          "20-year warranty"
        ],
        price: "Rs. 22,000",
        specifications: {
          "Power Output": "450W",
          "Module Efficiency": "18%",
          "Cell Type": "Polycrystalline Silicon",
          "Dimensions": "2108 x 1048 x 35mm",
          "Weight": "25.5 kg",
          "Voltage (Vmp)": "37.2V",
          "Current (Imp)": "12.10A",
          "Temperature Coefficient": "-0.39%/°C",
          "Operating Temperature": "-40°C to +85°C",
          "Frame Material": "Anodized Aluminum Frame",
          "Glass": "3.2mm High Transmission Glass"
        },
        warranty: "20 years linear power warranty, 10 years product warranty",
        certifications: ["IEC 61215", "IEC 61730", "ISO 9001:2015"]
      },
      {
        id: "panel-3",
        name: "Bifacial 600W Panel",
        description: "Advanced double-sided solar panel for maximum energy harvest",
        features: [
          "600W power output",
          "22% efficiency",
          "Bifacial technology",
          "Generates power from both sides",
          "30-year warranty"
        ],
        price: "Rs. 35,000",
        specifications: {
          "Power Output": "600W (front) + up to 30% from rear",
          "Module Efficiency": "22%",
          "Cell Type": "N-Type Bifacial Monocrystalline",
          "Dimensions": "2384 x 1134 x 30mm",
          "Weight": "32.0 kg",
          "Voltage (Vmp)": "45.5V",
          "Current (Imp)": "13.19A",
          "Bifacial Factor": "70-85%",
          "Temperature Coefficient": "-0.30%/°C",
          "Operating Temperature": "-40°C to +85°C",
          "Frame Material": "Double Glass, Frameless Design",
          "Glass": "2mm + 2mm Dual Glass"
        },
        warranty: "30 years linear power warranty, 15 years product warranty",
        certifications: ["IEC 61215", "IEC 61730", "UL 1703", "ISO 9001:2015", "CE Marked"]
      }
    ]
  },
  {
    id: "solar-inverters",
    title: "Solar Inverters",
    description: "Reliable inverters to convert DC power to AC for your home",
    icon: "fas fa-bolt",
    products: [
      {
        id: "inv-1",
        name: "5kW Hybrid Inverter",
        description: "Smart hybrid inverter with battery support",
        features: [
          "5000W continuous power",
          "MPPT charge controller",
          "Battery compatible",
          "WiFi monitoring",
          "5-year warranty"
        ],
        price: "Rs. 85,000",
        specifications: {
          "Rated Power": "5000W",
          "Max PV Input": "6500W",
          "MPPT Range": "120V - 450V",
          "Max Input Current": "22A",
          "Output Voltage": "220V/230V AC",
          "Frequency": "50Hz/60Hz",
          "Efficiency": "97.6%",
          "Battery Voltage": "48V",
          "Charging Current": "120A",
          "Dimensions": "460 x 395 x 165mm",
          "Weight": "28kg"
        },
        warranty: "5 years standard warranty, extendable to 10 years",
        certifications: ["CE", "IEC 62040", "EN 61000"]
      },
      {
        id: "inv-2",
        name: "10kW On-Grid Inverter",
        description: "Grid-tie inverter for net metering",
        features: [
          "10,000W power output",
          "98.5% efficiency",
          "Dual MPPT",
          "Remote monitoring",
          "10-year warranty"
        ],
        price: "Rs. 145,000"
      },
      {
        id: "inv-3",
        name: "3kW Off-Grid Inverter",
        description: "Standalone inverter for remote locations",
        features: [
          "3000W pure sine wave",
          "Built-in charge controller",
          "Battery management system",
          "LCD display",
          "3-year warranty"
        ],
        price: "Rs. 55,000"
      }
    ]
  },
  {
    id: "solar-batteries",
    title: "Solar Batteries",
    description: "Energy storage solutions for uninterrupted power supply",
    icon: "fas fa-battery-full",
    products: [
      {
        id: "bat-1",
        name: "Lithium Battery 5kWh",
        description: "High-performance lithium battery for solar storage",
        features: [
          "5000Wh capacity",
          "6000+ cycles",
          "95% depth of discharge",
          "Smart BMS",
          "10-year warranty"
        ],
        price: "Rs. 125,000",
        specifications: {
          "Capacity": "5000Wh / 5kWh",
          "Voltage": "51.2V",
          "Usable Capacity": "4750Wh (95% DoD)",
          "Battery Type": "LiFePO4 (Lithium Iron Phosphate)",
          "Life Cycles": "6000+ cycles @ 80% DoD",
          "Charge Rate": "0.5C standard, 1C max",
          "Discharge Rate": "1C continuous, 2C peak",
          "Operating Temperature": "-10°C to +50°C",
          "BMS Features": "Overcharge/discharge protection, Temperature monitoring",
          "Communication": "RS485, CAN Bus",
          "Dimensions": "442 x 420 x 133mm",
          "Weight": "45kg"
        },
        warranty: "10 years or 6000 cycles warranty",
        certifications: ["UN38.3", "CE", "IEC 62619", "UL 1973"]
      },
      {
        id: "bat-2",
        name: "Tubular Battery 200Ah",
        description: "Deep cycle tubular battery for reliable backup",
        features: [
          "200Ah @ 12V",
          "1500+ cycles",
          "Low maintenance",
          "Robust design",
          "5-year warranty"
        ],
        price: "Rs. 28,000"
      },
      {
        id: "bat-3",
        name: "Gel Battery 150Ah",
        description: "Maintenance-free gel battery",
        features: [
          "150Ah @ 12V",
          "1200+ cycles",
          "Zero maintenance",
          "Spill-proof design",
          "3-year warranty"
        ],
        price: "Rs. 35,000"
      }
    ]
  },
  {
    id: "solar-water-heaters",
    title: "Solar Water Heaters",
    description: "Eco-friendly water heating solutions",
    icon: "fas fa-tint",
    products: [
      {
        id: "heater-1",
        name: "100L Solar Water Heater",
        description: "Compact solar water heater for small families",
        features: [
          "100 liters capacity",
          "Evacuated tube technology",
          "Stainless steel tank",
          "Electric backup",
          "7-year warranty"
        ],
        price: "Rs. 45,000",
        specifications: {
          "Capacity": "100 Liters",
          "Collector Type": "Evacuated Tube Collector",
          "Number of Tubes": "10 tubes",
          "Tank Material": "SS304 Stainless Steel",
          "Insulation": "50mm PUF Insulation",
          "Working Pressure": "6 bar",
          "Temperature Range": "Up to 85°C",
          "Backup Heater": "2kW Electric Element",
          "Suitable For": "2-3 people",
          "Installation Type": "Roof Mounted",
          "Dimensions": "1200 x 800 x 400mm"
        },
        warranty: "7 years on collector, 3 years on tank",
        certifications: ["ISO 9001:2015", "BIS Standards"]
      },
      {
        id: "heater-2",
        name: "200L Solar Water Heater",
        description: "Medium capacity for larger families",
        features: [
          "200 liters capacity",
          "High-efficiency collectors",
          "Insulated storage tank",
          "Temperature display",
          "10-year warranty"
        ],
        price: "Rs. 65,000"
      },
      {
        id: "heater-3",
        name: "300L Commercial Heater",
        description: "Large capacity for commercial use",
        features: [
          "300 liters capacity",
          "Industrial grade",
          "Pressurized system",
          "Digital controller",
          "5-year warranty"
        ],
        price: "Rs. 95,000"
      }
    ]
  },
  {
    id: "solar-street-lights",
    title: "Solar Street Lights",
    description: "Autonomous outdoor lighting solutions",
    icon: "fas fa-lightbulb",
    products: [
      {
        id: "light-1",
        name: "30W Solar Street Light",
        description: "Compact street light for pathways",
        features: [
          "30W LED lamp",
          "Dusk to dawn operation",
          "Motion sensor",
          "3 rainy days backup",
          "3-year warranty"
        ],
        price: "Rs. 15,000",
        specifications: {
          "LED Power": "30W",
          "Luminous Flux": "3600 Lumens",
          "Solar Panel": "50W Monocrystalline",
          "Battery": "12.8V 20Ah LiFePO4",
          "Charging Time": "6-8 hours",
          "Working Time": "12+ hours",
          "PIR Sensor Range": "8-10 meters",
          "Color Temperature": "6500K (Cool White)",
          "Mounting Height": "3-5 meters",
          "IP Rating": "IP65 Waterproof",
          "Operating Temperature": "-20°C to +60°C"
        },
        warranty: "3 years complete warranty",
        certifications: ["CE", "RoHS", "IP65"]
      },
      {
        id: "light-2",
        name: "60W Solar Street Light",
        description: "Powerful street light for roads",
        features: [
          "60W LED lamp",
          "Smart control system",
          "Remote monitoring",
          "5 rainy days backup",
          "5-year warranty"
        ],
        price: "Rs. 25,000"
      },
      {
        id: "light-3",
        name: "100W Solar Flood Light",
        description: "High-power flood light for large areas",
        features: [
          "100W LED flood light",
          "Wide beam angle",
          "IP65 waterproof",
          "Timer function",
          "3-year warranty"
        ],
        price: "Rs. 35,000"
      }
    ]
  },
  {
    id: "solar-charge-controller",
    title: "Solar Charge Controllers",
    description: "Protect your batteries with intelligent charge control",
    icon: "fas fa-microchip",
    products: [
      {
        id: "controller-1",
        name: "30A PWM Controller",
        description: "Basic charge controller for small systems",
        features: [
          "30A charging current",
          "PWM technology",
          "LCD display",
          "Overcharge protection",
          "2-year warranty"
        ],
        price: "Rs. 3,500"
      },
      {
        id: "controller-2",
        name: "40A MPPT Controller",
        description: "Advanced MPPT controller for efficiency",
        features: [
          "40A charging current",
          "MPPT technology",
          "99% efficiency",
          "Bluetooth monitoring",
          "3-year warranty"
        ],
        price: "Rs. 12,000"
      },
      {
        id: "controller-3",
        name: "60A MPPT Smart Controller",
        description: "Professional grade controller",
        features: [
          "60A charging current",
          "Smart MPPT algorithm",
          "WiFi connectivity",
          "Data logging",
          "5-year warranty"
        ],
        price: "Rs. 18,000"
      }
    ]
  },
  {
    id: "dc-home-system",
    title: "DC Home Systems",
    description: "Complete DC power solutions for homes",
    icon: "fas fa-home",
    products: [
      {
        id: "dc-1",
        name: "Basic DC Home Kit",
        description: "Entry-level DC system for essential needs",
        features: [
          "2 LED bulbs",
          "1 DC fan",
          "USB charging port",
          "50W solar panel",
          "1-year warranty"
        ],
        price: "Rs. 15,000"
      },
      {
        id: "dc-2",
        name: "Standard DC Home System",
        description: "Complete DC solution for small homes",
        features: [
          "4 LED bulbs",
          "2 DC fans",
          "DC TV compatible",
          "100W solar panel",
          "2-year warranty"
        ],
        price: "Rs. 35,000"
      },
      {
        id: "dc-3",
        name: "Premium DC Power System",
        description: "Advanced DC system with inverter",
        features: [
          "6 LED bulbs",
          "3 DC fans",
          "500W inverter included",
          "200W solar panel",
          "3-year warranty"
        ],
        price: "Rs. 65,000"
      }
    ]
  },
  {
    id: "solar-panel-price",
    title: "Solar Panel Packages",
    description: "Complete solar installation packages at competitive prices",
    icon: "fas fa-tag",
    products: [
      {
        id: "package-1",
        name: "3kW Residential Package",
        description: "Complete solar system for small homes",
        features: [
          "6 x 550W solar panels",
          "3kW hybrid inverter",
          "Mounting structure",
          "Installation included",
          "Net metering support"
        ],
        price: "Rs. 300,000",
        specifications: {
          "System Capacity": "3.3kW DC / 3kW AC",
          "Solar Panels": "6 x 550W Monocrystalline",
          "Total Panel Area": "14 sqm",
          "Inverter": "3kW Hybrid with MPPT",
          "Daily Generation": "12-15 kWh (average)",
          "Monthly Generation": "360-450 kWh",
          "Mounting": "Galvanized Iron Structure",
          "DC Cables": "4mm² Solar Cable",
          "AC Cables": "6mm² Copper Cable",
          "Protection": "DC/AC Surge Protectors",
          "Monitoring": "WiFi Based Remote Monitoring",
          "Payback Period": "3-4 years"
        },
        warranty: "25 years panels, 5 years inverter, 10 years structure",
        certifications: ["NEPRA Approved", "Net Metering Compatible"]
      },
      {
        id: "package-2",
        name: "5kW Standard Package",
        description: "Popular choice for average homes",
        features: [
          "10 x 550W solar panels",
          "5kW hybrid inverter",
          "Battery bank optional",
          "Professional installation",
          "25-year panel warranty"
        ],
        price: "Rs. 500,000"
      },
      {
        id: "package-3",
        name: "10kW Commercial Package",
        description: "Large system for businesses",
        features: [
          "20 x 550W solar panels",
          "10kW grid-tie inverter",
          "Commercial mounting",
          "Monitoring system",
          "Maintenance package"
        ],
        price: "Rs. 1,000,000"
      }
    ]
  }
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("solar-panels");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [detailsModal, setDetailsModal] = useState<Product | null>(null);

  const getProductImage = (productId: string, productName: string) => {
    if (productName.toLowerCase().includes("monocrystalline")) {
      return <MonocrystallinePanelSVG />;
    } else if (productName.toLowerCase().includes("polycrystalline")) {
      return <PolycrystallinePanelSVG />;
    } else if (productName.toLowerCase().includes("bifacial")) {
      return <BifacialPanelSVG />;
    } else if (selectedCategory === "solar-panels") {
      return <GenericSolarPanelSVG />;
    }
    return null;
  };

  const currentCategory = productCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Products</h1>
          <p className="text-xl">Premium quality solar products with warranty and support</p>
        </div>
        
        {/* Wind Mills Decoration - Only on Products Page */}
        <div className="absolute right-0 bottom-0 flex items-end gap-4 opacity-20">
          {/* Windmill 1 - Smallest */}
          <svg className="w-16 h-20" viewBox="0 0 100 120" fill="white">
            <rect x="47" y="60" width="6" height="60" fill="white"/>
            <g transform="translate(50, 60)">
              <path d="M0,0 L-3,-25 L0,-30 L3,-25 Z" fill="white" transform="rotate(0)"/>
              <path d="M0,0 L-3,-25 L0,-30 L3,-25 Z" fill="white" transform="rotate(120)"/>
              <path d="M0,0 L-3,-25 L0,-30 L3,-25 Z" fill="white" transform="rotate(240)"/>
              <circle cx="0" cy="0" r="3" fill="white"/>
            </g>
          </svg>
          
          {/* Windmill 2 */}
          <svg className="w-20 h-28" viewBox="0 0 100 140" fill="white">
            <rect x="47" y="60" width="6" height="80" fill="white"/>
            <g transform="translate(50, 60)">
              <path d="M0,0 L-3,-30 L0,-35 L3,-30 Z" fill="white" transform="rotate(45)"/>
              <path d="M0,0 L-3,-30 L0,-35 L3,-30 Z" fill="white" transform="rotate(165)"/>
              <path d="M0,0 L-3,-30 L0,-35 L3,-30 Z" fill="white" transform="rotate(285)"/>
              <circle cx="0" cy="0" r="3" fill="white"/>
            </g>
          </svg>
          
          {/* Windmill 3 */}
          <svg className="w-24 h-36" viewBox="0 0 100 160" fill="white">
            <rect x="47" y="60" width="6" height="100" fill="white"/>
            <g transform="translate(50, 60)">
              <path d="M0,0 L-3,-35 L0,-40 L3,-35 Z" fill="white" transform="rotate(90)"/>
              <path d="M0,0 L-3,-35 L0,-40 L3,-35 Z" fill="white" transform="rotate(210)"/>
              <path d="M0,0 L-3,-35 L0,-40 L3,-35 Z" fill="white" transform="rotate(330)"/>
              <circle cx="0" cy="0" r="3" fill="white"/>
            </g>
          </svg>
          
          {/* Windmill 4 - Tallest */}
          <svg className="w-28 h-44 mr-8" viewBox="0 0 100 180" fill="white">
            <rect x="47" y="60" width="6" height="120" fill="white"/>
            <g transform="translate(50, 60)">
              <path d="M0,0 L-3,-40 L0,-45 L3,-40 Z" fill="white" transform="rotate(135)"/>
              <path d="M0,0 L-3,-40 L0,-45 L3,-40 Z" fill="white" transform="rotate(255)"/>
              <path d="M0,0 L-3,-40 L0,-45 L3,-40 Z" fill="white" transform="rotate(15)"/>
              <circle cx="0" cy="0" r="3" fill="white"/>
            </g>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {productCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <i className={`${category.icon} w-5`}></i>
                        <span className="font-medium">{category.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Display */}
          <div className="lg:col-span-3">
            {currentCategory && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentCategory.products.map(product => (
                    <Card 
                      key={product.id} 
                      className="bg-white hover:bg-green-50 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    >
                      <CardHeader>
                        {selectedCategory === "solar-panels" && (
                          <div className="flex justify-between items-start mb-2">
                            <div className="h-24 w-24 bg-gray-50 rounded-lg p-2">
                              {getProductImage(product.id, product.name)}
                            </div>
                            {product.price && (
                              <div className="text-xl font-bold text-green-600">
                                {product.price}
                              </div>
                            )}
                          </div>
                        )}
                        {selectedCategory !== "solar-panels" && product.price && (
                          <div className="text-xl font-bold text-green-600 mb-2">
                            {product.price}
                          </div>
                        )}
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Key Specifications Grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {product.features.slice(0, 4).map((feature, index) => {
                              const featureLabels = ['Power', 'Efficiency', 'Technology', 'Durability'];
                              return (
                                <div key={index} className="bg-gray-50 p-2 rounded">
                                  <div className="text-gray-600 text-xs">{featureLabels[index] || `Feature ${index + 1}`}</div>
                                  <div className="font-semibold text-xs">{feature}</div>
                                </div>
                              );
                            })}
                          </div>

                          {expandedProduct === product.id && (
                            <div className="pt-3 border-t space-y-3">
                              {product.features.length > 4 && (
                                <div>
                                  <div className="text-sm font-semibold mb-2">Additional Features:</div>
                                  <div className="space-y-1">
                                    {product.features.slice(4).map((feature, index) => (
                                      <div key={index} className="flex items-start">
                                        <i className="fas fa-check text-green-500 text-xs mt-0.5 mr-2"></i>
                                        <span className="text-xs text-gray-700">{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {product.warranty && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-semibold">Warranty:</span> {product.warranty}
                                </div>
                              )}
                              
                              <div className="flex space-x-2 pt-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <i className="fas fa-shopping-cart mr-1 text-xs"></i>
                                  Get Quote
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailsModal(product);
                                  }}
                                >
                                  <i className="fas fa-info-circle mr-1 text-xs"></i>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailsModal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{detailsModal.name}</DialogTitle>
                <DialogDescription>{detailsModal.description}</DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                {/* Product Image */}
                {selectedCategory === "solar-panels" && (
                  <div className="h-64 bg-gray-50 rounded-lg p-6">
                    {getProductImage(detailsModal.id, detailsModal.name)}
                  </div>
                )}
                
                {/* Price */}
                {detailsModal.price && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Price</h3>
                    <p className="text-3xl font-bold text-blue-600">{detailsModal.price}</p>
                  </div>
                )}
                
                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailsModal.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Specifications */}
                {detailsModal.specifications && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(detailsModal.specifications).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-200 last:border-0">
                              <td className="py-2 pr-4 font-medium text-gray-600">{key}:</td>
                              <td className="py-2 text-gray-900">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Warranty */}
                {detailsModal.warranty && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Warranty</h3>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                      <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                      {detailsModal.warranty}
                    </p>
                  </div>
                )}
                
                {/* Certifications */}
                {detailsModal.certifications && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailsModal.certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-center pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setDetailsModal(null)}
                    className="px-12"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ContactSection />
      <Footer />
    </div>
  );
}