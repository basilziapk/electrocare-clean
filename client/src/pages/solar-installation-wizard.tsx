import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import NewNavigation from '@/components/new-navigation';
import Footer from '@/components/footer';
import ContactSection from '@/components/ContactSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQuotePDF } from '@/utils/generateQuotePDF';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { PureAuthModal } from '@/components/pure-auth-modal';

interface WizardData {
  // Step 1
  installationType: string;
  // Step 2
  city: string;
  customCity?: string;
  // Step 3
  society: string;
  // Step 4
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyType: string;
  // Step 5
  loadDemand: {
    ac15Ton: number;
    ac1Ton: number;
    fans: number;
    refrigerator: number;
    lights: number;
    motors: number;
    iron: number;
    washingMachine: number;
    computerTV: number;
    cctv: number;
    waterDispenser: number;
    other: number;
    otherDescription: string;
  };
  // Step 6
  houseDimension: string;
  customDimension: string;
  // Step 7
  roofType: string;
  // Step 8
  roofLength: string;
  roofWidth: string;
  // Step 9 - System Components
  solarPanel: string;
  solarPanelOther: string;
  batteryType: string;
  batteryTypeOther: string;
  batteryBrand: string;
  batteryCapacityAH: string;
  batteryCapacityOther: string;
  inverterBrand: string;
  inverterBrandOther: string;
  solarStructure: string;
  numberOfStands: string;
  electricalAccessories: {
    ducting: boolean;
    civilWork: boolean;
    cables: boolean;
    surgeProtection: boolean;
  };
  netMetering: string;
  disco: string;
  transportation: string;
  // Step 10
  roofPhotos: File[];
  // Step 11 - Calculated
  totalLoad: number;
  recommendedCapacity: number;
  panelsRequired: number;
  inverterSize: number;
  batteryCapacity: number;
  estimatedCost: number;
}

const initialWizardData: WizardData = {
  installationType: '',
  city: '',
  society: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  propertyType: '',
  loadDemand: {
    ac15Ton: 0,
    ac1Ton: 0,
    fans: 0,
    refrigerator: 0,
    lights: 0,
    motors: 0,
    iron: 0,
    washingMachine: 0,
    computerTV: 0,
    cctv: 0,
    waterDispenser: 0,
    other: 0,
    otherDescription: '',
  },
  houseDimension: '',
  customDimension: '',
  roofType: '',
  roofLength: '',
  roofWidth: '',
  solarPanel: '',
  solarPanelOther: '',
  batteryType: '',
  batteryTypeOther: '',
  batteryBrand: '',
  batteryCapacityAH: '',
  batteryCapacityOther: '',
  inverterBrand: '',
  inverterBrandOther: '',
  solarStructure: '',
  numberOfStands: '',
  electricalAccessories: {
    ducting: false,
    civilWork: false,
    cables: false,
    surgeProtection: false,
  },
  netMetering: '',
  disco: '',
  transportation: '',
  roofPhotos: [],
  totalLoad: 0,
  recommendedCapacity: 0,
  panelsRequired: 0,
  inverterSize: 0,
  batteryCapacity: 0,
  estimatedCost: 0,
};

const steps = [
  { 
    id: 1, 
    title: 'Installation Type', 
    icon: 'fa-solar-panel',
    description: 'Choose your solar installation type'
  },
  { 
    id: 2, 
    title: 'Location', 
    icon: 'fa-location-dot',
    description: 'Select your city'
  },
  { 
    id: 3, 
    title: 'Society/Area', 
    icon: 'fa-building',
    description: 'Select your society or town'
  },
  { 
    id: 4, 
    title: 'Personal Details', 
    icon: 'fa-user',
    description: 'Enter your contact information'
  },
  { 
    id: 5, 
    title: 'Load Demand', 
    icon: 'fa-bolt',
    description: 'Calculate your energy requirements'
  },
  { 
    id: 6, 
    title: 'House Size', 
    icon: 'fa-home',
    description: 'Select your house dimensions'
  },
  { 
    id: 7, 
    title: 'Roof Type', 
    icon: 'fa-house-chimney',
    description: 'Choose your roof type'
  },
  { 
    id: 8, 
    title: 'Roof Dimensions', 
    icon: 'fa-ruler-combined',
    description: 'Enter roof measurements'
  },
  { 
    id: 9, 
    title: 'System Components', 
    icon: 'fa-cogs',
    description: 'Select system components and brands'
  },
  { 
    id: 10, 
    title: 'Roof Photos', 
    icon: 'fa-camera',
    description: 'Upload roof photographs'
  },
  { 
    id: 11, 
    title: 'Review & Generate', 
    icon: 'fa-file-invoice',
    description: 'Review and generate your quote'
  },
];

