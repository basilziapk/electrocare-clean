import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function NewInstallation() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Form state
  const [panelQuantity, setPanelQuantity] = useState(1);
  const [standType, setStandType] = useState("");
  const [standardStandLevel, setStandardStandLevel] = useState("L2");
  const [inverterCompany, setInverterCompany] = useState("");
  const [inverterCapacity, setInverterCapacity] = useState("");
  const [inverterCategory, setInverterCategory] = useState("");
  const [inverterModel, setInverterModel] = useState("");
  const [batteryType, setBatteryType] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [priceDetails, setPriceDetails] = useState<any>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/installations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      toast({
        title: "Success",
        description: "Installation request submitted successfully!",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculatePrice = () => {
    if (!standType || !inverterCompany || !inverterCapacity || !inverterCategory || !inverterModel || !batteryType) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Calculate stand price
    let standPricePerPanel = standType === 'custom' ? 1200 : 1000;
    const standTypeName = standType === 'custom' 
      ? 'Custom Stand Structure' 
      : `Standard Stand Structure (${standardStandLevel})`;
    const totalStandPrice = panelQuantity * standPricePerPanel;

    // Calculate inverter price
    let inverterPrice = 0;
    const inverterDescription = `${inverterModel} ${inverterCapacity}Kw ${inverterCategory} Inverter`;

    if (inverterModel === 'IP21') {
      switch(inverterCapacity) {
        case '4': inverterPrice = 5000; break;
        case '6': inverterPrice = 8000; break;
        case '8': inverterPrice = 14000; break;
        case '11': inverterPrice = 18000; break;
        default: inverterPrice = 0;
      }
    } else if (inverterModel === 'IP65' || inverterModel === 'IP66') {
      switch(inverterCapacity) {
        case '6': inverterPrice = 12000; break;
        case '8': inverterPrice = 16000; break;
        case '12': inverterPrice = 21000; break;
        default: inverterPrice = 0;
      }
    } else if (inverterModel === 'Non') {
      inverterPrice = 4000;
    }

    // Battery prices
    let batteryPrice = 0;
    let batteryName = 'No Battery';
    
    switch(batteryType) {
      case 'lithium': 
        batteryPrice = 2000; 
        batteryName = 'Lithium Battery';
        break;
      case 'tubular': 
        batteryPrice = 0; 
        batteryName = 'Tubular Battery';
        break;
      case 'truck': 
        batteryPrice = 0; 
        batteryName = 'Truck Battery';
        break;
      case 'none': 
        batteryPrice = 0; 
        batteryName = 'No Battery';
        break;
    }

    const totalPrice = totalStandPrice + inverterPrice + batteryPrice;

    setPriceDetails({
      panelQuantity,
      standTypeName,
      totalStandPrice,
      inverterDescription,
      inverterCompany,
      inverterPrice,
      batteryName,
      batteryPrice,
      totalPrice,
      // Store all form data for submission
      formData: {
        panelQuantity,
        standType,
        standardStandLevel: standType === 'standard' ? standardStandLevel : null,
        inverterCompany,
        inverterCapacity,
        inverterCategory,
        inverterModel,
        batteryType,
        totalPrice,
      }
    });
    
    setShowResult(true);
  };

  const handleSubmit = () => {
    if (priceDetails && priceDetails.formData) {
      saveMutation.mutate(priceDetails.formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">New Solar System Installation</h1>
          <p className="text-xl">Configure your custom solar energy system</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-2xl text-center text-gray-800">System Configuration</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Panel Quantity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="panelQuantity" className="text-lg font-semibold mb-3 block">
                  1. Select Number of Solar Panels
                </Label>
                <Input
                  id="panelQuantity"
                  type="number"
                  min="1"
                  value={panelQuantity}
                  onChange={(e) => setPanelQuantity(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>

              {/* Stand Structure */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="standType" className="text-lg font-semibold mb-3 block">
                  2. Select Stand Structure Type
                </Label>
                <Select value={standType} onValueChange={setStandType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Stand Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Customize Stand Structure (Rs. 1200 per panel)</SelectItem>
                    <SelectItem value="standard">Standard Stand Structure (Rs. 1000 per panel)</SelectItem>
                  </SelectContent>
                </Select>
                
                {standType === 'standard' && (
                  <div className="mt-4">
                    <Label htmlFor="standardStandLevel">Select Standard Stand Level</Label>
                    <Select value={standardStandLevel} onValueChange={setStandardStandLevel}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L2">L2 Stand</SelectItem>
                        <SelectItem value="L3">L3 Stand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Inverter Company */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="inverterCompany" className="text-lg font-semibold mb-3 block">
                  3. Select Inverter Company Name
                </Label>
                <Select value={inverterCompany} onValueChange={setInverterCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Company --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fronius">Fronius</SelectItem>
                    <SelectItem value="greentech">GreenTech</SelectItem>
                    <SelectItem value="huawei">Huawei</SelectItem>
                    <SelectItem value="goodwe">GoodWe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inverter Capacity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="inverterCapacity" className="text-lg font-semibold mb-3 block">
                  4. Select Inverter Capacity
                </Label>
                <Select value={inverterCapacity} onValueChange={setInverterCapacity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Capacity --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3Kw</SelectItem>
                    <SelectItem value="4">4Kw</SelectItem>
                    <SelectItem value="6">6Kw</SelectItem>
                    <SelectItem value="8">8Kw</SelectItem>
                    <SelectItem value="10">10Kw</SelectItem>
                    <SelectItem value="11">11Kw</SelectItem>
                    <SelectItem value="12">12Kw</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inverter Type */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="inverterCategory" className="text-lg font-semibold mb-3 block">
                  5. Select Inverter Type
                </Label>
                <Select value={inverterCategory} onValueChange={setInverterCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">Hybrid Inverter</SelectItem>
                    <SelectItem value="on-grid">ON-Grid Inverter</SelectItem>
                    <SelectItem value="off-grid">OFF-Grid (Local Inverter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inverter Model */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="inverterModel" className="text-lg font-semibold mb-3 block">
                  6. Select Inverter Model Number
                </Label>
                <Select value={inverterModel} onValueChange={setInverterModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Model --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IP21">IP21</SelectItem>
                    <SelectItem value="IP65">IP65</SelectItem>
                    <SelectItem value="IP66">IP66</SelectItem>
                    <SelectItem value="Non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Battery Type */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="batteryType" className="text-lg font-semibold mb-3 block">
                  7. Select Battery Type
                </Label>
                <Select value={batteryType} onValueChange={setBatteryType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Battery --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lithium">Lithium Battery</SelectItem>
                    <SelectItem value="tubular">Tubular Battery</SelectItem>
                    <SelectItem value="truck">Truck Battery</SelectItem>
                    <SelectItem value="none">No Battery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculatePrice} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Calculate Total Price
              </Button>

              {/* Price Result */}
              {showResult && priceDetails && (
                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardHeader className="bg-blue-100">
                    <CardTitle className="text-xl">Total Installation Price</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-300">
                        <span>{priceDetails.panelQuantity} Solar Panels with {priceDetails.standTypeName}</span>
                        <span className="font-semibold">Rs. {priceDetails.totalStandPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-300">
                        <span>{priceDetails.inverterDescription} ({priceDetails.inverterCompany})</span>
                        <span className="font-semibold">Rs. {priceDetails.inverterPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-300">
                        <span>{priceDetails.batteryName}</span>
                        <span className="font-semibold">Rs. {priceDetails.batteryPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 text-xl font-bold text-blue-800 border-t-2 border-blue-400">
                        <span>Total Amount</span>
                        <span>Rs. {priceDetails.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="font-semibold text-yellow-800 mb-2">Note:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 45 feet wire installation from Solar Panels to inverter included</li>
                        <li>• 10 feet wire installation from inverter to main (DP) included</li>
                        <li>• Additional wire beyond 45 feet: Rs. 100 per foot</li>
                        <li>• Additional wire beyond 10 feet: Rs. 200 per foot</li>
                      </ul>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <Button 
                        onClick={handleSubmit}
                        disabled={saveMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                      >
                        {saveMutation.isPending ? "Submitting..." : "Submit Installation Request"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowResult(false);
                          setPriceDetails(null);
                        }}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        Recalculate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}