import { useState } from "react";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencySelector } from "@/components/CurrencySelector";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import ContactSection from "@/components/ContactSection";
import LoadCalculator from "@/components/load-calculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { generateQuotePDF } from "@/utils/generateQuotePDF";

export default function Calculator() {
  const { user } = useSimpleAuth();
  const isAuthenticated = !!user;
  const { formatCurrency, convertAmount } = useCurrency();
  const [showSolution, setShowSolution] = useState(false);
  const [totalLoad, setTotalLoad] = useState({ watts: 0, kw: 0 });
  const [result, setResult] = useState<{
    dailyConsumption: number;
    recommendedCapacity: number;
    estimatedCost: number;
    panels: number;
    batteries: number;
    inverterSize: number;
  } | null>(null);

  const handleCalculate = (totalWatts: number, totalKW: number) => {
    setTotalLoad({ watts: totalWatts, kw: totalKW });
    
    // Calculate solar system requirements
    const dailyUsageHours = 8; // Average daily usage
    const sunHours = 5; // Average sun hours in Pakistan
    const systemEfficiency = 0.85; // System efficiency factor
    
    const dailyConsumption = (totalKW * dailyUsageHours); // kWh per day
    const recommendedCapacity = Math.ceil((dailyConsumption / sunHours) / systemEfficiency); // kW system needed
    const panels = Math.ceil(recommendedCapacity * 1000 / 550); // Assuming 550W panels
    const batteries = Math.ceil(dailyConsumption / 2.4); // Assuming 2.4kWh batteries
    const inverterSize = Math.ceil(totalKW * 1.25); // 25% overhead for inverter
    const estimatedCost = recommendedCapacity * 100000; // Rs. 100,000 per kW (rough estimate)
    
    setResult({
      dailyConsumption,
      recommendedCapacity,
      estimatedCost,
      panels,
      batteries,
      inverterSize
    });
    
    setShowSolution(true);
    // Scroll to top when showing solution
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Energy Load Calculator</h1>
            <p className="text-xl">Calculate your energy needs based on your appliance usage</p>
          </div>
        </div>
        
        {/* Calculator Icons - Calculator Page */}
        <div className="absolute right-0 bottom-0 flex items-end gap-4 opacity-20">
          {/* Calculator Icon */}
          <svg className="w-16 h-20" viewBox="0 0 100 120" fill="white">
            <rect x="25" y="20" width="50" height="80" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="30" y="30" width="40" height="15" fill="white"/>
            <rect x="30" y="50" width="8" height="8" fill="white"/>
            <rect x="42" y="50" width="8" height="8" fill="white"/>
            <rect x="54" y="50" width="8" height="8" fill="white"/>
            <rect x="30" y="62" width="8" height="8" fill="white"/>
            <rect x="42" y="62" width="8" height="8" fill="white"/>
            <rect x="54" y="62" width="8" height="8" fill="white"/>
            <rect x="30" y="74" width="8" height="8" fill="white"/>
            <rect x="42" y="74" width="8" height="8" fill="white"/>
            <rect x="54" y="74" width="8" height="8" fill="white"/>
          </svg>
          
          {/* Graph Icon */}
          <svg className="w-20 h-24" viewBox="0 0 100 120" fill="white">
            <line x1="20" y1="80" x2="80" y2="80" stroke="white" strokeWidth="2"/>
            <line x1="20" y1="20" x2="20" y2="80" stroke="white" strokeWidth="2"/>
            <rect x="30" y="60" width="10" height="20" fill="white"/>
            <rect x="45" y="40" width="10" height="40" fill="white"/>
            <rect x="60" y="50" width="10" height="30" fill="white"/>
          </svg>
          
          {/* Lightning/Energy Icon */}
          <svg className="w-24 h-28" viewBox="0 0 100 140" fill="white">
            <path d="M60 20 L30 70 L45 70 L40 120 L70 50 L55 50 Z" fill="white"/>
          </svg>
          
          {/* Plus/Equals Signs */}
          <svg className="w-28 h-32 mr-8" viewBox="0 0 100 160" fill="white">
            <text x="20" y="40" fontSize="30" fill="white">+</text>
            <text x="50" y="40" fontSize="30" fill="white">=</text>
            <text x="20" y="80" fontSize="30" fill="white">×</text>
            <text x="50" y="80" fontSize="30" fill="white">÷</text>
            <text x="35" y="120" fontSize="30" fill="white">%</text>
          </svg>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showSolution ? (
          <>
            <LoadCalculator onCalculate={handleCalculate} />
          </>
        ) : (
          <>
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSolution(false);
                  setResult(null);
                }}
                className="mb-4"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Calculator
              </Button>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Solar Solution</h2>
              <p className="text-lg text-gray-600">Based on your {totalLoad.kw.toFixed(2)} kW load requirement</p>
            </div>

            {result && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-white hover:bg-green-50 transition-all">
                    <CardHeader className="bg-blue-600 text-white">
                      <CardTitle className="flex items-center">
                        <i className="fas fa-solar-panel mr-2"></i>
                        System Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Consumption:</span>
                          <span className="font-bold">{result.dailyConsumption.toFixed(1)} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">System Size:</span>
                          <span className="font-bold text-blue-600">{result.recommendedCapacity} kW</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Solar Panels (550W):</span>
                          <span className="font-bold">{result.panels} panels</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inverter Size:</span>
                          <span className="font-bold">{result.inverterSize} kW</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batteries (2.4kWh):</span>
                          <span className="font-bold">{result.batteries} units</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white hover:bg-green-50 transition-all">
                    <CardHeader className="bg-green-600 text-white">
                      <CardTitle className="flex items-center">
                        <i className="fas fa-leaf mr-2"></i>
                        Environmental Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">CO₂ Saved/Year:</span>
                          <span className="font-bold text-green-600">{(result.recommendedCapacity * 1.2).toFixed(1)} tons</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trees Equivalent:</span>
                          <span className="font-bold">{Math.round(result.recommendedCapacity * 30)} trees</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">25-Year Savings:</span>
                          <span className="font-bold">{(result.recommendedCapacity * 30).toFixed(0)} tons</span>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="text-sm text-gray-600">Carbon Footprint:</div>
                          <div className="text-lg font-bold text-green-600">
                            {Math.min(95, Math.round((result.recommendedCapacity / totalLoad.kw) * 100))}% Reduced
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white hover:bg-green-50 transition-all">
                    <CardHeader className="bg-orange-600 text-white">
                      <CardTitle className="flex items-center">
                        <i className="fas fa-rupee-sign mr-2"></i>
                        Cost Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">System Cost:</span>
                          <span className="font-bold">{formatCurrency(convertAmount(result.estimatedCost))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Installation:</span>
                          <span className="font-bold">{formatCurrency(convertAmount(Math.round(result.estimatedCost * 0.15)))}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Total Investment:</span>
                          <span className="font-bold text-orange-600">
                            {formatCurrency(convertAmount(Math.round(result.estimatedCost * 1.15)))}
                          </span>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <div className="text-xs text-gray-600">Payback Period:</div>
                          <div className="text-lg font-bold text-orange-600">~4-5 Years</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white hover:bg-green-50 transition-all mb-8">
                  <CardHeader>
                    <CardTitle>System Package Includes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-600">
                          <i className="fas fa-check-circle mr-2"></i>
                          Equipment
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>Tier-1 Solar Panels (550W each)</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>MPPT Solar Inverter</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>Lithium/Tubular Batteries</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>Mounting Structure & Cables</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 text-green-600">
                          <i className="fas fa-shield-alt mr-2"></i>
                          Services & Warranty
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>25-year Panel Performance Warranty</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>5-year Inverter Warranty</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>Professional Installation</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check text-green-500 mt-0.5 mr-2"></i>
                            <span>Annual Maintenance (5 years)</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Note:</strong> This is an estimate based on average consumption patterns. 
                        Actual requirements may vary based on location, usage patterns, and specific requirements.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                      {isAuthenticated ? (
                        <>
                          <Link href="/new-installation">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                              <i className="fas fa-shopping-cart mr-2"></i>
                              Request Installation
                            </Button>
                          </Link>
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => {
                              if (result) {
                                generateQuotePDF({ 
                                  totalLoad: totalLoad.watts,
                                  systemSize: result.recommendedCapacity,
                                  panelQuantity: result.panels,
                                  inverterSize: result.inverterSize,
                                  batteryCapacity: result.batteries * 2.4, // Convert number of batteries to kWh
                                  totalCost: result.estimatedCost,
                                  result: {
                                    ...result,
                                    systemSize: result.recommendedCapacity,
                                    panelsRequired: result.panels,
                                    batteryCapacity: result.batteries * 2.4
                                  }, 
                                  customerName: user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email : undefined,
                                  customerEmail: user ? (user as any).email : undefined
                                });
                              }
                            }}
                          >
                            <i className="fas fa-download mr-2"></i>
                            Download Quote PDF
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="lg" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.location.href = '/'}
                        >
                          <i className="fas fa-sign-in-alt mr-2"></i>
                          Login to Get Quote
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                        ROI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Savings:</span>
                          <span className="font-bold">Rs. {Math.round(result.estimatedCost * 0.02).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Savings:</span>
                          <span className="font-bold">Rs. {Math.round(result.estimatedCost * 0.24).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">25-Year Savings:</span>
                          <span className="font-bold text-green-600">Rs. {Math.round(result.estimatedCost * 6).toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-xs text-gray-600">Return on Investment:</div>
                          <div className="text-2xl font-bold text-green-600">520%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <i className="fas fa-info-circle mr-2 text-orange-600"></i>
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-600">1</span>
                          </div>
                          <p className="ml-3 text-sm text-gray-600">Site survey & technical assessment</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-600">2</span>
                          </div>
                          <p className="ml-3 text-sm text-gray-600">Customized system design</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-600">3</span>
                          </div>
                          <p className="ml-3 text-sm text-gray-600">Installation & commissioning</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-600">4</span>
                          </div>
                          <p className="ml-3 text-sm text-gray-600">Net metering setup</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ContactSection />
      <Footer />
    </div>
  );
}