export function SolarInstallationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  const isAuthenticated = !!user;

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('solarWizardData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Merge with initial data to ensure all fields exist
        setWizardData({
          ...initialWizardData,
          ...parsed,
          electricalAccessories: {
            ...initialWizardData.electricalAccessories,
            ...(parsed.electricalAccessories || {})
          }
        });
      } catch (e) {
        console.error('Failed to load saved data');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('solarWizardData', JSON.stringify(wizardData));
  }, [wizardData]);

  // Check for pending quotation after login
  useEffect(() => {
    const checkPendingQuotation = async () => {
      if (isAuthenticated && user) {
        const pendingData = localStorage.getItem('pendingQuotation');
        if (pendingData) {
          try {
            const parsed = JSON.parse(pendingData);
            setWizardData(parsed);
            
            // Auto-submit the pending quotation
            const quotationData = {
              customerName: `${parsed.firstName} ${parsed.lastName}`,
              email: parsed.email,
              phone: parsed.phone,
              address: parsed.address,
              city: parsed.city === 'other' ? (parsed.customCity || 'Other') : parsed.city,
              society: parsed.society,
              installationType: parsed.installationType,
              systemSize: String(parsed.recommendedCapacity),
              panelQuantity: String(parsed.panelsRequired),
              inverterSize: String(parsed.inverterSize),
              batteryCapacity: String(parsed.batteryCapacity),
              totalCost: String(parsed.estimatedCost),
              houseDimension: parsed.houseDimension === 'custom' ? parsed.customDimension : parsed.houseDimension,
              roofType: parsed.roofType,
              roofArea: `${parsed.roofLength} x ${parsed.roofWidth}`,
              totalLoad: String(parsed.totalLoad),
              appliances: parsed.loadDemand,
            };
            
            await submitQuoteMutation.mutateAsync(quotationData);
            localStorage.removeItem('pendingQuotation');
            
            toast({
              title: 'Success',
              description: 'Your pending quotation has been submitted successfully!',
            });
          } catch (e) {
            console.error('Failed to submit pending quotation', e);
          }
        }
      }
    };
    
    checkPendingQuotation();
  }, [isAuthenticated, user]);

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/quotations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate quotations cache to refresh admin panel
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      // Clear saved data
      localStorage.removeItem('solarWizardData');
      // Show success modal instead of redirecting
      setShowSuccess(true);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit quote. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!wizardData.installationType) {
          newErrors.installationType = 'Please select an installation type';
        }
        break;
      case 2:
        if (!wizardData.city) {
          newErrors.city = 'Please select a city';
        }
        if (wizardData.city === 'other' && !wizardData.customCity) {
          newErrors.customCity = 'Please enter your city name';
        }
        break;
      case 3:
        if (!wizardData.society) {
          newErrors.society = 'Please enter society/area name';
        }
        break;
      case 4:
        if (!wizardData.firstName) newErrors.firstName = 'First name is required';
        if (!wizardData.lastName) newErrors.lastName = 'Last name is required';
        if (!wizardData.email) newErrors.email = 'Email is required';
        if (!wizardData.phone) newErrors.phone = 'Phone number is required';
        if (!wizardData.address) newErrors.address = 'Address is required';
        break;
      case 5:
        const totalLoad = calculateTotalLoad();
        if (totalLoad === 0) {
          newErrors.loadDemand = 'Please specify at least one appliance';
        }
        break;
      case 6:
        if (!wizardData.houseDimension) {
          newErrors.houseDimension = 'Please select house dimension';
        }
        if (wizardData.houseDimension === 'custom' && !wizardData.customDimension) {
          newErrors.customDimension = 'Please specify custom dimension';
        }
        break;
      case 7:
        if (!wizardData.roofType) {
          newErrors.roofType = 'Please select roof type';
        }
        break;
      case 8:
        if (!wizardData.roofLength) newErrors.roofLength = 'Roof length is required';
        if (!wizardData.roofWidth) newErrors.roofWidth = 'Roof width is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 10) {
        // Calculate requirements before final step
        calculateRequirements();
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      // Scroll to optimal position to show progress tracker without full header
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to optimal position to show progress tracker without full header
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const calculateTotalLoad = () => {
    const load = wizardData.loadDemand;
    return (
      load.ac15Ton * 2000 +
      load.ac1Ton * 1500 +
      load.fans * 100 +
      load.refrigerator * 400 +
      load.lights * 15 +
      load.motors * 1000 +
      load.iron * 1000 +
      load.washingMachine * 350 +
      load.computerTV * 300 +
      load.cctv * 350 +
      load.waterDispenser * 300 +
      load.other
    );
  };

  const calculateRequirements = () => {
    const totalLoad = calculateTotalLoad();
    const safetyFactor = 1.25;
    const recommendedCapacity = Math.ceil((totalLoad * safetyFactor) / 1000);
    const panelsRequired = Math.ceil(recommendedCapacity / 0.55);
    const inverterSize = Math.ceil(recommendedCapacity * 1.2);
    const batteryCapacity = Math.ceil(recommendedCapacity * 4);
    const estimatedCost = recommendedCapacity * 150000;

    setWizardData(prev => ({
      ...prev,
      totalLoad,
      recommendedCapacity,
      panelsRequired,
      inverterSize,
      batteryCapacity,
      estimatedCost,
    }));
  };

  const handleSubmit = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save wizard data to localStorage before redirecting
      localStorage.setItem('pendingQuotation', JSON.stringify(wizardData));
      toast({
        title: 'Sign in Required',
        description: 'Please sign in to submit your quotation request. Your data has been saved.',
      });
      // Open authentication modal instead of redirecting
      setShowAuthModal(true);
      return;
    }

    const quotationData = {
      // Customer Information
      customerName: `${wizardData.firstName} ${wizardData.lastName}`,
      customerEmail: wizardData.email,
      phone: wizardData.phone,
      propertyAddress: wizardData.address,
      city: wizardData.city === 'other' ? (wizardData.customCity || 'Other') : wizardData.city,
      society: wizardData.society,
      
      // Property Information
      installationType: wizardData.installationType,
      propertyType: wizardData.propertyType,
      houseDimension: wizardData.houseDimension,
      customDimension: wizardData.customDimension,
      roofType: wizardData.roofType,
      roofLength: String(wizardData.roofLength || ''),
      roofWidth: String(wizardData.roofWidth || ''),
      
      // System Components
      solarPanel: wizardData.solarPanel,
      solarPanelOther: wizardData.solarPanelOther,
      batteryType: wizardData.batteryType,
      batteryTypeOther: wizardData.batteryTypeOther,
      batteryBrand: wizardData.batteryBrand,
      batteryCapacity: String(wizardData.batteryCapacityAH || '').slice(0, 20), // User input AH rating (limit to 20 chars)
      batteryCapacityOther: wizardData.batteryCapacityOther,
      inverterBrand: wizardData.inverterBrand,
      inverterBrandOther: wizardData.inverterBrandOther,
      solarStructure: wizardData.solarStructure,
      numberOfStands: String(wizardData.numberOfStands || ''),
      electricalAccessories: JSON.stringify(wizardData.electricalAccessories),
      netMetering: wizardData.netMetering,
      disco: wizardData.disco,
      transportation: wizardData.transportation,
      
      // Calculated Values - Convert to strings
      energyConsumption: String(wizardData.totalLoad || 0),
      totalLoad: String(wizardData.totalLoad || 0),
      systemSize: String(wizardData.recommendedCapacity || 0),
      panelsRequired: String(wizardData.panelsRequired || 0),
      inverterSize: String(wizardData.inverterSize || 0),
      batteryCapacityCalc: String(wizardData.batteryCapacity || 0), // Calculated battery capacity
      estimatedCost: wizardData.estimatedCost,
      amount: wizardData.estimatedCost,
      
      // Additional Information
      installationTimeline: "2-4 weeks",
      items: JSON.stringify(wizardData.loadDemand),
      notes: `Installation Type: ${wizardData.installationType}, Roof Photos: ${wizardData.roofPhotos.length} uploaded`,
    };

    await submitQuoteMutation.mutateAsync(quotationData);
  };

  const handlePrintQuote = () => {
    // Generate PDF and open in new window for printing
    const quotationData = {
      customerName: `${wizardData.firstName} ${wizardData.lastName}`,
      customerEmail: wizardData.email,
      customerPhone: wizardData.phone,
      customerAddress: wizardData.address,
      city: wizardData.city === 'other' ? (wizardData.customCity || 'Other') : wizardData.city,
      systemSize: wizardData.recommendedCapacity,
      panelQuantity: wizardData.panelsRequired,
      inverterSize: wizardData.inverterSize,
      batteryCapacity: wizardData.batteryCapacity,
      totalCost: wizardData.estimatedCost,
      totalLoad: wizardData.totalLoad,
      solarPanel: wizardData.solarPanel === 'other' ? wizardData.solarPanelOther : wizardData.solarPanel,
      batteryType: wizardData.batteryType === 'other' ? wizardData.batteryTypeOther : wizardData.batteryType,
      batteryCapacityAH: wizardData.batteryCapacityAH === 'other' ? wizardData.batteryCapacityOther : wizardData.batteryCapacityAH,
      inverterBrand: wizardData.inverterBrand === 'other' ? wizardData.inverterBrandOther : wizardData.inverterBrand,
      result: {
        systemSize: wizardData.recommendedCapacity,
        panelsRequired: wizardData.panelsRequired,
        panelCapacity: 550,
        inverterSize: wizardData.inverterSize,
        batteryCapacity: wizardData.batteryCapacity,
        estimatedCost: wizardData.estimatedCost,
        dailyGeneration: wizardData.recommendedCapacity * 5,
        monthlyGeneration: wizardData.recommendedCapacity * 5 * 30,
        yearlyGeneration: wizardData.recommendedCapacity * 5 * 365,
        co2Offset: wizardData.recommendedCapacity * 1.2,
        treesEquivalent: Math.round(wizardData.recommendedCapacity * 1.2 * 40),
        paybackPeriod: 5.5,
        savings25Years: wizardData.estimatedCost * 4.5,
        roiPercentage: 450,
      },
      loadBreakdown: [
        { item: 'AC 1.5 Ton', quantity: wizardData.loadDemand.ac15Ton, watts: wizardData.loadDemand.ac15Ton * 2000 },
        { item: 'AC 1 Ton', quantity: wizardData.loadDemand.ac1Ton, watts: wizardData.loadDemand.ac1Ton * 1500 },
        { item: 'Fans', quantity: wizardData.loadDemand.fans, watts: wizardData.loadDemand.fans * 100 },
        { item: 'Refrigerator', quantity: wizardData.loadDemand.refrigerator, watts: wizardData.loadDemand.refrigerator * 400 },
        { item: 'Lights', quantity: wizardData.loadDemand.lights, watts: wizardData.loadDemand.lights * 15 },
        { item: 'Motors', quantity: wizardData.loadDemand.motors, watts: wizardData.loadDemand.motors * 1000 },
        { item: 'Iron', quantity: wizardData.loadDemand.iron, watts: wizardData.loadDemand.iron * 1000 },
        { item: 'Washing Machine', quantity: wizardData.loadDemand.washingMachine, watts: wizardData.loadDemand.washingMachine * 350 },
        { item: 'Computer/TV', quantity: wizardData.loadDemand.computerTV, watts: wizardData.loadDemand.computerTV * 300 },
        { item: 'CCTV', quantity: wizardData.loadDemand.cctv, watts: wizardData.loadDemand.cctv * 350 },
        { item: 'Water Dispenser', quantity: wizardData.loadDemand.waterDispenser, watts: wizardData.loadDemand.waterDispenser * 300 },
        { item: wizardData.loadDemand.otherDescription || 'Other', quantity: 1, watts: wizardData.loadDemand.other },
      ].filter(item => item.quantity > 0),
    };

    // Generate PDF in a new window for printing
    generateQuotePDF(quotationData, true);
  };

  const handleDownloadPDF = () => {
    const quotationData = {
      customerName: `${wizardData.firstName} ${wizardData.lastName}`,
      customerEmail: wizardData.email,
      customerPhone: wizardData.phone,
      customerAddress: wizardData.address,
      city: wizardData.city === 'other' ? (wizardData.customCity || 'Other') : wizardData.city,
      systemSize: wizardData.recommendedCapacity,
      panelQuantity: wizardData.panelsRequired,
      inverterSize: wizardData.inverterSize,
      batteryCapacity: wizardData.batteryCapacity,
      totalCost: wizardData.estimatedCost,
      totalLoad: wizardData.totalLoad,
      solarPanel: wizardData.solarPanel === 'other' ? wizardData.solarPanelOther : wizardData.solarPanel,
      batteryType: wizardData.batteryType === 'other' ? wizardData.batteryTypeOther : wizardData.batteryType,
      batteryCapacityAH: wizardData.batteryCapacityAH === 'other' ? wizardData.batteryCapacityOther : wizardData.batteryCapacityAH,
      inverterBrand: wizardData.inverterBrand === 'other' ? wizardData.inverterBrandOther : wizardData.inverterBrand,
      result: {
        systemSize: wizardData.recommendedCapacity,
        panelsRequired: wizardData.panelsRequired,
        panelCapacity: 550,
        inverterSize: wizardData.inverterSize,
        batteryCapacity: wizardData.batteryCapacity,
        estimatedCost: wizardData.estimatedCost,
        dailyGeneration: wizardData.recommendedCapacity * 5,
        monthlyGeneration: wizardData.recommendedCapacity * 5 * 30,
        yearlyGeneration: wizardData.recommendedCapacity * 5 * 365,
        co2Offset: wizardData.recommendedCapacity * 1.2,
        treesEquivalent: Math.round(wizardData.recommendedCapacity * 1.2 * 40),
        paybackPeriod: 5.5,
        savings25Years: wizardData.estimatedCost * 4.5,
        roiPercentage: 450,
      },
      loadBreakdown: [
        { item: 'AC 1.5 Ton', quantity: wizardData.loadDemand.ac15Ton, watts: wizardData.loadDemand.ac15Ton * 2000 },
        { item: 'AC 1 Ton', quantity: wizardData.loadDemand.ac1Ton, watts: wizardData.loadDemand.ac1Ton * 1500 },
        { item: 'Fans', quantity: wizardData.loadDemand.fans, watts: wizardData.loadDemand.fans * 100 },
        { item: 'Refrigerator', quantity: wizardData.loadDemand.refrigerator, watts: wizardData.loadDemand.refrigerator * 400 },
        { item: 'Lights', quantity: wizardData.loadDemand.lights, watts: wizardData.loadDemand.lights * 15 },
        { item: 'Motors', quantity: wizardData.loadDemand.motors, watts: wizardData.loadDemand.motors * 1000 },
        { item: 'Iron', quantity: wizardData.loadDemand.iron, watts: wizardData.loadDemand.iron * 1000 },
        { item: 'Washing Machine', quantity: wizardData.loadDemand.washingMachine, watts: wizardData.loadDemand.washingMachine * 350 },
        { item: 'Computer/TV', quantity: wizardData.loadDemand.computerTV, watts: wizardData.loadDemand.computerTV * 300 },
        { item: 'CCTV', quantity: wizardData.loadDemand.cctv, watts: wizardData.loadDemand.cctv * 350 },
        { item: 'Water Dispenser', quantity: wizardData.loadDemand.waterDispenser, watts: wizardData.loadDemand.waterDispenser * 300 },
        { item: wizardData.loadDemand.otherDescription || 'Other', quantity: 1, watts: wizardData.loadDemand.other },
      ].filter(item => item.quantity > 0),
    };

    generateQuotePDF(quotationData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <RadioGroup
              value={wizardData.installationType}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, installationType: value }))}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.installationType === 'ongrid' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="ongrid" id="ongrid" />
                      <div className="flex-1">
                        <Label htmlFor="ongrid" className="cursor-pointer">
                          <div className="font-semibold">On-Grid System</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connected to the main power grid. Excess energy is fed back to the grid.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.installationType === 'offgrid' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="offgrid" id="offgrid" />
                      <div className="flex-1">
                        <Label htmlFor="offgrid" className="cursor-pointer">
                          <div className="font-semibold">Off-Grid System</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Independent system with battery storage. Not connected to the grid.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.installationType === 'hybrid' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <div className="flex-1">
                        <Label htmlFor="hybrid" className="cursor-pointer">
                          <div className="font-semibold">Hybrid System</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Best of both worlds. Grid-connected with battery backup.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.installationType === 'netmetering' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="netmetering" id="netmetering" />
                      <div className="flex-1">
                        <Label htmlFor="netmetering" className="cursor-pointer">
                          <div className="font-semibold">Net Metering</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Grid-tied system with utility credits for excess generation.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
              </div>
            </RadioGroup>
            {errors.installationType && (
              <p className="text-red-500 text-sm">{errors.installationType}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">Select Your City</Label>
              <Select value={wizardData.city} onValueChange={(value) => setWizardData(prev => ({ ...prev, city: value }))}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Choose your city" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {/* Cities in alphabetical order */}
                  <SelectItem value="abbottabad">Abbottabad</SelectItem>
                  <SelectItem value="astore">Astore</SelectItem>
                  <SelectItem value="attock">Attock</SelectItem>
                  <SelectItem value="badin">Badin</SelectItem>
                  <SelectItem value="bagh">Bagh</SelectItem>
                  <SelectItem value="bahawalpur">Bahawalpur</SelectItem>
                  <SelectItem value="bannu">Bannu</SelectItem>
                  <SelectItem value="batagram">Batagram</SelectItem>
                  <SelectItem value="bhakkar">Bhakkar</SelectItem>
                  <SelectItem value="bhimber">Bhimber</SelectItem>
                  <SelectItem value="buner">Buner</SelectItem>
                  <SelectItem value="chakwal">Chakwal</SelectItem>
                  <SelectItem value="chaman">Chaman</SelectItem>
                  <SelectItem value="charsadda">Charsadda</SelectItem>
                  <SelectItem value="chiniot">Chiniot</SelectItem>
                  <SelectItem value="chitral">Chitral</SelectItem>
                  <SelectItem value="dadu">Dadu</SelectItem>
                  <SelectItem value="dalbandin">Dalbandin</SelectItem>
                  <SelectItem value="dera-allah-yar">Dera Allah Yar</SelectItem>
                  <SelectItem value="dera-ghazi-khan">Dera Ghazi Khan</SelectItem>
                  <SelectItem value="dera-ismail-khan">Dera Ismail Khan</SelectItem>
                  <SelectItem value="dera-murad-jamali">Dera Murad Jamali</SelectItem>
                  <SelectItem value="diamer">Diamer</SelectItem>
                  <SelectItem value="dir">Dir</SelectItem>
                  <SelectItem value="faisalabad">Faisalabad</SelectItem>
                  <SelectItem value="ghanche">Ghanche</SelectItem>
                  <SelectItem value="ghizer">Ghizer</SelectItem>
                  <SelectItem value="ghotki">Ghotki</SelectItem>
                  <SelectItem value="gilgit">Gilgit</SelectItem>
                  <SelectItem value="gujranwala">Gujranwala</SelectItem>
                  <SelectItem value="gujrat">Gujrat</SelectItem>
                  <SelectItem value="gwadar">Gwadar</SelectItem>
                  <SelectItem value="hafizabad">Hafizabad</SelectItem>
                  <SelectItem value="hangu">Hangu</SelectItem>
                  <SelectItem value="haripur">Haripur</SelectItem>
                  <SelectItem value="hattian-bala">Hattian Bala</SelectItem>
                  <SelectItem value="haveli">Haveli</SelectItem>
                  <SelectItem value="hub">Hub</SelectItem>
                  <SelectItem value="hunza">Hunza</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="jacobabad">Jacobabad</SelectItem>
                  <SelectItem value="jamshoro">Jamshoro</SelectItem>
                  <SelectItem value="jhang">Jhang</SelectItem>
                  <SelectItem value="jhelum">Jhelum</SelectItem>
                  <SelectItem value="jiwani">Jiwani</SelectItem>
                  <SelectItem value="kalat">Kalat</SelectItem>
                  <SelectItem value="kambar">Kambar</SelectItem>
                  <SelectItem value="kamoke">Kamoke</SelectItem>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="karak">Karak</SelectItem>
                  <SelectItem value="kashmore">Kashmore</SelectItem>
                  <SelectItem value="kasur">Kasur</SelectItem>
                  <SelectItem value="khairpur">Khairpur</SelectItem>
                  <SelectItem value="khanewal">Khanewal</SelectItem>
                  <SelectItem value="kharan">Kharan</SelectItem>
                  <SelectItem value="kharmang">Kharmang</SelectItem>
                  <SelectItem value="khushab">Khushab</SelectItem>
                  <SelectItem value="khuzdar">Khuzdar</SelectItem>
                  <SelectItem value="kohat">Kohat</SelectItem>
                  <SelectItem value="kohistan">Kohistan</SelectItem>
                  <SelectItem value="kotli">Kotli</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="lakki-marwat">Lakki Marwat</SelectItem>
                  <SelectItem value="larkana">Larkana</SelectItem>
                  <SelectItem value="layyah">Layyah</SelectItem>
                  <SelectItem value="loralai">Loralai</SelectItem>
                  <SelectItem value="malakand">Malakand</SelectItem>
                  <SelectItem value="mandi-bahauddin">Mandi Bahauddin</SelectItem>
                  <SelectItem value="mansehra">Mansehra</SelectItem>
                  <SelectItem value="mardan">Mardan</SelectItem>
                  <SelectItem value="mastung">Mastung</SelectItem>
                  <SelectItem value="matiari">Matiari</SelectItem>
                  <SelectItem value="mianwali">Mianwali</SelectItem>
                  <SelectItem value="mingora">Mingora</SelectItem>
                  <SelectItem value="mirpur-ajk">Mirpur (AJK)</SelectItem>
                  <SelectItem value="mirpur-khas">Mirpur Khas</SelectItem>
                  <SelectItem value="mithi">Mithi</SelectItem>
                  <SelectItem value="multan">Multan</SelectItem>
                  <SelectItem value="muzaffarabad">Muzaffarabad</SelectItem>
                  <SelectItem value="muzaffargarh">Muzaffargarh</SelectItem>
                  <SelectItem value="nagar">Nagar</SelectItem>
                  <SelectItem value="nankana-sahib">Nankana Sahib</SelectItem>
                  <SelectItem value="narowal">Narowal</SelectItem>
                  <SelectItem value="nawabshah">Nawabshah</SelectItem>
                  <SelectItem value="neelum">Neelum</SelectItem>
                  <SelectItem value="nowshera">Nowshera</SelectItem>
                  <SelectItem value="nushki">Nushki</SelectItem>
                  <SelectItem value="okara">Okara</SelectItem>
                  <SelectItem value="ormara">Ormara</SelectItem>
                  <SelectItem value="pakpattan">Pakpattan</SelectItem>
                  <SelectItem value="pasni">Pasni</SelectItem>
                  <SelectItem value="peshawar">Peshawar</SelectItem>
                  <SelectItem value="pishin">Pishin</SelectItem>
                  <SelectItem value="quetta">Quetta</SelectItem>
                  <SelectItem value="rahim-yar-khan">Rahim Yar Khan</SelectItem>
                  <SelectItem value="rawalakot">Rawalakot</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                  <SelectItem value="sahiwal">Sahiwal</SelectItem>
                  <SelectItem value="sanghar">Sanghar</SelectItem>
                  <SelectItem value="sargodha">Sargodha</SelectItem>
                  <SelectItem value="shangla">Shangla</SelectItem>
                  <SelectItem value="sheikhupura">Sheikhupura</SelectItem>
                  <SelectItem value="shigar">Shigar</SelectItem>
                  <SelectItem value="shikarpur">Shikarpur</SelectItem>
                  <SelectItem value="sialkot">Sialkot</SelectItem>
                  <SelectItem value="sibi">Sibi</SelectItem>
                  <SelectItem value="skardu">Skardu</SelectItem>
                  <SelectItem value="sudhanoti">Sudhanoti</SelectItem>
                  <SelectItem value="sukkur">Sukkur</SelectItem>
                  <SelectItem value="swabi">Swabi</SelectItem>
                  <SelectItem value="tando-adam">Tando Adam</SelectItem>
                  <SelectItem value="tando-allahyar">Tando Allahyar</SelectItem>
                  <SelectItem value="tando-muhammad-khan">Tando Muhammad Khan</SelectItem>
                  <SelectItem value="tank">Tank</SelectItem>
                  <SelectItem value="thatta">Thatta</SelectItem>
                  <SelectItem value="toba-tek-singh">Toba Tek Singh</SelectItem>
                  <SelectItem value="tor-ghar">Tor Ghar</SelectItem>
                  <SelectItem value="turbat">Turbat</SelectItem>
                  <SelectItem value="umerkot">Umerkot</SelectItem>
                  <SelectItem value="vehari">Vehari</SelectItem>
                  <SelectItem value="zhob">Zhob</SelectItem>
                  
                  {/* Other option */}
                  <SelectItem value="other">Other city</SelectItem>
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            
            {wizardData.city === 'other' && (
              <div>
                <Label htmlFor="customCity">Enter Your City Name</Label>
                <Input
                  id="customCity"
                  value={wizardData.customCity || ''}
                  onChange={(e) => setWizardData(prev => ({ ...prev, customCity: e.target.value }))}
                  placeholder="Enter your city name"
                />
                {errors.customCity && (
                  <p className="text-red-500 text-sm mt-1">{errors.customCity}</p>
                )}
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fas fa-info-circle mr-2"></i>
                Your location helps us calculate optimal panel positioning and estimate energy generation based on local sunlight conditions.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="society">Society/Town Name</Label>
              <Input
                id="society"
                value={wizardData.society}
                onChange={(e) => setWizardData(prev => ({ ...prev, society: e.target.value }))}
                placeholder="e.g., DHA Phase 6, Gulberg, F-10"
              />
              {errors.society && (
                <p className="text-red-500 text-sm mt-1">{errors.society}</p>
              )}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <i className="fas fa-lightbulb mr-2"></i>
                Tip: Include sector, phase, or block information for more accurate service planning.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={wizardData.firstName}
                  onChange={(e) => setWizardData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ahmad"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={wizardData.lastName}
                  onChange={(e) => setWizardData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Khan"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={wizardData.email}
                onChange={(e) => setWizardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ahmad.khan@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={wizardData.phone}
                onChange={(e) => setWizardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+92 3XX XXXXXXX"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="address">Complete Address</Label>
              <Textarea
                id="address"
                value={wizardData.address}
                onChange={(e) => setWizardData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="House #, Street, Area"
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={wizardData.propertyType || ''} onValueChange={(value) => setWizardData(prev => ({ ...prev, propertyType: value }))}>
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <i className="fas fa-calculator mr-2"></i>
                Enter the number of appliances you have. We'll calculate your total energy requirements.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ac15">Air Conditioner 1.5 Ton (2000W each)</Label>
                <Input
                  id="ac15"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.ac15Ton}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, ac15Ton: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="ac1">Air Conditioner 1 Ton (1500W each)</Label>
                <Input
                  id="ac1"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.ac1Ton}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, ac1Ton: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="fans">Fans (100W each)</Label>
                <Input
                  id="fans"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.fans}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, fans: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="fridge">Refrigerator/Freezer (400W each)</Label>
                <Input
                  id="fridge"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.refrigerator}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, refrigerator: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="lights">Lights (15W each)</Label>
                <Input
                  id="lights"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.lights}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, lights: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="motors">Motors/Water Pump (1000W each)</Label>
                <Input
                  id="motors"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.motors}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, motors: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="iron">Iron (1000W each)</Label>
                <Input
                  id="iron"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.iron}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, iron: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="washing">Washing Machine (350W each)</Label>
                <Input
                  id="washing"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.washingMachine}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, washingMachine: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="computer">Computer/TV (300W each)</Label>
                <Input
                  id="computer"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.computerTV}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, computerTV: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="cctv">CCTV Camera (350W each)</Label>
                <Input
                  id="cctv"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.cctv}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, cctv: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="dispenser">Water Dispenser (300W each)</Label>
                <Input
                  id="dispenser"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.waterDispenser}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, waterDispenser: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="other">Other Appliances (Watts)</Label>
                <Input
                  id="other"
                  type="number"
                  min="0"
                  value={wizardData.loadDemand.other}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, other: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="Total watts"
                />
                <Input
                  className="mt-2"
                  placeholder="Describe other appliances"
                  value={wizardData.loadDemand.otherDescription}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    loadDemand: { ...prev.loadDemand, otherDescription: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="font-semibold">Current Total Load: {calculateTotalLoad()} Watts</p>
            </div>
            
            {errors.loadDemand && (
              <p className="text-red-500 text-sm">{errors.loadDemand}</p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <RadioGroup
              value={wizardData.houseDimension}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, houseDimension: value }))}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.houseDimension === '5marla' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="5marla" id="5marla" />
                      <div className="flex-1">
                        <Label htmlFor="5marla" className="cursor-pointer">
                          <div className="font-semibold">5 Marla</div>
                          <p className="text-sm text-muted-foreground">~125 sq yards</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.houseDimension === '10marla' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="10marla" id="10marla" />
                      <div className="flex-1">
                        <Label htmlFor="10marla" className="cursor-pointer">
                          <div className="font-semibold">10 Marla</div>
                          <p className="text-sm text-muted-foreground">~250 sq yards</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.houseDimension === '1kanal' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="1kanal" id="1kanal" />
                      <div className="flex-1">
                        <Label htmlFor="1kanal" className="cursor-pointer">
                          <div className="font-semibold">1 Kanal</div>
                          <p className="text-sm text-muted-foreground">~500 sq yards</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.houseDimension === 'custom' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="custom" id="custom" />
                      <div className="flex-1">
                        <Label htmlFor="custom" className="cursor-pointer">
                          <div className="font-semibold">Custom Size</div>
                          <p className="text-sm text-muted-foreground">Specify your size</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
              </div>
            </RadioGroup>
            
            {wizardData.houseDimension === 'custom' && (
              <div className="mt-4">
                <Label htmlFor="customSize">Specify Size (sq yards or sq feet)</Label>
                <Input
                  id="customSize"
                  value={wizardData.customDimension}
                  onChange={(e) => setWizardData(prev => ({ ...prev, customDimension: e.target.value }))}
                  placeholder="e.g., 300 sq yards"
                />
                {errors.customDimension && (
                  <p className="text-red-500 text-sm mt-1">{errors.customDimension}</p>
                )}
              </div>
            )}
            
            {errors.houseDimension && (
              <p className="text-red-500 text-sm">{errors.houseDimension}</p>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <RadioGroup
              value={wizardData.roofType}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, roofType: value }))}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.roofType === 'flat' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="flat" id="flat" />
                      <div className="flex-1">
                        <Label htmlFor="flat" className="cursor-pointer">
                          <div className="font-semibold">Flat Roof</div>
                          <p className="text-sm text-muted-foreground">Horizontal or nearly horizontal surface</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.roofType === 'sloped' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="sloped" id="sloped" />
                      <div className="flex-1">
                        <Label htmlFor="sloped" className="cursor-pointer">
                          <div className="font-semibold">Sloped Roof</div>
                          <p className="text-sm text-muted-foreground">Angled or pitched surface</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.roofType === 'tiled' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="tiled" id="tiled" />
                      <div className="flex-1">
                        <Label htmlFor="tiled" className="cursor-pointer">
                          <div className="font-semibold">Tiled Roof</div>
                          <p className="text-sm text-muted-foreground">Clay or concrete tiles</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
                
                <label className="cursor-pointer">
                  <Card className={`p-4 hover:border-primary transition-colors ${wizardData.roofType === 'metal' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="metal" id="metal" />
                      <div className="flex-1">
                        <Label htmlFor="metal" className="cursor-pointer">
                          <div className="font-semibold">Metal Roof</div>
                          <p className="text-sm text-muted-foreground">Corrugated or standing seam metal</p>
                        </Label>
                      </div>
                    </div>
                  </Card>
                </label>
              </div>
            </RadioGroup>
            {errors.roofType && (
              <p className="text-red-500 text-sm">{errors.roofType}</p>
            )}
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roofLength">Roof Length (feet)</Label>
                <Input
                  id="roofLength"
                  type="number"
                  value={wizardData.roofLength}
                  onChange={(e) => setWizardData(prev => ({ ...prev, roofLength: e.target.value }))}
                  placeholder="e.g., 40"
                />
                {errors.roofLength && (
                  <p className="text-red-500 text-sm mt-1">{errors.roofLength}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="roofWidth">Roof Width (feet)</Label>
                <Input
                  id="roofWidth"
                  type="number"
                  value={wizardData.roofWidth}
                  onChange={(e) => setWizardData(prev => ({ ...prev, roofWidth: e.target.value }))}
                  placeholder="e.g., 30"
                />
                {errors.roofWidth && (
                  <p className="text-red-500 text-sm mt-1">{errors.roofWidth}</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fas fa-ruler mr-2"></i>
                Accurate measurements help us determine the maximum number of solar panels that can be installed.
              </p>
            </div>
            
            {wizardData.roofLength && wizardData.roofWidth && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-800">
                  Total Roof Area: {parseInt(wizardData.roofLength) * parseInt(wizardData.roofWidth)} sq feet
                </p>
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            {/* Solar Panel Selection */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Solar Panel</h3>
              <div>
                <Label htmlFor="solarPanel">Select Solar Panel Brand</Label>
                <Select value={wizardData.solarPanel} onValueChange={(value) => setWizardData(prev => ({ ...prev, solarPanel: value }))}>
                  <SelectTrigger id="solarPanel">
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="longi">Longi</SelectItem>
                    <SelectItem value="jinko">Jinko</SelectItem>
                    <SelectItem value="canadian-solar">Canadian Solar</SelectItem>
                    <SelectItem value="ja-solar">JA Solar</SelectItem>
                    <SelectItem value="astronergy">Astronergy</SelectItem>
                    <SelectItem value="trina">Trina Solar</SelectItem>
                    <SelectItem value="risen">Risen</SelectItem>
                    <SelectItem value="suntech">Suntech</SelectItem>
                    <SelectItem value="qcells">Q CELLS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {wizardData.solarPanel === 'other' && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter solar panel brand"
                      value={wizardData.solarPanelOther}
                      onChange={(e) => setWizardData(prev => ({ ...prev, solarPanelOther: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Battery Selection */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Battery System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batteryType">Battery Type</Label>
                  <Select value={wizardData.batteryType} onValueChange={(value) => setWizardData(prev => ({ 
                    ...prev, 
                    batteryType: value,
                    batteryCapacityAH: '', // Clear capacity when type changes
                    batteryCapacityOther: ''
                  }))}>
                    <SelectTrigger id="batteryType">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lithium-ion">Lithium Ion Battery</SelectItem>
                      <SelectItem value="tubular">Tubular Battery</SelectItem>
                      <SelectItem value="lead-acid">Lead Acid Battery</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {wizardData.batteryType === 'other' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter battery type"
                        value={wizardData.batteryTypeOther}
                        onChange={(e) => setWizardData(prev => ({ ...prev, batteryTypeOther: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="batteryCapacityAH">Battery Capacity</Label>
                  <Select value={wizardData.batteryCapacityAH} onValueChange={(value) => setWizardData(prev => ({ ...prev, batteryCapacityAH: value }))}>
                    <SelectTrigger id="batteryCapacityAH">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Lithium Ion Battery Options */}
                      {wizardData.batteryType === 'lithium-ion' && (
                        <>
                          <SelectItem value="maxpower-48v-100ah">Maxpower 48V 100AH</SelectItem>
                          <SelectItem value="itsi-512v-100ah">Itsi 51.2V 100AH</SelectItem>
                          <SelectItem value="pylontech-ufsi-2v-100ah">Pylontech UFSi 2v 100AH</SelectItem>
                          <SelectItem value="soluna-512v-100ah">Soluna 51.2V 100AH</SelectItem>
                          <SelectItem value="livoltk-512v">Livoltk 51.2V</SelectItem>
                          <SelectItem value="livoltel-24v-100ah">Livoltel 24V 100AH</SelectItem>
                          <SelectItem value="apex-512v-100ah">Apex 51.2V 100AH</SelectItem>
                          <SelectItem value="maxpower-24v-100ah">Maxpower 24V 100AH</SelectItem>
                          <SelectItem value="solarmax-48v-100ah">SolarMax 48V 100AH</SelectItem>
                          <SelectItem value="luminey-512v-100ah">Luminey 51.2V 100AH</SelectItem>
                          <SelectItem value="dyness-512v-100ah">Dyness 51.2V 100AH</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                      
                      {/* Tubular Battery Options */}
                      {wizardData.batteryType === 'tubular' && (
                        <>
                          <SelectItem value="exide-tr1500-145ah">Exide: TR-1500 (145Ah)</SelectItem>
                          <SelectItem value="exide-tr1800-185ah">Exide: TR-1800 (185Ah)</SelectItem>
                          <SelectItem value="exide-tr2000-190ah">Exide: TR-2000 (190Ah)</SelectItem>
                          <SelectItem value="exide-tr2500-230ah">Exide: TR-2500 (230Ah)</SelectItem>
                          <SelectItem value="livguard-it1560stt-150ah">Livguard: IT1560STT 150Ah</SelectItem>
                          <SelectItem value="phoenix-tx700-70ah">Phoenix: TX700 (70Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1000-110ah">Phoenix: TX1000 (110Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1100-125ah">Phoenix: TX1100 (125Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1200-160ah">Phoenix: TX1200 (160Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1400-175ah">Phoenix: TX1400 (175Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1600-150160ah">Phoenix: TX1600 (150-160Ah)</SelectItem>
                          <SelectItem value="phoenix-tx1800-185ah">Phoenix: TX1800 (185Ah)</SelectItem>
                          <SelectItem value="phoenix-tx2500-230ah">Phoenix: TX2500 (230Ah)</SelectItem>
                          <SelectItem value="phoenix-tx3000-245ah">Phoenix: TX3000 (245Ah)</SelectItem>
                          <SelectItem value="phoenix-tx3500-280ah">Phoenix: TX3500 (280Ah)</SelectItem>
                          <SelectItem value="luminous-inverlast-iltt18060">Luminous: Inverlast ILTT 18060</SelectItem>
                          <SelectItem value="volta-ta2500-supreme-230ah">Volta: TA-2500 Supreme (230Ah)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                      
                      {/* Lead Acid Battery Options */}
                      {wizardData.batteryType === 'lead-acid' && (
                        <>
                          <SelectItem value="atlas-sp100-60ah">Atlas Battery SP-100 (60 Ah)</SelectItem>
                          <SelectItem value="ags-sp250-175ah">AGS SP-250 (175 Ah)</SelectItem>
                          <SelectItem value="ags-washi-ws270-220ah">AGS Washi WS 270 (220 Ah)</SelectItem>
                          <SelectItem value="osaka-platinum-p150s-115ah">Osaka Platinum P-150 S (115 Ah)</SelectItem>
                          <SelectItem value="osaka-platinum-p180s-130ah">Osaka Platinum P-180 S (130 Ah)</SelectItem>
                          <SelectItem value="osaka-platinum-p210s-210ah">Osaka Platinum P-210 S (210 Ah)</SelectItem>
                          <SelectItem value="exide-tr2500-tubular-250ah">Exide TR-2500 (Tubular) (250 Ah)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                      
                      {/* No options for None battery type */}
                      {wizardData.batteryType === 'none' && (
                        <SelectItem value="no-battery">No Battery Required</SelectItem>
                      )}
                      
                      {/* Other battery type */}
                      {wizardData.batteryType === 'other' && (
                        <SelectItem value="other">Other</SelectItem>
                      )}
                      
                      {/* Default case when no battery type is selected */}
                      {!wizardData.batteryType && (
                        <SelectItem value="select-battery-type-first" disabled>Please select battery type first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {wizardData.batteryCapacityAH === 'other' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter battery capacity (e.g., 48V 200AH)"
                        value={wizardData.batteryCapacityOther}
                        onChange={(e) => setWizardData(prev => ({ ...prev, batteryCapacityOther: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inverter Selection */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Inverter</h3>
              <div>
                <Label htmlFor="inverterBrand">Select Inverter Brand</Label>
                <Select value={wizardData.inverterBrand} onValueChange={(value) => setWizardData(prev => ({ ...prev, inverterBrand: value }))}>
                  <SelectTrigger id="inverterBrand">
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nitrox">Nitrox</SelectItem>
                    <SelectItem value="solarmax">SolarMax</SelectItem>
                    <SelectItem value="maxpower">Maxpower</SelectItem>
                    <SelectItem value="itsl">Itsl</SelectItem>
                    <SelectItem value="solis">Solis</SelectItem>
                    <SelectItem value="auxsol">Auxsol</SelectItem>
                    <SelectItem value="livoltek">Livoltek</SelectItem>
                    <SelectItem value="knox">Knox</SelectItem>
                    <SelectItem value="longlife">Longlife</SelectItem>
                    <SelectItem value="foxess">Foxess</SelectItem>
                    <SelectItem value="growatt">Growatt</SelectItem>
                    <SelectItem value="goodwe">GoodWe</SelectItem>
                    <SelectItem value="huawei">Huawei</SelectItem>
                    <SelectItem value="sungrow">Sungrow</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {wizardData.inverterBrand === 'other' && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter inverter brand"
                      value={wizardData.inverterBrandOther}
                      onChange={(e) => setWizardData(prev => ({ ...prev, inverterBrandOther: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Solar Structure */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Solar Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="solarStructure">Structure Type</Label>
                  <Select value={wizardData.solarStructure} onValueChange={(value) => setWizardData(prev => ({ ...prev, solarStructure: value }))}>
                    <SelectTrigger id="solarStructure">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="l2-structure">L2 Structure</SelectItem>
                      <SelectItem value="l3-structure">L3 Structure</SelectItem>
                      <SelectItem value="l4-structure">L4 Structure</SelectItem>
                      <SelectItem value="aluminium-l2">Aluminium L2</SelectItem>
                      <SelectItem value="aluminium-l3">Aluminium L3</SelectItem>
                      <SelectItem value="elevated-customized">Elevated / Customized Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="numberOfStands">Number of Stands</Label>
                  <Input
                    id="numberOfStands"
                    type="number"
                    value={wizardData.numberOfStands}
                    onChange={(e) => setWizardData(prev => ({ ...prev, numberOfStands: e.target.value }))}
                    placeholder="Enter number"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Electrical Accessories */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Electrical Accessories</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.electricalAccessories?.ducting || false}
                    onChange={(e) => setWizardData(prev => ({ 
                      ...prev, 
                      electricalAccessories: {
                        ...prev.electricalAccessories,
                        ducting: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                  <span>Ducting + Piping</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.electricalAccessories?.civilWork || false}
                    onChange={(e) => setWizardData(prev => ({ 
                      ...prev, 
                      electricalAccessories: {
                        ...prev.electricalAccessories,
                        civilWork: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                  <span>Civil Work</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.electricalAccessories?.cables || false}
                    onChange={(e) => setWizardData(prev => ({ 
                      ...prev, 
                      electricalAccessories: {
                        ...prev.electricalAccessories,
                        cables: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                  <span>Cables</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.electricalAccessories?.surgeProtection || false}
                    onChange={(e) => setWizardData(prev => ({ 
                      ...prev, 
                      electricalAccessories: {
                        ...prev.electricalAccessories,
                        surgeProtection: e.target.checked
                      }
                    }))}
                    className="w-4 h-4"
                  />
                  <span>Surge Protection Devices</span>
                </label>
              </div>
            </div>

            {/* Net Metering and DISCO */}
            <div className="p-4 rounded-lg bg-white hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-lg mb-4">Additional Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="netMetering">Net Metering Services</Label>
                  <RadioGroup value={wizardData.netMetering} onValueChange={(value) => setWizardData(prev => ({ ...prev, netMetering: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="netMetering-yes" />
                      <Label htmlFor="netMetering-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="netMetering-no" />
                      <Label htmlFor="netMetering-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="disco">DISCO</Label>
                  <Select value={wizardData.disco} onValueChange={(value) => setWizardData(prev => ({ ...prev, disco: value }))}>
                    <SelectTrigger id="disco">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesco">LESCO</SelectItem>
                      <SelectItem value="kesc">K-Electric</SelectItem>
                      <SelectItem value="iesco">IESCO</SelectItem>
                      <SelectItem value="gepco">GEPCO</SelectItem>
                      <SelectItem value="fesco">FESCO</SelectItem>
                      <SelectItem value="mepco">MEPCO</SelectItem>
                      <SelectItem value="pesco">PESCO</SelectItem>
                      <SelectItem value="hesco">HESCO</SelectItem>
                      <SelectItem value="sepco">SEPCO</SelectItem>
                      <SelectItem value="qesco">QESCO</SelectItem>
                      <SelectItem value="tesco">TESCO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="transportation">Transportation + Labour</Label>
                <RadioGroup value={wizardData.transportation} onValueChange={(value) => setWizardData(prev => ({ ...prev, transportation: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="transportation-yes" />
                    <Label htmlFor="transportation-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="transportation-no" />
                    <Label htmlFor="transportation-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4 pb-8">
            <div>
              <Label htmlFor="photos">Upload Roof Photos</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Please upload 4 photos of your roof, one from each corner for accurate assessment.
              </p>
              <div className="mb-6">
                <Input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setWizardData(prev => ({ ...prev, roofPhotos: files }));
                  }}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            {wizardData.roofPhotos.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  <i className="fas fa-check-circle mr-2"></i>
                  {wizardData.roofPhotos.length} photo(s) selected
                </p>
              </div>
            )}
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <i className="fas fa-camera mr-2"></i>
                Tips for photos:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
                <li>Take photos during daylight for clarity</li>
                <li>Include obstacles like chimneys or vents</li>
                <li>Show shading from nearby trees or buildings</li>
                <li>Capture the entire roof area if possible</li>
              </ul>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Summary</CardTitle>
                <CardDescription>Review your solar installation requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-semibold">{wizardData.firstName} {wizardData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">
                      {wizardData.city === 'other' ? (wizardData.customCity || 'Other') : 
                        wizardData.city.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}, {wizardData.society}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Installation Type</p>
                    <p className="font-semibold capitalize">{wizardData.installationType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">House Size</p>
                    <p className="font-semibold">{wizardData.houseDimension === 'custom' ? wizardData.customDimension : wizardData.houseDimension}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Energy Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 hover:bg-green-50 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-blue-600">{wizardData.totalLoad}W</p>
                    <p className="text-sm text-muted-foreground">Total Load</p>
                  </div>
                  <div className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-green-600">{wizardData.recommendedCapacity}kW</p>
                    <p className="text-sm text-muted-foreground">System Size</p>
                  </div>
                  <div className="bg-purple-50 hover:bg-green-50 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-purple-600">{wizardData.panelsRequired}</p>
                    <p className="text-sm text-muted-foreground">Solar Panels</p>
                  </div>
                  <div className="bg-orange-50 hover:bg-green-50 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-orange-600">{wizardData.inverterSize}kW</p>
                    <p className="text-sm text-muted-foreground">Inverter Size</p>
                  </div>
                  <div className="bg-red-50 hover:bg-green-50 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-red-600">{wizardData.batteryCapacity}kWh</p>
                    <p className="text-sm text-muted-foreground">Battery Capacity</p>
                  </div>
                  <div className="bg-indigo-50 hover:bg-green-50 p-4 rounded-lg transition-all">
                    <p className="text-2xl font-bold text-indigo-600">PKR {wizardData.estimatedCost.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <i className="fas fa-download"></i>
                <span>Download PDF Report</span>
              </Button>
              <Button 
                onClick={handlePrintQuote}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <i className="fas fa-print"></i>
                <span>Print Quote Request</span>
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitQuoteMutation.isPending}
                className="flex items-center space-x-2"
              >
                <i className="fas fa-paper-plane"></i>
                <span>
                  {!isAuthenticated ? 'Sign In & Submit' : 
                   submitQuoteMutation.isPending ? 'Submitting...' : 'Submit Quote Request'}
                </span>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Installation Wizard</h1>
          <p className="text-xl">Get your personalized solar solution in 11 easy steps</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200"></div>
            {/* Progress Bar Fill */}
            <div 
              className="absolute top-8 left-0 h-1 bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    if (step.id < currentStep) {
                      setCurrentStep(step.id);
                      // Scroll to optimal position to show progress tracker without full header
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }
                  }}
                >
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      ${step.id === currentStep ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white scale-110 shadow-lg' : 
                        step.id < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    {step.id < currentStep ? (
                      <i className="fas fa-check text-lg"></i>
                    ) : (
                      <i className={`fas ${step.icon} text-lg`}></i>
                    )}
                  </div>
                  <span className={`
                    hidden md:block mt-2 text-xs text-center max-w-[80px]
                    ${step.id === currentStep ? 'font-semibold text-gray-900' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Step Content Card */}
        <Card className="shadow-xl overflow-visible">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Step {currentStep}: {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {steps[currentStep - 1].description}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Progress</span>
                <p className="text-2xl font-bold text-primary">{currentStep}/{steps.length}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-visible">
            {renderStepContent()}
          </CardContent>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Previous</span>
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <i className="fas fa-arrow-right"></i>
              </Button>
            ) : null}
          </div>
        </Card>
        
        {/* Help Section */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <i className="fas fa-question-circle mr-2"></i>
            Need help? Contact us at <a href="tel:+923001234567" className="font-semibold">+92 300 1234567</a> or 
            email <a href="mailto:info@greentechpk.com" className="font-semibold">info@greentechpk.com</a>
          </p>
        </div>
      </div>
      
      <ContactSection />
      <Footer />

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 mx-4 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-4xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your solar installation quote has been submitted successfully. Our team will review your requirements and contact you soon.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  Thank you for choosing ElectroCare for your solar solution!
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Go to Home Page Now
            </Button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <PureAuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          // After successful login, attempt to submit the quote with a small delay to ensure user state is updated
          setTimeout(() => {
            const savedQuotation = localStorage.getItem('pendingQuotation');
            if (savedQuotation) {
              handleSubmit();
              localStorage.removeItem('pendingQuotation');
            }
          }, 500);
        }}
      />
    </div>
  );
}