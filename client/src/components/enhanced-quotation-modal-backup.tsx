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
import { SuccessModal } from '@/components/crud-modals';
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

// Define the 6 steps for the quotation wizard (merged tabs as requested)
const quotationSteps = [
  { id: 1, title: 'Customer Info', description: 'Customer details, contact info, and location' },
  { id: 2, title: 'Property Info', description: 'Property type, address, house dimensions, and roof details' },
  { id: 3, title: 'Energy Requirements', description: 'Energy consumption analysis' },
  { id: 4, title: 'System Components', description: 'Solar panels and equipment' },
  { id: 5, title: 'System Specifications', description: 'System size and capacity' },
  { id: 6, title: 'Financial Details', description: 'Pricing, timeline, and notes' },
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
  const [formData, setFormData] = useState(() => ({
    // Step 1: Customer Info (merged customer, contact, and location)
    customerName: '',
    status: 'pending',
    phone: '',
    email: '',
    city: '',
    society: '',
    // Step 2: Property Info (merged property, house dimensions, and roof details)
    propertyAddress: '',
    propertyType: '',
    houseDimension: '',
    customDimension: '',
    roofType: '',
    roofLength: '',
    roofWidth: '',
    // Step 3: Energy Requirements
    energyConsumption: '',
    totalLoad: '',
    // Step 4: System Components
    solarPanel: '',
    batteryType: '',
    inverterBrand: '',
    // Step 5: System Specifications
    systemSize: '',
    items: '',
    netMetering: '',
    // Step 6: Financial Details (merged financial and notes)
    estimatedCost: '',
    amount: '',
    installationTimeline: '',
    notes: '',
  }));

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
      case 3: // Energy Requirements
        if (!formData.energyConsumption.trim()) newErrors.energyConsumption = 'Energy consumption is required';
        break;
      case 6: // Financial Details
        if (!formData.estimatedCost.trim()) newErrors.estimatedCost = 'Estimated cost is required';
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

      setFormData({
        // Step 1: Customer Info (merged customer, contact, and location)
        customerName: quotation.customerName || '',
        status: quotation.status || 'pending',
        phone: quotation.phone || '',
        email: customerEmail,
        city: quotation.city || '',
        society: quotation.society || '',
        // Step 2: Property Info (merged property, house dimensions, and roof details)
        propertyAddress: quotation.propertyAddress || '',
        propertyType: quotation.propertyType || '',
        houseDimension: quotation.houseDimension || '',
        customDimension: quotation.customDimension || '',
        roofType: quotation.roofType || '',
        roofLength: quotation.roofLength || '',
        roofWidth: quotation.roofWidth || '',
        // Step 3: Energy Requirements
        energyConsumption: quotation.energyConsumption || '',
        totalLoad: quotation.totalLoad || '',
        // Step 4: System Components
        solarPanel: quotation.solarPanel || '',
        batteryType: quotation.batteryType || '',
        inverterBrand: quotation.inverterBrand || '',
        // Step 5: System Specifications
        systemSize: quotation.systemSize || '',
        items: quotation.items || '',
        netMetering: quotation.netMetering || '',
        // Step 6: Financial Details (merged financial and notes)
        estimatedCost: quotation.estimatedCost || '',
        amount: quotation.amount || '',
        installationTimeline: quotation.installationTimeline || '',
        notes: quotation.notes || '',
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [quotation, localUsersData]);

  const handleSave = async () => {
    // Validate all steps before saving
    const allStepsValid = quotationSteps.every((_, index) => validateStep(index + 1));
    if (!allStepsValid) {
      toast({
        title: "Validation Failed",
        description: "Please fix all validation errors before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Include quotation ID if editing
      const dataToSave = quotation ? { ...formData, id: quotation.id } : formData;
      await onSave(dataToSave);
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
    onClose();
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
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700">Location Details</h3>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger className={errors.city ? 'border-red-500' : ''} data-testid="select-city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                      <SelectItem value="lahore">Lahore</SelectItem>
                      <SelectItem value="karachi">Karachi</SelectItem>
                      <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="faisalabad">Faisalabad</SelectItem>
                      <SelectItem value="peshawar">Peshawar</SelectItem>
                      <SelectItem value="quetta">Quetta</SelectItem>
                      <SelectItem value="multan">Multan</SelectItem>
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
                    placeholder="e.g., DHA Phase 5, F-10, Gulshan-e-Iqbal"
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
                      <SelectItem value="5-marla">5 Marla</SelectItem>
                      <SelectItem value="10-marla">10 Marla</SelectItem>
                      <SelectItem value="1-kanal">1 Kanal</SelectItem>
                      <SelectItem value="2-kanal">2 Kanal</SelectItem>
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

      case 3: // Energy Requirements
        return (
          <Card>
            <CardHeader>
              <CardTitle>Energy Requirements</CardTitle>
              <CardDescription>Energy consumption analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="energyConsumption">Monthly Energy Consumption (kWh) *</Label>
                <Input
                  id="energyConsumption"
                  type="number"
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
                  type="number"
                  value={formData.totalLoad}
                  onChange={(e) => handleInputChange('totalLoad', e.target.value)}
                  placeholder="e.g., 5000"
                  data-testid="input-total-load"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4: // System Components
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Components</CardTitle>
              <CardDescription>Solar panels and equipment selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solarPanel">Solar Panel Type</Label>
                <Select value={formData.solarPanel} onValueChange={(value) => handleInputChange('solarPanel', value)}>
                  <SelectTrigger data-testid="select-solar-panel">
                    <SelectValue placeholder="Select solar panel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                    <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                    <SelectItem value="thin-film">Thin Film</SelectItem>
                    <SelectItem value="bifacial">Bifacial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="batteryType">Battery Type</Label>
                <Select value={formData.batteryType} onValueChange={(value) => handleInputChange('batteryType', value)}>
                  <SelectTrigger data-testid="select-battery-type">
                    <SelectValue placeholder="Select battery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lithium">Lithium Ion</SelectItem>
                    <SelectItem value="lead-acid">Lead Acid</SelectItem>
                    <SelectItem value="gel">Gel Battery</SelectItem>
                    <SelectItem value="agm">AGM Battery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="inverterBrand">Inverter Brand</Label>
                <Select value={formData.inverterBrand} onValueChange={(value) => handleInputChange('inverterBrand', value)}>
                  <SelectTrigger data-testid="select-inverter-brand">
                    <SelectValue placeholder="Select inverter brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goodwe">GoodWe</SelectItem>
                    <SelectItem value="fronius">Fronius</SelectItem>
                    <SelectItem value="huawei">Huawei</SelectItem>
                    <SelectItem value="sma">SMA</SelectItem>
                    <SelectItem value="growatt">Growatt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 5: // System Specifications
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Specifications</CardTitle>
              <CardDescription>System size and capacity details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="systemSize">System Size (kW)</Label>
                <Input
                  id="systemSize"
                  type="number"
                  value={formData.systemSize}
                  onChange={(e) => handleInputChange('systemSize', e.target.value)}
                  placeholder="e.g., 5.5"
                  data-testid="input-system-size"
                />
              </div>

              <div>
                <Label htmlFor="items">System Items/Components</Label>
                <Textarea
                  id="items"
                  value={formData.items}
                  onChange={(e) => handleInputChange('items', e.target.value)}
                  placeholder="List all system components..."
                  data-testid="textarea-items"
                />
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

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{quotation ? 'Edit Quotation' : 'Create New Quotation'}</span>
              {quotation && (
                <Badge variant="outline" className="text-xs">
                  ID: {quotation.id?.substring(0, 8)}...
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="px-1 py-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Step {currentStep} of {quotationSteps.length}: {quotationSteps[currentStep - 1]?.title}
              </div>
              <div className="text-xs text-gray-500">
                {quotationSteps[currentStep - 1]?.description}
              </div>
            </div>

            {/* Tab Navigation with horizontal scroll */}
            <div className="flex space-x-2 border-b border-gray-200 mb-4 overflow-x-auto">
              {quotationSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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

          {/* Step Content with Vertical Scroll */}
          <ScrollArea className="flex-1 px-6 max-h-[50vh] overflow-y-auto">
            {renderStepContent()}
          </ScrollArea>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
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

            <div className="flex space-x-2">
              {currentStep < quotationSteps.length ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                  data-testid="button-next"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                  data-testid="button-save"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>{quotation ? 'Update' : 'Create'} Quotation</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={quotation ? "Quotation Updated" : "Quotation Created"}
        message={quotation ? "The quotation has been successfully updated with the new information." : "A new quotation has been created successfully. You can now track its progress."}
      />
    </>
  );
}