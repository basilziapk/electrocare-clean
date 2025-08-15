import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessModal } from '@/components/success-modal';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface EnhancedQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  quotation?: any;
  isLoading?: boolean;
}

// Define the 7 steps for the quotation wizard (merged tabs as requested)
const quotationSteps = [
  { id: 1, title: 'Customer Info', description: 'Customer details, contact info, and location' },
  { id: 2, title: 'Property Info', description: 'Property type, address, house dimensions, and roof details' },
  { id: 3, title: 'System Components', description: 'Solar panels and equipment' },
  { id: 4, title: 'System Specifications', description: 'System size and capacity' },
  { id: 5, title: 'Energy Requirements', description: 'Energy consumption analysis' },
  { id: 6, title: 'Financial Details', description: 'Pricing, timeline, and notes' },
  { id: 7, title: 'Status', description: 'Quotation approval status and administrative actions' },
];

export function EnhancedQuotationModal({
  isOpen,
  onClose,
  onSave,
  quotation,
  isLoading = false,
}: EnhancedQuotationModalProps) {
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditOperation, setIsEditOperation] = useState(!!quotation);

  // Update edit operation state when quotation prop changes
  useEffect(() => {
    const isEdit = !!(quotation && quotation.id);
    setIsEditOperation(isEdit);
    console.log('useEffect - Setting isEditOperation:', isEdit, 'quotation:', quotation);
  }, [quotation]);

  // Store the edit state at the time of save to use in success modal
  const [savedAsEdit, setSavedAsEdit] = useState(false);
  // Parse installation type from notes if it exists
  const parseInstallationTypeFromNotes = (notes: string) => {
    if (!notes) return '';
    const match = notes.match(/Installation Type:\s*(\w+)/);
    return match ? match[1] : '';
  };

  // Remove installation type and roof photos from notes for display
  const getCleanNotes = (notes: string) => {
    if (!notes) return '';
    return notes.replace(/Installation Type:\s*\w+,?\s*/, '').replace(/Roof Photos:\s*\d+\s*uploaded,?\s*/, '').trim();
  };

  const [formData, setFormData] = useState(() => {
    // Parse installation type from notes if needed
    const installationType = quotation?.installationType || parseInstallationTypeFromNotes(quotation?.notes || '');
    const cleanNotes = getCleanNotes(quotation?.notes || '');
    
    return {
      // Step 1: Customer Info (merged customer, contact, and location)
      customerName: quotation?.customerName || '',
      status: quotation?.status || 'pending',
      phone: quotation?.phone || '',
      email: quotation?.email || '',
      city: quotation?.city || '',
      society: quotation?.society || '',
      // Step 2: Property Info (merged property, house dimensions, and roof details)
      propertyAddress: quotation?.propertyAddress || '',
      propertyType: quotation?.propertyType || '',
      houseDimension: quotation?.houseDimension || '',
      customDimension: quotation?.customDimension || '',
      roofType: quotation?.roofType || '',
      roofLength: quotation?.roofLength || '',
      roofWidth: quotation?.roofWidth || '',
      // Step 3: System Components
      solarPanel: quotation?.solarPanel || '',
      solarPanelOther: quotation?.solarPanelOther || '',
      batteryType: quotation?.batteryType || '',
      batteryTypeOther: quotation?.batteryTypeOther || '',
      batteryCapacity: quotation?.batteryCapacity || '', // AH rating
      batteryCapacityOther: quotation?.batteryCapacityOther || '',
      inverterBrand: quotation?.inverterBrand || '',
      inverterBrandOther: quotation?.inverterBrandOther || '',
      solarStructure: quotation?.solarStructure || '',
      numberOfStands: quotation?.numberOfStands || '',
      electricalAccessories: quotation?.electricalAccessories || '',
      netMetering: quotation?.netMetering || '',
      disco: quotation?.disco || '',
      transportation: quotation?.transportation || '',
      installationType: installationType,
      // Step 4: System Specifications
      systemSize: quotation?.systemSize || '',
      items: quotation?.items || '',
      panelsRequired: quotation?.panelsRequired || '',
      inverterSize: quotation?.inverterSize || '',
      batteryCapacityCalc: quotation?.batteryCapacityCalc || '',
      // Step 5: Energy Requirements
      energyConsumption: quotation?.energyConsumption || '',
      totalLoad: quotation?.totalLoad || '',
      // System Items/Components (individual appliances)
      ac15Ton: quotation?.ac15Ton || '',
      ac1Ton: quotation?.ac1Ton || '',
      fans: quotation?.fans || '',
      refrigerator: quotation?.refrigerator || '',
      lights: quotation?.lights || '',
      motors: quotation?.motors || '',
      iron: quotation?.iron || '',
      washingMachine: quotation?.washingMachine || '',
      computerTV: quotation?.computerTV || '',
      cctv: quotation?.cctv || '',
      waterDispenser: quotation?.waterDispenser || '',
      other: quotation?.other || '',
      otherDescription: quotation?.otherDescription || '',
      // Step 6: Financial Details (merged financial and notes)
      estimatedCost: quotation?.estimatedCost || '',
      amount: quotation?.amount || '',
      installationTimeline: quotation?.installationTimeline || '',
      notes: cleanNotes,
    };
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation for each step
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Customer Info (merged customer, contact, and location)
        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      case 2: // Property Info (merged property, house dimensions, and roof details)
        if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
        if (!formData.propertyType.trim()) newErrors.propertyType = 'Property type is required';
        if (!formData.roofType.trim()) newErrors.roofType = 'Roof type is required';
        break;
      case 3: // System Components
        if (!formData.installationType.trim()) newErrors.installationType = 'Installation type is required';
        if (!formData.solarPanel.trim()) newErrors.solarPanel = 'Solar panel brand is required';
        if (formData.solarPanel === 'other' && !formData.solarPanelOther.trim()) {
          newErrors.solarPanelOther = 'Please specify the solar panel type';
        }
        if (!formData.batteryType.trim()) newErrors.batteryType = 'Battery type is required';
        if (formData.batteryType === 'other' && !formData.batteryTypeOther.trim()) {
          newErrors.batteryTypeOther = 'Please specify the battery type';
        }
        if (formData.batteryType !== 'none' && !formData.batteryCapacity.trim()) {
          newErrors.batteryCapacity = 'Battery capacity is required';
        }
        if (formData.batteryCapacity === 'other' && !formData.batteryCapacityOther.trim()) {
          newErrors.batteryCapacityOther = 'Please specify the battery capacity';
        }
        if (!formData.inverterBrand.trim()) newErrors.inverterBrand = 'Inverter brand is required';
        if (formData.inverterBrand === 'other' && !formData.inverterBrandOther.trim()) {
          newErrors.inverterBrandOther = 'Please specify the inverter brand';
        }
        break;
      case 5: // Energy Requirements
        // Remove energy consumption validation for edit operations as per user request
        if (!isEditOperation && !formData.energyConsumption.trim()) {
          newErrors.energyConsumption = 'Energy consumption is required';
        }
        break;
      case 6: // Financial Details
        if (!formData.estimatedCost.trim()) newErrors.estimatedCost = 'Estimated cost is required';
        break;
      case 7: // Status
        if (!formData.status.trim()) newErrors.status = 'Status is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, quotationSteps.length));
    } else {
      // Auto-scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Fetch local user data to get email (correct table)
  const { data: localUsersData } = useQuery({
    queryKey: ["/api/local-users"],
    enabled: !!quotation?.customerId,
  });

  // Reset form when quotation prop changes
  useEffect(() => {
    // Don't change isEditOperation here as it's already set in the other useEffect
    if (quotation) {
      // Extract email from users data if customer ID matches
      let customerEmail = quotation.email || quotation.customerEmail || '';
      
      if (quotation.customerId && localUsersData && Array.isArray(localUsersData)) {
        const matchingUser = localUsersData.find((user: any) => 
          user.id === quotation.customerId || 
          user.id === quotation.customerName?.toLowerCase().replace(/\s+/g, '-')
        );
        if (matchingUser) {
          customerEmail = matchingUser.email || customerEmail;
        }
      }

      // Parse items data if it's JSON string
      let parsedItems: any = {};
      if (quotation.items) {
        try {
          parsedItems = JSON.parse(quotation.items);
        } catch (e) {
          console.log('Items is not JSON, treating as string');
        }
      }

      // Parse installation type from notes if needed
      const installationType = quotation.installationType || parseInstallationTypeFromNotes(quotation.notes || '');
      const cleanNotes = getCleanNotes(quotation.notes || '');

      setFormData({
        // Step 1: Customer Info (merged customer, contact, and location)
        customerName: quotation.customerName || '',
        status: quotation.status || 'pending',
        phone: quotation.phone || quotation.notes?.match(/Contact:\s*([^,]*)/)?.[1] || '',
        email: customerEmail,
        city: quotation.city || quotation.notes?.match(/City:\s*([^,]*)/)?.[1] || '',
        society: quotation.society || quotation.notes?.match(/Society:\s*([^,]*)/)?.[1] || '',
        // Step 2: Property Info (merged property, house dimensions, and roof details)
        propertyAddress: quotation.propertyAddress || '',
        propertyType: quotation.propertyType || '',
        houseDimension: quotation.houseDimension || '',
        customDimension: quotation.customDimension || '',
        roofType: quotation.roofType || '',
        roofLength: quotation.roofLength || '',
        roofWidth: quotation.roofWidth || '',
        // Step 3: System Components
        solarPanel: quotation.solarPanel || '',
        solarPanelOther: quotation.solarPanelOther || '',
        batteryType: quotation.batteryType || '',
        batteryTypeOther: quotation.batteryTypeOther || '',
        batteryCapacity: quotation.batteryCapacity || '',
        batteryCapacityOther: quotation.batteryCapacityOther || '',
        inverterBrand: quotation.inverterBrand || '',
        inverterBrandOther: quotation.inverterBrandOther || '',
        solarStructure: quotation.solarStructure || '',
        numberOfStands: quotation.numberOfStands || '',
        electricalAccessories: quotation.electricalAccessories || '',
        netMetering: quotation.netMetering || '',
        disco: quotation.disco || '',
        transportation: quotation.transportation || '',
        installationType: installationType,
        // Step 4: System Specifications
        systemSize: quotation.systemSize || '',
        items: quotation.items || '',
        panelsRequired: quotation.panelsRequired || '',
        inverterSize: quotation.inverterSize || '',
        batteryCapacityCalc: quotation.batteryCapacityCalc || '',
        // Step 5: Energy Requirements
        energyConsumption: quotation.energyConsumption || '',
        totalLoad: quotation.totalLoad || '',
        // System Items/Components (individual appliances from parsed JSON)
        ac15Ton: parsedItems.ac15Ton?.toString() || '',
        ac1Ton: parsedItems.ac1Ton?.toString() || '',
        fans: parsedItems.fans?.toString() || '',
        refrigerator: parsedItems.refrigerator?.toString() || '',
        lights: parsedItems.lights?.toString() || '',
        motors: parsedItems.motors?.toString() || '',
        iron: parsedItems.iron?.toString() || '',
        washingMachine: parsedItems.washingMachine?.toString() || '',
        computerTV: parsedItems.computerTV?.toString() || '',
        cctv: parsedItems.cctv?.toString() || '',
        waterDispenser: parsedItems.waterDispenser?.toString() || '',
        other: parsedItems.other?.toString() || '',
        otherDescription: parsedItems.otherDescription || '',
        // Step 6: Financial Details (merged financial and notes)
        estimatedCost: quotation.estimatedCost || '',
        amount: quotation.amount || '',
        installationTimeline: quotation.installationTimeline || '',
        notes: cleanNotes,
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [quotation, localUsersData]);

  const handleSave = async () => {
    // Validate all steps and find first invalid step
    let firstInvalidStep = -1;
    for (let i = 0; i < quotationSteps.length; i++) {
      if (!validateStep(i + 1)) {
        firstInvalidStep = i + 1;
        break;
      }
    }
    
    if (firstInvalidStep !== -1) {
      // Navigate to the first step with errors
      setCurrentStep(firstInvalidStep);
      toast({
        title: "Validation Failed",
        description: `Please fix errors in ${quotationSteps[firstInvalidStep - 1].title} tab.`,
        variant: "destructive",
      });
      // Enhanced error focus - scroll to first error after step change
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500') || 
                                document.querySelector('.text-red-500') ||
                                document.querySelector('[aria-invalid="true"]');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the input if it's focusable
          if (firstErrorElement.tagName === 'INPUT' || firstErrorElement.tagName === 'TEXTAREA') {
            (firstErrorElement as HTMLElement).focus();
          }
        }
      }, 300);
      return;
    }

    try {
      // Create items JSON from individual appliance fields
      const itemsData = {
        ac15Ton: parseInt(formData.ac15Ton) || 0,
        ac1Ton: parseInt(formData.ac1Ton) || 0,
        fans: parseInt(formData.fans) || 0,
        refrigerator: parseInt(formData.refrigerator) || 0,
        lights: parseInt(formData.lights) || 0,
        motors: parseInt(formData.motors) || 0,
        iron: parseInt(formData.iron) || 0,
        washingMachine: parseInt(formData.washingMachine) || 0,
        computerTV: parseInt(formData.computerTV) || 0,
        cctv: parseInt(formData.cctv) || 0,
        waterDispenser: parseInt(formData.waterDispenser) || 0,
        other: parseInt(formData.other) || 0,
        otherDescription: formData.otherDescription || ''
      };

      // Include quotation ID if editing and convert items to JSON
      const dataToSave = {
        ...formData,
        phone: formData.phone, // Explicitly include phone
        city: formData.city, // Explicitly include city
        society: formData.society, // Explicitly include society
        items: JSON.stringify(itemsData),
        ...(quotation && { 
          id: quotation.id,
          customerId: quotation.customerId // Preserve customer ID
        })
      };
      
      // Store current edit state before save
      const currentIsEdit = isEditOperation;
      setSavedAsEdit(currentIsEdit);
      console.log('About to save - isEditOperation:', currentIsEdit, 'quotation exists:', !!quotation);
      
      await onSave(dataToSave);
      console.log('Save completed - savedAsEdit:', currentIsEdit);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: `Failed to ${quotation ? 'update' : 'create'} quotation. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Don't call onClose() immediately to prevent navigation away from quotations
    // Let the parent component handle it properly
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Customer Info (merged customer, contact, and location)
        return (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Customer details, contact information, and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Customer Details</h3>
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer full name"
                    className={errors.customerName ? 'border-red-500' : ''}
                    data-testid="input-customer-name"
                  />
                  {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="customer@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                      data-testid="input-email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+92-XXX-XXXXXXX"
                      className={errors.phone ? 'border-red-500' : ''}
                      data-testid="input-phone"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Quotation Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4 border-t pt-4 pb-4">
                <h3 className="text-lg font-semibold text-gray-700">Location Details</h3>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city || ''} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger className={errors.city ? 'border-red-500' : ''} data-testid="select-city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {/* Major Cities First */}
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                      <SelectItem value="karachi">Karachi</SelectItem>
                      <SelectItem value="lahore">Lahore</SelectItem>
                      <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="faisalabad">Faisalabad</SelectItem>
                      <SelectItem value="multan">Multan</SelectItem>
                      <SelectItem value="peshawar">Peshawar</SelectItem>
                      <SelectItem value="quetta">Quetta</SelectItem>
                      
                      {/* All Cities A-Z */}
                      <SelectItem value="abbottabad">Abbottabad</SelectItem>
                      <SelectItem value="ahmedpur-east">Ahmedpur East</SelectItem>
                      <SelectItem value="arifwala">Arifwala</SelectItem>
                      <SelectItem value="attock">Attock</SelectItem>
                      <SelectItem value="badin">Badin</SelectItem>
                      <SelectItem value="bahawalnagar">Bahawalnagar</SelectItem>
                      <SelectItem value="bahawalpur">Bahawalpur</SelectItem>
                      <SelectItem value="bannu">Bannu</SelectItem>
                      <SelectItem value="batkhela">Batkhela</SelectItem>
                      <SelectItem value="bhakkar">Bhakkar</SelectItem>
                      <SelectItem value="bhalwal">Bhalwal</SelectItem>
                      <SelectItem value="bhimber">Bhimber</SelectItem>
                      <SelectItem value="burewala">Burewala</SelectItem>
                      <SelectItem value="chakwal">Chakwal</SelectItem>
                      <SelectItem value="chaman">Chaman</SelectItem>
                      <SelectItem value="charsadda">Charsadda</SelectItem>
                      <SelectItem value="chiniot">Chiniot</SelectItem>
                      <SelectItem value="chishtian">Chishtian</SelectItem>
                      <SelectItem value="chitral">Chitral</SelectItem>
                      <SelectItem value="dadu">Dadu</SelectItem>
                      <SelectItem value="daska">Daska</SelectItem>
                      <SelectItem value="dera-ghazi-khan">Dera Ghazi Khan</SelectItem>
                      <SelectItem value="dera-ismail-khan">Dera Ismail Khan</SelectItem>
                      <SelectItem value="dijkot">Dijkot</SelectItem>
                      <SelectItem value="dinga">Dinga</SelectItem>
                      <SelectItem value="dipalpur">Dipalpur</SelectItem>
                      <SelectItem value="dir">Dir</SelectItem>
                      <SelectItem value="drosh">Drosh</SelectItem>
                      <SelectItem value="fateh-jang">Fateh Jang</SelectItem>
                      <SelectItem value="ghakhar-mandi">Ghakhar Mandi</SelectItem>
                      <SelectItem value="ghotki">Ghotki</SelectItem>
                      <SelectItem value="gilgit">Gilgit</SelectItem>
                      <SelectItem value="gojra">Gojra</SelectItem>
                      <SelectItem value="gujranwala">Gujranwala</SelectItem>
                      <SelectItem value="gujrat">Gujrat</SelectItem>
                      <SelectItem value="gwadar">Gwadar</SelectItem>
                      <SelectItem value="hafizabad">Hafizabad</SelectItem>
                      <SelectItem value="hangu">Hangu</SelectItem>
                      <SelectItem value="haripur">Haripur</SelectItem>
                      <SelectItem value="harunabad">Harunabad</SelectItem>
                      <SelectItem value="hasilpur">Hasilpur</SelectItem>
                      <SelectItem value="haveli-lakha">Haveli Lakha</SelectItem>
                      <SelectItem value="hub">Hub</SelectItem>
                      <SelectItem value="hunza">Hunza</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="jacobabad">Jacobabad</SelectItem>
                      <SelectItem value="jagraon">Jagraon</SelectItem>
                      <SelectItem value="jahaniya">Jahaniya</SelectItem>
                      <SelectItem value="jalalpur">Jalalpur</SelectItem>
                      <SelectItem value="jalalpur-jattan">Jalalpur Jattan</SelectItem>
                      <SelectItem value="jampur">Jampur</SelectItem>
                      <SelectItem value="jamshoro">Jamshoro</SelectItem>
                      <SelectItem value="jaranwala">Jaranwala</SelectItem>
                      <SelectItem value="jatoi">Jatoi</SelectItem>
                      <SelectItem value="jauharabad">Jauharabad</SelectItem>
                      <SelectItem value="jhang">Jhang</SelectItem>
                      <SelectItem value="jhelum">Jhelum</SelectItem>
                      <SelectItem value="kalabagh">Kalabagh</SelectItem>
                      <SelectItem value="kalat">Kalat</SelectItem>
                      <SelectItem value="kamalia">Kamalia</SelectItem>
                      <SelectItem value="kamoke">Kamoke</SelectItem>
                      <SelectItem value="kandhkot">Kandhkot</SelectItem>
                      <SelectItem value="karak">Karak</SelectItem>
                      <SelectItem value="kashmor">Kashmor</SelectItem>
                      <SelectItem value="kasur">Kasur</SelectItem>
                      <SelectItem value="khairpur">Khairpur</SelectItem>
                      <SelectItem value="khanpur">Khanpur</SelectItem>
                      <SelectItem value="kharian">Kharian</SelectItem>
                      <SelectItem value="kharmang">Kharmang</SelectItem>
                      <SelectItem value="khushab">Khushab</SelectItem>
                      <SelectItem value="khuzdar">Khuzdar</SelectItem>
                      <SelectItem value="kohat">Kohat</SelectItem>
                      <SelectItem value="kohistan">Kohistan</SelectItem>
                      <SelectItem value="kotli">Kotli</SelectItem>
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
                      <SelectItem value="pishin">Pishin</SelectItem>
                      <SelectItem value="rahim-yar-khan">Rahim Yar Khan</SelectItem>
                      <SelectItem value="rawalakot">Rawalakot</SelectItem>
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
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="society">Society/Area</Label>
                  <Input
                    id="society"
                    value={formData.society}
                    onChange={(e) => handleInputChange('society', e.target.value)}
                    placeholder="Enter society or area name"
                    data-testid="input-society"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Property Info (merged property, house dimensions, and roof details)
        return (
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Property type, address, house dimensions, and roof details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Property Details</h3>
                <div>
                  <Label htmlFor="propertyAddress">Property Address *</Label>
                  <Textarea
                    id="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    placeholder="Enter complete property address"
                    className={errors.propertyAddress ? 'border-red-500' : ''}
                    data-testid="textarea-property-address"
                  />
                  {errors.propertyAddress && <p className="text-red-500 text-sm mt-1">{errors.propertyAddress}</p>}
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''} data-testid="select-property-type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
                </div>
              </div>

              {/* House Dimensions Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">House Dimensions</h3>
                <div>
                  <Label htmlFor="houseDimension">House Size</Label>
                  <Select value={formData.houseDimension} onValueChange={(value) => handleInputChange('houseDimension', value)}>
                    <SelectTrigger data-testid="select-house-dimension">
                      <SelectValue placeholder="Select house size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5marla">5 Marla</SelectItem>
                      <SelectItem value="10marla">10 Marla</SelectItem>
                      <SelectItem value="1kanal">1 Kanal</SelectItem>
                      <SelectItem value="2kanal">2 Kanal</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.houseDimension === 'custom' && (
                  <div>
                    <Label htmlFor="customDimension">Custom Dimension</Label>
                    <Input
                      id="customDimension"
                      value={formData.customDimension}
                      onChange={(e) => handleInputChange('customDimension', e.target.value)}
                      placeholder="e.g., 40x60 feet"
                      data-testid="input-custom-dimension"
                    />
                  </div>
                )}
              </div>

              {/* Roof Details Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Roof Details</h3>
                <div>
                  <Label htmlFor="roofType">Roof Type *</Label>
                  <Select value={formData.roofType} onValueChange={(value) => handleInputChange('roofType', value)}>
                    <SelectTrigger className={errors.roofType ? 'border-red-500' : ''} data-testid="select-roof-type">
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Roof</SelectItem>
                      <SelectItem value="sloped">Sloped Roof</SelectItem>
                      <SelectItem value="shed">Shed Type</SelectItem>
                      <SelectItem value="tile">Tile Roof</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofType && <p className="text-red-500 text-sm mt-1">{errors.roofType}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roofLength">Roof Length (feet)</Label>
                    <Input
                      id="roofLength"
                      type="number"
                      value={formData.roofLength}
                      onChange={(e) => handleInputChange('roofLength', e.target.value)}
                      placeholder="Length in feet"
                      data-testid="input-roof-length"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roofWidth">Roof Width (feet)</Label>
                    <Input
                      id="roofWidth"
                      type="number"
                      value={formData.roofWidth}
                      onChange={(e) => handleInputChange('roofWidth', e.target.value)}
                      placeholder="Width in feet"
                      data-testid="input-roof-width"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // System Components
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Components</CardTitle>
              <CardDescription>Solar panels and equipment selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Installation Type Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Installation Type</h3>
                <div>
                  <Label htmlFor="installationType">Installation Type *</Label>
                  <Select value={formData.installationType} onValueChange={(value) => handleInputChange('installationType', value)}>
                    <SelectTrigger className={errors.installationType ? 'border-red-500' : ''} data-testid="select-installation-type">
                      <SelectValue placeholder="Select installation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongrid">On-Grid System</SelectItem>
                      <SelectItem value="offgrid">Off-Grid System</SelectItem>
                      <SelectItem value="hybrid">Hybrid System</SelectItem>
                      <SelectItem value="netmetering">Net Metering</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.installationType && <p className="text-red-500 text-sm mt-1">{errors.installationType}</p>}
                </div>
              </div>

              {/* Solar Panel Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Solar Panel</h3>
                <div>
                  <Label htmlFor="solarPanel">Solar Panel Brand *</Label>
                  <Select value={formData.solarPanel} onValueChange={(value) => handleInputChange('solarPanel', value)}>
                    <SelectTrigger className={errors.solarPanel ? 'border-red-500' : ''} data-testid="select-solar-panel">
                      <SelectValue placeholder="Select solar panel brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="longi">Longi</SelectItem>
                      <SelectItem value="jinko">Jinko</SelectItem>
                      <SelectItem value="canadian-solar">Canadian Solar</SelectItem>
                      <SelectItem value="ja-solar">JA Solar</SelectItem>
                      <SelectItem value="astronergy">Astronergy</SelectItem>
                      <SelectItem value="trina-solar">Trina Solar</SelectItem>
                      <SelectItem value="risen">Risen</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.solarPanel && <p className="text-red-500 text-sm mt-1">{errors.solarPanel}</p>}
                </div>
                
                {formData.solarPanel === 'other' && (
                  <div>
                    <Label htmlFor="solarPanelOther">Specify Panel Type *</Label>
                    <Input
                      id="solarPanelOther"
                      value={formData.solarPanelOther}
                      onChange={(e) => handleInputChange('solarPanelOther', e.target.value)}
                      placeholder="Specify other panel type"
                      className={errors.solarPanelOther ? 'border-red-500' : ''}
                      data-testid="input-solar-panel-other"
                    />
                    {errors.solarPanelOther && <p className="text-red-500 text-sm mt-1">{errors.solarPanelOther}</p>}
                  </div>
                )}
              </div>

              {/* Battery Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Battery System</h3>
                <div>
                  <Label htmlFor="batteryType">Battery Type *</Label>
                  <Select value={formData.batteryType} onValueChange={(value) => handleInputChange('batteryType', value)}>
                    <SelectTrigger className={errors.batteryType ? 'border-red-500' : ''} data-testid="select-battery-type">
                      <SelectValue placeholder="Select battery type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lithium-ion">Lithium Ion</SelectItem>
                      <SelectItem value="tubular">Tubular</SelectItem>
                      <SelectItem value="lead-acid">Lead Acid</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.batteryType && <p className="text-red-500 text-sm mt-1">{errors.batteryType}</p>}
                </div>
                
                {formData.batteryType === 'other' && (
                  <div>
                    <Label htmlFor="batteryTypeOther">Specify Battery Type *</Label>
                    <Input
                      id="batteryTypeOther"
                      value={formData.batteryTypeOther}
                      onChange={(e) => handleInputChange('batteryTypeOther', e.target.value)}
                      placeholder="Specify other battery type"
                      className={errors.batteryTypeOther ? 'border-red-500' : ''}
                      data-testid="input-battery-type-other"
                    />
                    {errors.batteryTypeOther && <p className="text-red-500 text-sm mt-1">{errors.batteryTypeOther}</p>}
                  </div>
                )}
                
                {formData.batteryType !== 'none' && (
                  <div>
                    <Label htmlFor="batteryCapacity">Battery Capacity *</Label>
                    <Select value={formData.batteryCapacity} onValueChange={(value) => handleInputChange('batteryCapacity', value)}>
                      <SelectTrigger className={errors.batteryCapacity ? 'border-red-500' : ''} data-testid="select-battery-capacity">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {/* Lithium Ion Battery Options */}
                      {formData.batteryType === 'lithium-ion' && (
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
                      {formData.batteryType === 'tubular' && (
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
                      {formData.batteryType === 'lead-acid' && (
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
                      {formData.batteryType === 'none' && (
                        <SelectItem value="no-battery">No Battery Required</SelectItem>
                      )}
                      
                      {/* Other battery type */}
                      {formData.batteryType === 'other' && (
                        <SelectItem value="other">Other</SelectItem>
                      )}
                      
                      {/* Default case when no battery type is selected */}
                      {!formData.batteryType && (
                        <SelectItem value="select-battery-type-first" disabled>Please select battery type first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.batteryCapacity && <p className="text-red-500 text-sm mt-1">{errors.batteryCapacity}</p>}
                  </div>
                )}
                
                {formData.batteryCapacity === 'other' && (
                  <div>
                    <Label htmlFor="batteryCapacityOther">Specify Capacity (AH) *</Label>
                    <Input
                      id="batteryCapacityOther"
                      value={formData.batteryCapacityOther}
                      onChange={(e) => handleInputChange('batteryCapacityOther', e.target.value)}
                      placeholder="Enter capacity in AH"
                      className={errors.batteryCapacityOther ? 'border-red-500' : ''}
                      data-testid="input-battery-capacity-other"
                    />
                    {errors.batteryCapacityOther && <p className="text-red-500 text-sm mt-1">{errors.batteryCapacityOther}</p>}
                  </div>
                )}
              </div>

              {/* Inverter Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Inverter</h3>
                <div>
                  <Label htmlFor="inverterBrand">Inverter Brand *</Label>
                  <Select value={formData.inverterBrand} onValueChange={(value) => handleInputChange('inverterBrand', value)}>
                    <SelectTrigger className={errors.inverterBrand ? 'border-red-500' : ''} data-testid="select-inverter-brand">
                      <SelectValue placeholder="Select inverter brand" />
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
                  {errors.inverterBrand && <p className="text-red-500 text-sm mt-1">{errors.inverterBrand}</p>}
                </div>
                
                {formData.inverterBrand === 'other' && (
                  <div>
                    <Label htmlFor="inverterBrandOther">Specify Inverter Brand *</Label>
                    <Input
                      id="inverterBrandOther"
                      value={formData.inverterBrandOther}
                      onChange={(e) => handleInputChange('inverterBrandOther', e.target.value)}
                      placeholder="Specify other inverter brand"
                      className={errors.inverterBrandOther ? 'border-red-500' : ''}
                      data-testid="input-inverter-brand-other"
                    />
                    {errors.inverterBrandOther && <p className="text-red-500 text-sm mt-1">{errors.inverterBrandOther}</p>}
                  </div>
                )}
              </div>

              {/* Additional Components */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Additional Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="solarStructure">Solar Structure Type</Label>
                    <Input
                      id="solarStructure"
                      value={formData.solarStructure}
                      onChange={(e) => handleInputChange('solarStructure', e.target.value)}
                      placeholder="e.g., Fixed, Tracking"
                      data-testid="input-solar-structure"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numberOfStands">Number of Stands</Label>
                    <Input
                      id="numberOfStands"
                      type="number"
                      value={formData.numberOfStands}
                      onChange={(e) => handleInputChange('numberOfStands', e.target.value)}
                      placeholder="Number of stands"
                      data-testid="input-number-of-stands"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="netMetering">Net Metering</Label>
                    <Select value={formData.netMetering} onValueChange={(value) => handleInputChange('netMetering', value)}>
                      <SelectTrigger data-testid="select-net-metering">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="disco">DISCO</Label>
                    <Select value={formData.disco} onValueChange={(value) => handleInputChange('disco', value)}>
                      <SelectTrigger data-testid="select-disco">
                        <SelectValue placeholder="Select DISCO" />
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
                  
                  <div>
                    <Label htmlFor="transportation">Transportation & Labour</Label>
                    <Select value={formData.transportation} onValueChange={(value) => handleInputChange('transportation', value)}>
                      <SelectTrigger data-testid="select-transportation">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="installationType">Installation Type</Label>
                    <Select value={formData.installationType || ''} onValueChange={(value) => handleInputChange('installationType', value)}>
                      <SelectTrigger data-testid="select-installation-type">
                        <SelectValue placeholder="Select installation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongrid">On-Grid</SelectItem>
                        <SelectItem value="offgrid">Off-Grid</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // System Specifications
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Specifications</CardTitle>
              <CardDescription>System size and capacity details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemSize">System Size (kW)</Label>
                  <Input
                    id="systemSize"
                    type="text"
                    value={formData.systemSize}
                    onChange={(e) => handleInputChange('systemSize', e.target.value)}
                    placeholder="e.g., 5.5"
                    data-testid="input-system-size"
                  />
                </div>
                
                <div>
                  <Label htmlFor="panelsRequired">Panels Required</Label>
                  <Input
                    id="panelsRequired"
                    type="text"
                    value={formData.panelsRequired}
                    onChange={(e) => handleInputChange('panelsRequired', e.target.value)}
                    placeholder="e.g., 10"
                    data-testid="input-panels-required"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inverterSize">Inverter Size (kW)</Label>
                  <Input
                    id="inverterSize"
                    type="text"
                    value={formData.inverterSize}
                    onChange={(e) => handleInputChange('inverterSize', e.target.value)}
                    placeholder="e.g., 6"
                    data-testid="input-inverter-size"
                  />
                </div>
                
                <div>
                  <Label htmlFor="batteryCapacityCalc">Battery Capacity (Calculated)</Label>
                  <Input
                    id="batteryCapacityCalc"
                    type="text"
                    value={formData.batteryCapacityCalc}
                    onChange={(e) => handleInputChange('batteryCapacityCalc', e.target.value)}
                    placeholder="e.g., 20"
                    data-testid="input-battery-capacity-calc"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5: // Energy Requirements
        return (
          <Card>
            <CardHeader>
              <CardTitle>Energy Requirements</CardTitle>
              <CardDescription>Energy consumption analysis and load details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="energyConsumption">Monthly Energy Consumption (kWh) *</Label>
                  <Input
                    id="energyConsumption"
                    type="text"
                    value={formData.energyConsumption}
                    onChange={(e) => handleInputChange('energyConsumption', e.target.value)}
                    placeholder="e.g., 800"
                    className={errors.energyConsumption ? 'border-red-500' : ''}
                    data-testid="input-energy-consumption"
                  />
                  {errors.energyConsumption && <p className="text-red-500 text-sm mt-1">{errors.energyConsumption}</p>}
                </div>

                <div>
                  <Label htmlFor="totalLoad">Total Load (Watts)</Label>
                  <Input
                    id="totalLoad"
                    type="text"
                    value={formData.totalLoad}
                    onChange={(e) => handleInputChange('totalLoad', e.target.value)}
                    placeholder="e.g., 5000"
                    data-testid="input-total-load"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="items">System Items/Components</Label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="ac1Ton">1.5 Ton AC</Label>
                    <Input
                      id="ac15Ton"
                      type="number"
                      value={formData.ac15Ton || ''}
                      onChange={(e) => handleInputChange('ac15Ton', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ac1Ton">1 Ton AC</Label>
                    <Input
                      id="ac1Ton"
                      type="number"
                      value={formData.ac1Ton || ''}
                      onChange={(e) => handleInputChange('ac1Ton', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fans">Fans</Label>
                    <Input
                      id="fans"
                      type="number"
                      value={formData.fans || ''}
                      onChange={(e) => handleInputChange('fans', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refrigerator">Refrigerator</Label>
                    <Input
                      id="refrigerator"
                      type="number"
                      value={formData.refrigerator || ''}
                      onChange={(e) => handleInputChange('refrigerator', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lights">Lights</Label>
                    <Input
                      id="lights"
                      type="number"
                      value={formData.lights || ''}
                      onChange={(e) => handleInputChange('lights', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motors">Motors</Label>
                    <Input
                      id="motors"
                      type="number"
                      value={formData.motors || ''}
                      onChange={(e) => handleInputChange('motors', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iron">Iron</Label>
                    <Input
                      id="iron"
                      type="number"
                      value={formData.iron || ''}
                      onChange={(e) => handleInputChange('iron', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="washingMachine">Washing Machine</Label>
                    <Input
                      id="washingMachine"
                      type="number"
                      value={formData.washingMachine || ''}
                      onChange={(e) => handleInputChange('washingMachine', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="computerTV">Computer/TV</Label>
                    <Input
                      id="computerTV"
                      type="number"
                      value={formData.computerTV || ''}
                      onChange={(e) => handleInputChange('computerTV', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cctv">CCTV</Label>
                    <Input
                      id="cctv"
                      type="number"
                      value={formData.cctv || ''}
                      onChange={(e) => handleInputChange('cctv', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterDispenser">Water Dispenser</Label>
                    <Input
                      id="waterDispenser"
                      type="number"
                      value={formData.waterDispenser || ''}
                      onChange={(e) => handleInputChange('waterDispenser', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other">Other</Label>
                    <Input
                      id="other"
                      type="number"
                      value={formData.other || ''}
                      onChange={(e) => handleInputChange('other', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                {formData.other && parseInt(formData.other) > 0 && (
                  <div className="mt-2">
                    <Label htmlFor="otherDescription">Other Description</Label>
                    <Input
                      id="otherDescription"
                      value={formData.otherDescription || ''}
                      onChange={(e) => handleInputChange('otherDescription', e.target.value)}
                      placeholder="Describe other appliances..."
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="netMetering">Net Metering</Label>
                <Select value={formData.netMetering} onValueChange={(value) => handleInputChange('netMetering', value)}>
                  <SelectTrigger data-testid="select-net-metering">
                    <SelectValue placeholder="Select net metering option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Net Metering Available</SelectItem>
                    <SelectItem value="no">No - No Net Metering</SelectItem>
                    <SelectItem value="pending">Pending Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 6: // Financial Details (merged financial and notes)
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Pricing, timeline, and additional notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Financial Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Pricing & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Cost (PKR) *</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                      placeholder="e.g., 500000"
                      className={errors.estimatedCost ? 'border-red-500' : ''}
                      data-testid="input-estimated-cost"
                    />
                    {errors.estimatedCost && <p className="text-red-500 text-sm mt-1">{errors.estimatedCost}</p>}
                  </div>

                  <div>
                    <Label htmlFor="amount">Final Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="e.g., 480000"
                      data-testid="input-amount"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="installationTimeline">Installation Timeline</Label>
                  <Select value={formData.installationTimeline} onValueChange={(value) => handleInputChange('installationTimeline', value)}>
                    <SelectTrigger data-testid="select-installation-timeline">
                      <SelectValue placeholder="Select installation timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2-weeks">1-2 Weeks</SelectItem>
                      <SelectItem value="2-4-weeks">2-4 Weeks</SelectItem>
                      <SelectItem value="1-2-months">1-2 Months</SelectItem>
                      <SelectItem value="2-3-months">2-3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Additional Notes</h3>
                <div>
                  <Label htmlFor="notes">Notes & Comments</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes, special requirements, or comments..."
                    rows={4}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 7: // Status
        return (
          <Card>
            <CardHeader>
              <CardTitle>Quotation Status</CardTitle>
              <CardDescription>Update quotation approval status and administrative actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Approval Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Current Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select quotation status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>Pending Review</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>Approved</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span>Rejected</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="converted">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>Converted to Installation</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                    </div>

                    {/* Status Badge Display */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Current Status Display:</h4>
                      <Badge 
                        className={
                          formData.status === 'approved' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                          formData.status === 'pending' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                          formData.status === 'rejected' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                          formData.status === 'converted' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                          'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                        }
                      >
                        {formData.status || 'pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-900 mb-2">Status Information</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span><strong>Pending:</strong> Awaiting admin review and approval</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span><strong>Approved:</strong> Quotation approved, ready for customer acceptance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span><strong>Rejected:</strong> Quotation declined or needs revision</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span><strong>Converted:</strong> Successfully converted to installation project</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Impact Notice */}
                    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Customer Dashboard Impact</p>
                          <p>Changes to this status will be immediately reflected on the customer's dashboard, affecting their quotation tracking and next steps.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Actions */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Administrative Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Last Modified</Label>
                    <p className="text-gray-900 text-sm">
                      {quotation?.updatedAt ? new Date(quotation.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not available'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                    <p className="text-gray-900 text-sm">
                      {quotation?.createdAt ? new Date(quotation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="quotation-modal max-w-6xl h-[95vh] overflow-hidden flex flex-col" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="shrink-0 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {quotation ? 'Edit Quotation' : 'Create New Quotation'}
                </DialogTitle>
                {quotation && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Quotation ID:</span> {quotation.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Date Created:</span> {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
              <Badge variant="outline" className="ml-4 shrink-0">
                {quotation ? `Status: ${quotation.status || 'pending'}` : 'New Quotation'}
              </Badge>
            </div>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="shrink-0 px-1 py-3 bg-gray-50 border-y">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">
                Step {currentStep} of {quotationSteps.length}: {quotationSteps[currentStep - 1]?.title}
              </div>
              <Badge variant="secondary" className="ml-2">
                {Math.round((currentStep / quotationSteps.length) * 100)}% Complete
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / quotationSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tab Navigation - No horizontal scroll */}
          <div className="shrink-0 border-b bg-white">
            <div className="w-full overflow-x-hidden">
              <div className="flex space-x-1 px-2">
                {quotationSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      currentStep === step.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    data-testid={`tab-step-${step.id}`}
                  >
                    {step.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content - Scroll inside content area */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="h-full overflow-y-auto px-6 py-4" 
              style={{
                maxHeight: 'calc(100vh - 320px)',
                scrollbarWidth: 'auto',
                scrollbarColor: '#3b82f6 #eff6ff'
              }}
            >
              <div className="pb-6">
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Always visible */}
          <div className="shrink-0 border-t bg-gray-50 p-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                  data-testid="button-previous"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={currentStep === quotationSteps.length}
                  className="flex items-center space-x-2"
                  data-testid="button-next"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-save"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Quotation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={savedAsEdit ? "Quotation Updated Successfully" : "Quotation Created"}
        description={savedAsEdit ? 
          `All quotation changes have been saved and are now active in the system.` : 
          "A new quotation has been created successfully. You can now track its progress."
        }
        continueText="Continue"
      />
    </>
  );
}