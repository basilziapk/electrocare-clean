import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CalculatorResult {
  dailyConsumption: number;
  recommendedCapacity: number;
  estimatedCost: number;
}

interface SolarCalculatorProps {
  onResult?: (result: CalculatorResult) => void;
  showTitle?: boolean;
}

export default function SolarCalculator({ onResult, showTitle = true }: SolarCalculatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calculate");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const calculationResult = {
        dailyConsumption: data.dailyConsumption,
        recommendedCapacity: data.recommendedCapacity,
        estimatedCost: data.estimatedCost,
      };
      setResult(calculationResult);
      onResult?.(calculationResult);
      toast({
        title: "Calculation Complete",
        description: "Your solar requirements have been calculated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate solar requirements. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      lights: parseInt(formData.get('lights') as string) || 0,
      fans: parseInt(formData.get('fans') as string) || 0,
      acs: parseInt(formData.get('acs') as string) || 0,
      computers: parseInt(formData.get('computers') as string) || 0,
      kitchen: parseInt(formData.get('kitchen') as string) || 0,
      misc: parseInt(formData.get('misc') as string) || 0,
      userId: user?.id || null,
    };

    calculateMutation.mutate(data);
  };

  return (
    <div className={showTitle ? "bg-white py-20" : ""} id={showTitle ? "calculator" : ""}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Solar Energy Calculator</h2>
            <p className="text-xl text-neutral">Calculate your solar energy needs based on your appliance usage</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="lights" className="block text-sm font-medium text-dark mb-2">
                  LED Lights (5W each)
                </Label>
                <Input
                  type="number"
                  id="lights"
                  name="lights"
                  min="0"
                  max="50"
                  placeholder="Number of lights"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="fans" className="block text-sm font-medium text-dark mb-2">
                  Ceiling Fans (75W each)
                </Label>
                <Input
                  type="number"
                  id="fans"
                  name="fans"
                  min="0"
                  max="20"
                  placeholder="Number of fans"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="acs" className="block text-sm font-medium text-dark mb-2">
                  Inverter ACs (1500W each)
                </Label>
                <Input
                  type="number"
                  id="acs"
                  name="acs"
                  min="0"
                  max="10"
                  placeholder="Number of ACs"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="computers" className="block text-sm font-medium text-dark mb-2">
                  Computers/Laptops (300W each)
                </Label>
                <Input
                  type="number"
                  id="computers"
                  name="computers"
                  min="0"
                  max="20"
                  placeholder="Number of computers"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="kitchen" className="block text-sm font-medium text-dark mb-2">
                  Kitchen Appliances (2000W total)
                </Label>
                <Select name="kitchen">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select usage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="500">Basic (Microwave)</SelectItem>
                    <SelectItem value="1000">Moderate (Microwave + Induction)</SelectItem>
                    <SelectItem value="2000">Full (All appliances)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="misc" className="block text-sm font-medium text-dark mb-2">
                  Miscellaneous (500W)
                </Label>
                <Select name="misc">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select usage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="200">Low usage</SelectItem>
                    <SelectItem value="350">Medium usage</SelectItem>
                    <SelectItem value="500">High usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-center">
              <Button 
                type="submit" 
                size="lg"
                disabled={calculateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
              >
                <i className="fas fa-calculator mr-2"></i>
                {calculateMutation.isPending ? "Calculating..." : "Calculate Solar Requirements"}
              </Button>
            </div>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md animate-fade-in-up">
              <h3 className="text-xl font-semibold text-dark mb-4">Your Solar Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.dailyConsumption.toFixed(1)} kWh</div>
                  <div className="text-sm text-neutral">Daily Consumption</div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{result.recommendedCapacity} kW</div>
                  <div className="text-sm text-neutral">Recommended Capacity</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">₹{result.estimatedCost.toLocaleString()}</div>
                  <div className="text-sm text-neutral">Estimated Cost</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button 
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => window.location.href = user ? '/customer' : '/api/login'}
                >
                  {user ? 'Get Detailed Quote' : 'Login to Get Quote'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
