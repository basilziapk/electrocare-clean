import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Appliance types and their wattages
const applianceData = {
  fans: {
    "Select Fan": 0,
    "A/C Fan": 75,
    "D/C Fan": 50,
    "Inverter Fan": 35,
  },
  tubeLights: {
    "Select Tubelight": 0,
    "36W": 36,
    "40W": 40,
    "60W": 60,
  },
  ledBulbs: {
    "Select LED Bulb": 0,
    "5W": 5,
    "7W": 7,
    "12W": 12,
    "15W": 15,
    "18W": 18,
  },
  ledTVs: {
    "Select LED TV": 0,
    '32"': 65,
    '42"': 100,
    '55"': 155,
    '65"': 200,
    '75"': 250,
  },
  refrigerators: {
    "Select Refrigerator": 0,
    "Inverter Refrigerator": 150,
    "AC Refrigerator": 300,
  },
  washingMachines: {
    "Select Washing Machine": 0,
    "Inverter Washing Machine": 400,
    "AC Washing Machine": 600,
  },
  irons: {
    "Select Iron": 0,
    "Iron (Plastic body)": 1000,
    "Iron (Metal body)": 1500,
  },
  splitACs: {
    "Select Split AC": 0,
    "Split AC 1.0 Ton": 1200,
    "Split AC 1.5 Ton": 1800,
    "Split AC 2.0 Ton": 2400,
    "Split AC 4.0 Ton": 4800,
  },
  inverterACs: {
    "Select Inverter AC": 0,
    "Inverter AC 1.0 Ton": 900,
    "Inverter AC 1.5 Ton": 1350,
    "Inverter AC 2.0 Ton": 1800,
    "Inverter AC 4.0 Ton": 3600,
  },
  waterPumps: {
    "Select Water Pump": 0,
    "Water Pump 0.5 HP": 375,
    "Water Pump 1.0 HP": 750,
    "Water Pump 1.5 HP": 1125,
    "Water Pump 2.0 HP": 1500,
  },
};

interface ApplianceSection {
  type: string;
  selectedOption: string;
  watts: number;
  quantity: number;
  totalWatts: number;
}

interface LoadCalculatorProps {
  onCalculate?: (totalWatts: number, totalKW: number) => void;
}

export default function LoadCalculator({ onCalculate }: LoadCalculatorProps) {
  // Initialize state for each appliance category
  const [appliances, setAppliances] = useState<Record<string, ApplianceSection>>({
    fans: { type: "fans", selectedOption: "Select Fan", watts: 0, quantity: 0, totalWatts: 0 },
    tubeLights: { type: "tubeLights", selectedOption: "Select Tubelight", watts: 0, quantity: 0, totalWatts: 0 },
    ledBulbs: { type: "ledBulbs", selectedOption: "Select LED Bulb", watts: 0, quantity: 0, totalWatts: 0 },
    ledTVs: { type: "ledTVs", selectedOption: "Select LED TV", watts: 0, quantity: 0, totalWatts: 0 },
    refrigerators: { type: "refrigerators", selectedOption: "Select Refrigerator", watts: 0, quantity: 0, totalWatts: 0 },
    washingMachines: { type: "washingMachines", selectedOption: "Select Washing Machine", watts: 0, quantity: 0, totalWatts: 0 },
    irons: { type: "irons", selectedOption: "Select Iron", watts: 0, quantity: 0, totalWatts: 0 },
    splitACs: { type: "splitACs", selectedOption: "Select Split AC", watts: 0, quantity: 0, totalWatts: 0 },
    inverterACs: { type: "inverterACs", selectedOption: "Select Inverter AC", watts: 0, quantity: 0, totalWatts: 0 },
    waterPumps: { type: "waterPumps", selectedOption: "Select Water Pump", watts: 0, quantity: 0, totalWatts: 0 },
  });

  // Additional appliances with direct wattage input
  const [additionalAppliances, setAdditionalAppliances] = useState({
    microwave: { watts: 1200, quantity: 0, totalWatts: 0 },
    computer: { watts: 300, quantity: 0, totalWatts: 0 },
    laptop: { watts: 65, quantity: 0, totalWatts: 0 },
  });

  const [totalWatts, setTotalWatts] = useState(0);
  const [totalKW, setTotalKW] = useState(0);

  // Update appliance selection
  const handleApplianceChange = (category: string, option: string) => {
    const data = applianceData[category as keyof typeof applianceData];
    const watts = data[option as keyof typeof data] || 0;
    
    setAppliances(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        selectedOption: option,
        watts: watts,
        totalWatts: watts * prev[category].quantity,
      }
    }));
  };

  // Update quantity
  const handleQuantityChange = (category: string, quantity: number) => {
    setAppliances(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        quantity: quantity,
        totalWatts: prev[category].watts * quantity,
      }
    }));
  };

  // Update additional appliances
  const handleAdditionalApplianceChange = (appliance: string, field: 'watts' | 'quantity', value: number) => {
    setAdditionalAppliances(prev => {
      const updated = { ...prev };
      const app = updated[appliance as keyof typeof updated];
      
      if (field === 'watts') {
        app.watts = value;
        app.totalWatts = value * app.quantity;
      } else {
        app.quantity = value;
        app.totalWatts = app.watts * value;
      }
      
      return updated;
    });
  };

  // Calculate total watts
  useEffect(() => {
    const applianceTotal = Object.values(appliances).reduce((sum, app) => sum + app.totalWatts, 0);
    const additionalTotal = Object.values(additionalAppliances).reduce((sum, app) => sum + app.totalWatts, 0);
    const total = applianceTotal + additionalTotal;
    
    setTotalWatts(total);
    setTotalKW(total / 1000);
  }, [appliances, additionalAppliances]);

  const handleGoToSolution = () => {
    if (onCalculate) {
      onCalculate(totalWatts, totalKW);
    }
  };

  const renderApplianceSection = (
    category: string,
    title: string,
    icon: string,
    options: Record<string, number>
  ) => {
    const appliance = appliances[category];
    
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4 hover:bg-green-50 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <i className={`fas ${icon} text-blue-600`}></i>
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Select Type</Label>
            <Select 
              value={appliance.selectedOption} 
              onValueChange={(value) => handleApplianceChange(category, value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(options).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Power Rating (Watts)</Label>
            <Input 
              type="number" 
              value={appliance.watts} 
              disabled 
              className="mt-1 bg-gray-50"
            />
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Quantity</Label>
            <Input 
              type="number" 
              min="0"
              value={appliance.quantity} 
              onChange={(e) => handleQuantityChange(category, parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Total Watts</Label>
            <Input 
              type="number" 
              value={appliance.totalWatts} 
              disabled 
              className="mt-1 bg-gray-50 font-semibold"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAdditionalApplianceSection = (
    appliance: string,
    title: string,
    icon: string
  ) => {
    const app = additionalAppliances[appliance as keyof typeof additionalAppliances];
    
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4 hover:bg-green-50 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <i className={`fas ${icon} text-green-600`}></i>
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Power Rating (Watts)</Label>
            <Input 
              type="number" 
              min="0"
              value={app.watts} 
              onChange={(e) => handleAdditionalApplianceChange(appliance, 'watts', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Quantity</Label>
            <Input 
              type="number" 
              min="0"
              value={app.quantity} 
              onChange={(e) => handleAdditionalApplianceChange(appliance, 'quantity', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Total Watts</Label>
            <Input 
              type="number" 
              value={app.totalWatts} 
              disabled 
              className="mt-1 bg-gray-50 font-semibold"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Load Calculator</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-green-50">
          <div className="text-sm text-gray-700">
            <strong>Note!</strong> Each company's appliances have separate watts, so these are average watts for all of them.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {renderApplianceSection("fans", "Fans", "fa-fan", applianceData.fans)}
        {renderApplianceSection("tubeLights", "Tubelights", "fa-lightbulb", applianceData.tubeLights)}
        {renderApplianceSection("ledBulbs", "LED Bulbs", "fa-lightbulb", applianceData.ledBulbs)}
        {renderApplianceSection("ledTVs", "LED TVs", "fa-tv", applianceData.ledTVs)}
        {renderApplianceSection("refrigerators", "Refrigerators", "fa-snowflake", applianceData.refrigerators)}
        {renderApplianceSection("washingMachines", "Washing Machines", "fa-soap", applianceData.washingMachines)}
        {renderApplianceSection("irons", "Irons", "fa-tshirt", applianceData.irons)}
        {renderApplianceSection("splitACs", "Split ACs", "fa-wind", applianceData.splitACs)}
        {renderApplianceSection("inverterACs", "Inverter ACs", "fa-wind", applianceData.inverterACs)}
        {renderApplianceSection("waterPumps", "Water Pumps", "fa-water", applianceData.waterPumps)}
        
        <Separator className="my-6" />
        
        {renderAdditionalApplianceSection("microwave", "Microwave", "fa-microwave")}
        {renderAdditionalApplianceSection("computer", "Computer", "fa-desktop")}
        {renderAdditionalApplianceSection("laptop", "Laptop", "fa-laptop")}
      </div>

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{totalWatts}</div>
              <div className="text-sm text-gray-600 mt-1">Total Watts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{totalKW.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">Total KW</div>
            </div>
            <div className="flex items-center justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                onClick={handleGoToSolution}
                disabled={totalWatts === 0}
              >
                <i className="fas fa-arrow-right mr-2"></i>
                Go to Solution
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}