import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import NewNavigation from "@/components/new-navigation";
import { ProtectedFeature } from "@/components/protected-feature";
import Footer from "@/components/footer";
import DashboardCard from "@/components/dashboard-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateQuotePDF } from "@/utils/generateQuotePDF";
import { EnhancedQuotationModal } from "@/components/enhanced-quotation-modal";
import { SuccessModal } from "@/components/success-modal";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Validation schemas - Progressive validation to avoid showing all errors at once
const technicianSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must not exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  //phone: z.string().min(10, "Phone number must be at least 10 characters").max(20, "Phone number must not exceed 20 characters"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number must not exceed 20 characters"),
  specialization: z.string().min(1, "Please select a specialization"),
  experience: z.number().min(0, "Experience must be at least 0").max(50, "Experience must not exceed 50 years"),
  certifications: z.string().optional(),
  status: z.string().min(1, "Please select a status"),
}).superRefine((data, ctx) => {
  // Progressive validation - only show next error after previous is fixed
  if (!data.name || data.name.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Full name must be at least 2 characters",
      path: ["name"],
    });
    return; // Stop validation here
  }
  if (!data.email || !z.string().email().safeParse(data.email).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid email address",
      path: ["email"],
    });
    return;
  }
  /*
  if (!data.phone || data.phone.length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone number must be at least 10 characters",
      path: ["phone"],
    });
    return;
  }*/
  if (!data.status) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a status",
      path: ["status"],
    });
    return;
  }
  if (!data.specialization) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a specialization",
      path: ["specialization"],
    });
  }
});

type TechnicianFormData = z.infer<typeof technicianSchema>;

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateInstallationModalOpen, setIsCreateInstallationModalOpen] = useState(false);
  const [assigningTechnician, setAssigningTechnician] = useState<any>(null);
  const [viewingInstallation, setViewingInstallation] = useState<any>(null);
  const [editingInstallation, setEditingInstallation] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [viewingQuotation, setViewingQuotation] = useState<any>(null);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [editingComplaint, setEditingComplaint] = useState<any>(null);
  const [isCreateComplaintModalOpen, setIsCreateComplaintModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState<any>(null);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    continueText?: string;
  }>({ isOpen: false, title: '', description: '', continueText: 'Continue' });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ 
    isOpen: false, 
    title: '', 
    description: '',
    onConfirm: () => {},
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });
  const { toast } = useToast();
  const [technicianTab, setTechnicianTab] = useState("basic");  // controls Create Technician tabs
  
  // Field to tab mapping for technician form
  const technicianFieldToTab: Record<string, string> = {
    name: "basic",
    email: "basic", 
    phone: "basic",
    status: "basic",
    specialization: "professional",
    experience: "professional",
    certifications: "professional"
  };
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  // Form setup for technician creation
  const technicianForm = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    mode: "onSubmit", // Validate on submit first
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      experience: 0,
      certifications: "",
      status: "",
    },
  });

  // Form setup for technician editing
  const editTechnicianForm = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    mode: "onSubmit", // Validate on submit first
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });
  
  const [editTechnicianTab, setEditTechnicianTab] = useState("basic"); // controls Edit Technician tabs

  // Effect to populate edit form when editing a technician
  useEffect(() => {
    if (editingItem && activeModule === 'technicians') {
      console.log('Editing technician item:', editingItem);
      
      // Handle specializations array from backend - use first item or default
      const specialization = Array.isArray(editingItem.specializations) 
        ? editingItem.specializations[0] || ''
        : editingItem.specialization || '';
      
      // Handle certifications array from backend - convert to string
      const certifications = Array.isArray(editingItem.certifications)
        ? editingItem.certifications.join(', ')
        : editingItem.certifications || '';
      
      editTechnicianForm.reset({
        name: editingItem.name || '',
        email: editingItem.email || '',
        phone: editingItem.phone || '',
        specialization: specialization,
        experience: editingItem.experienceYears || editingItem.experience || 0,
        certifications: certifications,
        status: editingItem.status || '',
      });
    }
  }, [editingItem, activeModule, editTechnicianForm]);

  // PDF generation functions for quotations
  const transformQuotationToPDFData = (quotation: any) => {
    // Parse appliances data if it exists
    let loadBreakdown: { item: string; quantity: number; watts: number }[] = [];
    try {
      if (quotation.appliances) {
        const appliances = typeof quotation.appliances === 'string' ? JSON.parse(quotation.appliances) : quotation.appliances;
        loadBreakdown = [
          { item: 'AC 1.5 Ton', quantity: appliances.ac15Ton || 0, watts: (appliances.ac15Ton || 0) * 2000 },
          { item: 'AC 1 Ton', quantity: appliances.ac1Ton || 0, watts: (appliances.ac1Ton || 0) * 1500 },
          { item: 'Fans', quantity: appliances.fans || 0, watts: (appliances.fans || 0) * 100 },
          { item: 'Refrigerator', quantity: appliances.refrigerator || 0, watts: (appliances.refrigerator || 0) * 400 },
          { item: 'Lights', quantity: appliances.lights || 0, watts: (appliances.lights || 0) * 15 },
          { item: 'Motors', quantity: appliances.motors || 0, watts: (appliances.motors || 0) * 1000 },
          { item: 'Iron', quantity: appliances.iron || 0, watts: (appliances.iron || 0) * 1000 },
          { item: 'Washing Machine', quantity: appliances.washingMachine || 0, watts: (appliances.washingMachine || 0) * 800 },
          { item: 'Computer/TV', quantity: appliances.computerTV || 0, watts: (appliances.computerTV || 0) * 300 },
          { item: 'CCTV', quantity: appliances.cctv || 0, watts: (appliances.cctv || 0) * 50 },
          { item: 'Other', quantity: appliances.other || 0, watts: (appliances.other || 0) * 100 }
        ].filter(item => item.quantity > 0);
      }
    } catch (e) {
      console.error('Error parsing appliances data:', e);
    }

    // Parse contact info from notes
    const notes = quotation.notes || '';
    const contactMatch = notes.match(/Contact:\s*([^,]+)/);
    const emailMatch = notes.match(/Email:\s*([^,]+)/);
    const societyMatch = notes.match(/Society:\s*([^,]+)/);
    const roofAreaMatch = notes.match(/Roof Area:\s*([^,]+)/);

    // Calculate some values similar to wizard
    const systemSize = parseFloat(quotation.systemSize || quotation.capacity || 0);
    const totalCost = parseFloat(quotation.estimatedCost || quotation.amount || 0);
    const totalLoad = parseFloat(quotation.totalLoad || 0);
    const panelsRequired = Math.ceil(systemSize * 1000 / 550); // Assuming 550W panels

    return {
      customerName: quotation.customerName,
      customerEmail: emailMatch ? emailMatch[1].trim() : quotation.customerEmail,
      customerPhone: contactMatch ? contactMatch[1].trim() : '',
      customerAddress: quotation.propertyAddress,
      city: societyMatch ? societyMatch[1].trim() : '',
      systemSize: systemSize,
      panelQuantity: panelsRequired,
      inverterSize: parseFloat(quotation.inverterSize || systemSize || 0),
      batteryCapacity: parseFloat(quotation.batteryCapacity || 0),
      totalCost: totalCost,
      totalLoad: totalLoad,
      result: {
        systemSize: systemSize,
        panelsRequired: panelsRequired,
        panelCapacity: 550,
        inverterSize: parseFloat(quotation.inverterSize || systemSize || 0),
        batteryCapacity: parseFloat(quotation.batteryCapacity || 0),
        estimatedCost: totalCost,
        dailyGeneration: systemSize * 5,
        monthlyGeneration: systemSize * 5 * 30,
        yearlyGeneration: systemSize * 5 * 365,
        co2Offset: systemSize * 1.2,
        treesEquivalent: Math.round(systemSize * 1.2 * 40),
        paybackPeriod: 5.5,
        savings25Years: totalCost * 4.5,
        roiPercentage: 450,
      },
      loadBreakdown: loadBreakdown
    };
  };

  const handleDownloadQuotePDF = (quotation: any) => {
    const pdfData = transformQuotationToPDFData(quotation);
    generateQuotePDF(pdfData, false);

    toast({
      title: "PDF Downloaded",
      description: "Quotation report has been downloaded successfully.",
    });
  };

  const handlePrintQuotation = (quotation: any) => {
    const pdfData = transformQuotationToPDFData(quotation);
    generateQuotePDF(pdfData, true);

    toast({
      title: "Print Ready",
      description: "Quotation report opened in new window for printing.",
    });
  };

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const { data: installations } = useQuery({
    queryKey: ["/api/installations"],
    retry: false,
  });

  const { data: complaints } = useQuery({
    queryKey: ["/api/complaints"],
    retry: false,
  });

  const { data: tickets } = useQuery({
    queryKey: ["/api/tickets"],
    retry: false,
  });

  const { data: quotations } = useQuery({
    queryKey: ["/api/quotations"],
    retry: false,
  });

  const { data: technicians } = useQuery({
    queryKey: ["/api/technicians"],
    retry: false,
  });

  const usersArray = Array.isArray(users) ? users : [];
  const servicesArray = Array.isArray(services) ? services : [];
  const installationsArray = Array.isArray(installations) ? installations : [];
  const complaintsArray = Array.isArray(complaints) ? complaints : [];
  const ticketsArray = Array.isArray(tickets) ? tickets : [];
  const quotationsArray = Array.isArray(quotations) ? quotations : [];
  const techniciansArray = Array.isArray(technicians) ? technicians : [];

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "users", label: "Users", icon: "fas fa-users" },
    { id: "services", label: "Services", icon: "fas fa-cogs" },
    { id: "quotations", label: "Quotations", icon: "fas fa-file-invoice-dollar" },
    { id: "installations", label: "Installations", icon: "fas fa-solar-panel" },
    { id: "technicians", label: "Technicians", icon: "fas fa-user-tie" },
    { id: "complaints", label: "Complaints", icon: "fas fa-exclamation-triangle" },
    { id: "tickets", label: "Tickets", icon: "fas fa-ticket-alt" },
  ];

  // Mutation functions for CRUD operations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("/api/users", { method: "POST", body: JSON.stringify(userData) });
      return await response.json();
    },
    onSuccess: (newUser) => {
      setSuccessModal({
        isOpen: true,
        title: "User Created Successfully",
        description: "The new user has been added to the system and can now access their account.",
        continueText: "Continue"
      });
      // Use optimistic update instead of invalidation for better performance
      queryClient.setQueryData(["/api/users"], (oldUsers: any[]) => {
        if (!oldUsers) return [newUser];
        return [...oldUsers, newUser];
      });
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'User update failed');
      }
      
      return result;
    },
    onSuccess: (updatedUser) => {
      setSuccessModal({
        isOpen: true,
        title: "User Updated Successfully",
        description: "All changes have been saved and the user information has been updated.",
        continueText: "Continue"
      });

      // Update cache only on actual success
      queryClient.setQueryData(["/api/users"], (oldUsers: any[]) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
      });

      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update user", 
        variant: "destructive" 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/users/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      // Check if deletion actually succeeded
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Deletion failed');
      }
      
      return { id, result };
    },
    onSuccess: ({ id }) => {
      setSuccessModal({
        isOpen: true,
        title: "User Deleted Successfully",
        description: "The user has been permanently removed from the system.",
        continueText: "Continue"
      });
      // Only update cache on actual success
      queryClient.setQueryData(["/api/users"], (oldUsers: any[]) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.filter(user => user.id !== id);
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete user", 
        variant: "destructive" 
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await apiRequest("/api/services", { method: "POST", body: JSON.stringify(serviceData) });
      return await response.json();
    },
    onSuccess: (newService) => {
      setSuccessModal({
        isOpen: true,
        title: "Service Created Successfully",
        description: "The new service has been added and is now available for installations.",
        continueText: "Continue"
      });

      // Update the cache directly with the new service
      queryClient.setQueryData(["/api/services"], (oldServices: any[]) => {
        if (!oldServices) return [newService];
        return [...oldServices, newService];
      });

      setIsCreateModalOpen(false);
      setFormErrors({});
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create service", variant: "destructive" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(data) });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Service update failed');
      }
      
      return result;
    },
    onSuccess: (updatedService) => {
      setSuccessModal({
        isOpen: true,
        title: "Service Updated Successfully",
        description: "All service changes have been saved and are now active.",
        continueText: "Continue"
      });

      // Update cache only on actual success
      queryClient.setQueryData(["/api/services"], (oldServices: any[]) => {
        if (!oldServices) return oldServices;
        return oldServices.map(service => 
          service.id === updatedService.id ? updatedService : service
        );
      });

      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update service", 
        variant: "destructive" 
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/services/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Service deletion failed');
      }
      
      return { id, result };
    },
    onSuccess: ({ id }) => {
      setSuccessModal({
        isOpen: true,
        title: "Service Deleted Successfully",
        description: "The service has been removed and is no longer available for new installations.",
        continueText: "Continue"
      });
      // Update cache only on actual success
      queryClient.setQueryData(["/api/services"], (oldServices: any[]) => {
        if (!oldServices) return oldServices;
        return oldServices.filter(service => service.id !== id);
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete service", 
        variant: "destructive" 
      });
    },
  });

  // Technician mutation functions
  const createTechnicianMutation = useMutation({
    mutationFn: async (technicianData: TechnicianFormData) => {
      const response = await apiRequest("/api/technicians", { method: "POST", body: JSON.stringify(technicianData) });
      return await response.json();
    },
    onSuccess: async (newTechnician) => {
      setSuccessModal({
        isOpen: true,
        title: "Technician Created Successfully",
        description: "The new technician has been added and is now available for installation assignments.",
        continueText: "Continue"
      });
      
      // Fast optimistic update instead of complex invalidation
      queryClient.setQueryData(["/api/technicians"], (oldTechnicians: any[]) => {
        if (!oldTechnicians) return [newTechnician];
        return [...oldTechnicians, newTechnician];
      });
      
      setIsCreateModalOpen(false);
      technicianForm.reset();
      setTechnicianTab("basic");
    },
    onError: (error: any) => {
      // Navigate to the first error's tab and focus it
      const errors = technicianForm.formState.errors;
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        // Navigate to correct tab
        const targetTab = technicianFieldToTab[firstErrorField] || "basic";
        if (technicianTab !== targetTab) {
          setTechnicianTab(targetTab);
        }
        
        // Get specific error message
        const errorMessage = errors[firstErrorField as keyof typeof errors]?.message || "This field is required";
        
        setTimeout(() => {
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement | null;
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        

      } else {
        toast({ title: "Creation Failed", description: "Failed to create technician", variant: "destructive" });
      }
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/technicians/${id}`, { method: "PUT", body: JSON.stringify(data) });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Technician update failed');
      }
      
      return result;
    },
    onSuccess: (updatedTechnician) => {
      setSuccessModal({
        isOpen: true,
        title: "Technician Updated Successfully",
        description: "All technician information has been updated and saved to the system.",
        continueText: "Continue"
      });

      // Update cache only on actual success
      queryClient.setQueryData(["/api/technicians"], (oldTechnicians: any[]) => {
        if (!oldTechnicians) return oldTechnicians;
        return oldTechnicians.map(technician => 
          technician.id === updatedTechnician.id ? updatedTechnician : technician
        );
      });

      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update technician", 
        variant: "destructive" 
      });
    },
  });

  const deleteTechnicianMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/technicians/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Technician deletion failed');
      }
      
      return { id, result };
    },
    onSuccess: ({ id }) => {
      setSuccessModal({
        isOpen: true,
        title: "Technician Deleted Successfully",
        description: "The technician has been removed from the system and is no longer available for assignments.",
        continueText: "Continue"
      });
      
      // Update cache only on actual success
      queryClient.setQueryData(["/api/technicians"], (oldTechnicians: any[]) => {
        if (!oldTechnicians) return oldTechnicians;
        return oldTechnicians.filter(technician => technician.id !== id);
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete technician", 
        variant: "destructive" 
      });
    },
  });

  // Complaint mutations
  const createComplaintMutation = useMutation({
    mutationFn: async (complaintData: any) => {
      const response = await apiRequest("/api/complaints", { method: "POST", body: JSON.stringify(complaintData) });
      return await response.json();
    },
    onSuccess: async (newComplaint) => {
      setSuccessModal({
        isOpen: true,
        title: "Complaint Created Successfully",
        description: "The new complaint has been recorded and is now available for tracking and resolution.",
        continueText: "Continue"
      });
      
      // Fast optimistic update for complaints
      queryClient.setQueryData(["/api/complaints"], (oldComplaints: any[]) => {
        if (!oldComplaints) return [newComplaint];
        return [...oldComplaints, newComplaint];
      });
      
      setIsCreateComplaintModalOpen(false);
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create complaint", variant: "destructive" });
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/complaints/${id}`, { method: "PUT", body: JSON.stringify(data) });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Complaint update failed');
      }
      
      return { updatedComplaint: result, id, data };
    },
    onSuccess: ({ updatedComplaint, id, data }) => {
      setSuccessModal({
        isOpen: true,
        title: "Complaint Updated Successfully",
        description: "All complaint information has been updated and saved to the system.",
        continueText: "Continue"
      });

      // Update cache only on actual success
      queryClient.setQueryData(["/api/complaints"], (oldComplaints: any[]) => {
        if (!oldComplaints) return oldComplaints;
        return oldComplaints.map(complaint => 
          complaint.id === id ? updatedComplaint : complaint
        );
      });

      setEditingComplaint(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update complaint", 
        variant: "destructive" 
      });
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/complaints/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Complaint deletion failed');
      }
      
      return { id, result };
    },
    onSuccess: ({ id }) => {
      setSuccessModal({
        isOpen: true,
        title: "Complaint Deleted Successfully",
        description: "The complaint has been removed from the system.",
        continueText: "Continue"
      });
      
      // Update cache only on actual success
      queryClient.setQueryData(["/api/complaints"], (oldComplaints: any[]) => {
        if (!oldComplaints) return oldComplaints;
        return oldComplaints.filter(complaint => complaint.id !== id);
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete complaint", 
        variant: "destructive" 
      });
    },
  });

  // Ticket mutations
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await apiRequest("/api/tickets", { method: "POST", body: JSON.stringify(ticketData) });
      return await response.json();
    },
    onSuccess: async (newTicket) => {
      setSuccessModal({
        isOpen: true,
        title: "Ticket Created Successfully",
        description: "The new support ticket has been created and is ready for assignment and resolution.",
        continueText: "Continue"
      });
      
      // Fast optimistic update for tickets
      queryClient.setQueryData(["/api/tickets"], (oldTickets: any[]) => {
        if (!oldTickets) return [newTicket];
        return [...oldTickets, newTicket];
      });

      setIsCreateTicketModalOpen(false);
      setFormErrors({});
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create ticket", variant: "destructive" });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await apiRequest(`/api/tickets/${ticketData.id}`, { method: "PUT", body: JSON.stringify(ticketData) });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Ticket update failed');
      }
      
      return result;
    },
    onSuccess: (updatedTicket) => {
      setSuccessModal({
        isOpen: true,
        title: "Ticket Updated Successfully",
        description: "All ticket changes have been saved and are now active in the system.",
        continueText: "Continue"
      });
      
      // Update cache only on actual success
      queryClient.setQueryData(["/api/tickets"], (oldTickets: any[]) => {
        if (!oldTickets) return oldTickets;
        return oldTickets.map(ticket => 
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        );
      });

      setEditingTicket(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update ticket", 
        variant: "destructive" 
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/tickets/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.message || 'Ticket deletion failed');
      }
      
      return { id, result };
    },
    onSuccess: ({ id }) => {
      setSuccessModal({
        isOpen: true,
        title: "Ticket Deleted Successfully",
        description: "The ticket has been removed from the system.",
        continueText: "Continue"
      });
      
      // Update cache only on actual success
      queryClient.setQueryData(["/api/tickets"], (oldTickets: any[]) => {
        if (!oldTickets) return oldTickets;
        return oldTickets.filter(ticket => ticket.id !== id);
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deletion Failed", 
        description: error.message || "Failed to delete ticket", 
        variant: "destructive" 
      });
    },
  });

  // Quotation mutations
  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      const response = await apiRequest("/api/quotations", { method: "POST", body: JSON.stringify(quotationData) });
      return await response.json();
    },
    onSuccess: (newQuotation) => {
      setSuccessModal({
        isOpen: true,
        title: "Quotation Created Successfully",
        description: "The new quotation has been generated and saved. You can now process or send it to the customer.",
        continueText: "Continue"
      });

      // Update the cache directly with the new quotation
      queryClient.setQueryData(["/api/quotations"], (oldQuotations: any[]) => {
        if (!oldQuotations) return [newQuotation];
        return [...oldQuotations, newQuotation];
      });

      setIsCreateModalOpen(false);
      setFormErrors({});
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create quotation", variant: "destructive" });
    },
  });

  const updateQuotationMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      console.log('Sending quotation update:', quotationData);
      const response = await apiRequest(`/api/quotations/${quotationData.id}`, { method: "PUT", body: JSON.stringify(quotationData) });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    },
    onSuccess: (updatedQuotation) => {
      // Fast optimistic update for quotations
      queryClient.setQueryData(["/api/quotations"], (oldQuotations: any[]) => {
        if (!oldQuotations) return oldQuotations;
        return oldQuotations.map(quotation => 
          quotation.id === updatedQuotation.id ? updatedQuotation : quotation
        );
      });

      setEditingQuotation(null);
      setFormErrors({});
    },
    onError: (error: any) => {
      console.error('Quotation update error:', error);
      toast({ title: "Update Failed", description: `Failed to update quotation: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteQuotationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/quotations/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, deletedId) => {
      setSuccessModal({
        isOpen: true,
        title: "Quotation Deleted Successfully",
        description: "The quotation has been permanently removed from the system.",
        continueText: "Continue"
      });

      // Update the cache directly by removing the deleted quotation
      queryClient.setQueryData(["/api/quotations"], (oldQuotations: any[]) => {
        if (!oldQuotations) return oldQuotations;
        return oldQuotations.filter(quotation => quotation.id !== deletedId);
      });
    },
    onError: () => {
      toast({ title: "Deletion Failed", description: "Failed to delete quotation", variant: "destructive" });
    },
  });

  // Create installation from quotation mutation
  const createInstallationFromQuotation = useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await apiRequest("/api/installations/from-quotation", { method: "POST", body: JSON.stringify({ quotationId }) });
      return response.json();
    },
    onSuccess: () => {
      setSuccessModal({
        isOpen: true,
        title: "Installation Created Successfully",
        description: "Installation successfully created from quotation. You'll be automatically switched to the Installations module to manage it.",
        continueText: "Continue"
      });
      // Fast optimistic update for both caches
      queryClient.invalidateQueries({ queryKey: ["/api/installations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      setActiveModule("installations");
    },
    onError: () => {
      toast({ 
        title: "Creation Failed", 
        description: "Failed to create installation from quotation", 
        variant: "destructive" 
      });
    },
  });

  // Assign technician to installation mutation
  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ installationId, technicianId }: { installationId: string; technicianId: string }) => {
      const response = await apiRequest(`/api/installations/${installationId}/assign-technician`, { method: "PUT", body: JSON.stringify({ technicianId }) });
      return { installationId, technicianId, response };
    },
    onSuccess: ({ installationId, technicianId }) => {
      setSuccessModal({
        isOpen: true,
        title: "Technician Assigned Successfully",
        description: "The technician has been successfully assigned to this installation and can now manage the project.",
        continueText: "Continue"
      });
      // Fast optimistic update for installations
      queryClient.setQueryData(["/api/installations"], (oldInstallations: any[]) => {
        if (!oldInstallations) return oldInstallations;
        return oldInstallations.map(installation => 
          installation.id === installationId ? { ...installation, technician: technicianId } : installation
        );
      });
      setAssigningTechnician(null);
    },
    onError: () => {
      toast({ 
        title: "Assignment Failed", 
        description: "Failed to assign technician to installation", 
        variant: "destructive" 
      });
    },
  });

  // Installation CRUD mutations
  const createInstallationMutation = useMutation({
    mutationFn: async (installationData: any) => {
      const response = await apiRequest("/api/installations", { method: "POST", body: JSON.stringify(installationData) });
      return await response.json();
    },
    onSuccess: (newInstallation) => {
      setSuccessModal({
        isOpen: true,
        title: "Installation Created Successfully",
        description: "The new installation has been scheduled and is ready to be managed by technicians.",
        continueText: "Continue"
      });

      // Update the cache directly with the new installation
      queryClient.setQueryData(["/api/installations"], (oldInstallations: any[]) => {
        if (!oldInstallations) return [newInstallation];
        return [...oldInstallations, newInstallation];
      });

      setIsCreateInstallationModalOpen(false);
      setFormErrors({});
    },
    onError: () => {
      toast({ title: "Creation Failed", description: "Failed to create installation", variant: "destructive" });
    },
  });

  const updateInstallationMutation = useMutation({
    mutationFn: async (installationData: any) => {
      const response = await apiRequest(`/api/installations/${installationData.id}`, { method: "PUT", body: JSON.stringify(installationData) });
      return await response.json();
    },
    onSuccess: (updatedInstallation) => {
      setSuccessModal({
        isOpen: true,
        title: "Installation Updated Successfully",
        description: "All installation changes have been saved and are now active in the system.",
        continueText: "Continue"
      });

      // Update the cache directly with the updated installation
      queryClient.setQueryData(["/api/installations"], (oldInstallations: any[]) => {
        if (!oldInstallations) return oldInstallations;
        return oldInstallations.map(installation => 
          installation.id === updatedInstallation.id ? updatedInstallation : installation
        );
      });

      setEditingInstallation(null);
    },
    onError: () => {
      toast({ title: "Update Failed", description: "Failed to update installation", variant: "destructive" });
    },
  });

  const deleteInstallationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/installations/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, deletedId) => {
      setSuccessModal({
        isOpen: true,
        title: "Installation Deleted Successfully",
        description: "The installation has been permanently removed from the system.",
        continueText: "Continue"
      });

      // Update the cache directly by removing the deleted installation
      queryClient.setQueryData(["/api/installations"], (oldInstallations: any[]) => {
        if (!oldInstallations) return oldInstallations;
        return oldInstallations.filter(installation => installation.id !== deletedId);
      });
    },
    onError: () => {
      toast({ title: "Deletion Failed", description: "Failed to delete installation", variant: "destructive" });
    },
  });

  // Filter and pagination logic
  const getFilteredData = (data: any[], searchFields: string[]) => {
    if (!searchTerm) return data;
    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          // For arrays, search each element
          return value.some(element => 
            element?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        // For non-arrays, use regular string search
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  const getSortedUsers = (users: any[]) => {
    return [...users].sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Reset search and pagination when switching modules
  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    setSearchTerm("");
    setCurrentPage(1);
    setEditingItem(null);
    setIsCreateModalOpen(false);
  };

  // Function to navigate to specific module (simple hyperlink behavior)
  const navigateToModule = (moduleType: string) => {
    setActiveModule(moduleType);
    // Scroll to top when changing modules
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      <ProtectedFeature
        feature="Admin Dashboard"
        title="Admin Access Required"
        description="You need administrator privileges to access this dashboard"
        requireRole="admin"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-4">
              <i className="fas fa-tachometer-alt"></i>
              Admin Dashboard
            </h1>
            <p className="text-xl">Manage your solar energy business operations</p>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h2>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleModuleChange(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                      activeModule === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <i className={`${item.icon} mr-3 w-5`}></i>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {activeModule === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div 
                      className="cursor-pointer transition-all duration-300 hover:bg-green-200 rounded-lg p-1 -m-1 hover:scale-105"
                      onClick={() => handleModuleChange('users')}
                    >
                      <DashboardCard
                        title="Total Users"
                        value={usersArray.length.toString()}
                        icon="fas fa-users"
                        color="primary"
                        trend={`${usersArray.filter(u => u.role === 'customer').length} customers`}
                      />
                    </div>
                    <div 
                      className="cursor-pointer transition-all duration-300 hover:bg-green-200 rounded-lg p-1 -m-1 hover:scale-105"
                      onClick={() => handleModuleChange('services')}
                    >
                      <DashboardCard
                        title="Active Services"
                        value={servicesArray.length.toString()}
                        icon="fas fa-cogs"
                        color="accent"
                        trend={`${servicesArray.filter(s => s.status === 'active').length} active`}
                      />
                    </div>
                    <div 
                      className="cursor-pointer transition-all duration-300 hover:bg-green-200 rounded-lg p-1 -m-1 hover:scale-105"
                      onClick={() => handleModuleChange('technicians')}
                    >
                      <DashboardCard
                        title="Active Technicians"
                        value={techniciansArray.filter(t => t.status === 'active').length.toString()}
                        icon="fas fa-hard-hat"
                        color="secondary"
                        trend={`${techniciansArray.length} total technicians`}
                      />
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Installation Statistics Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-chart-bar text-blue-600"></i>
                          Installation Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
                              datasets: [
                                {
                                  label: 'Number of Installations',
                                  data: [
                                    installationsArray.filter(i => i.status === 'pending').length,
                                    installationsArray.filter(i => i.status === 'in_progress').length,
                                    installationsArray.filter(i => i.status === 'completed').length,
                                    installationsArray.filter(i => i.status === 'cancelled').length,
                                  ],
                                  backgroundColor: [
                                    'rgba(255, 193, 7, 0.8)',  // Yellow for pending
                                    'rgba(54, 162, 235, 0.8)', // Blue for in progress
                                    'rgba(40, 167, 69, 0.8)',  // Green for completed
                                    'rgba(220, 53, 69, 0.8)',  // Red for cancelled
                                  ],
                                  borderColor: [
                                    'rgba(255, 193, 7, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(40, 167, 69, 1)',
                                    'rgba(220, 53, 69, 1)',
                                  ],
                                  borderWidth: 2,
                                  borderRadius: 6,
                                  borderSkipped: false,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white',
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                  borderWidth: 1,
                                  cornerRadius: 6,
                                  displayColors: true,
                                  callbacks: {
                                    title: (context) => {
                                      return `${context[0].label} Installations`;
                                    },
                                    label: (context) => {
                                      return `Count: ${context.parsed.y}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                    color: '#6b7280',
                                  },
                                  grid: {
                                    color: 'rgba(229, 231, 235, 0.8)',
                                  },
                                },
                                x: {
                                  ticks: {
                                    color: '#6b7280',
                                  },
                                  grid: {
                                    display: false,
                                  },
                                },
                              },
                              animation: {
                                duration: 2000,
                                easing: 'easeOutBounce',
                              },
                              interaction: {
                                intersect: false,
                                mode: 'index',
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complaints Distribution Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-chart-pie text-red-600"></i>
                          Complaints Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Pie
                            data={{
                              labels: ['Open', 'Investigating', 'Resolved', 'Closed'],
                              datasets: [
                                {
                                  data: [
                                    complaintsArray.filter(c => c.status === 'open').length,
                                    complaintsArray.filter(c => c.status === 'investigating').length,
                                    complaintsArray.filter(c => c.status === 'resolved').length,
                                    complaintsArray.filter(c => c.status === 'closed').length,
                                  ],
                                  backgroundColor: [
                                    '#EF4444', // Red for open
                                    '#F59E0B', // Amber for investigating
                                    '#10B981', // Green for resolved
                                    '#6B7280', // Gray for closed
                                  ],
                                  borderColor: [
                                    '#DC2626',
                                    '#D97706',
                                    '#059669',
                                    '#4B5563',
                                  ],
                                  borderWidth: 2,
                                  hoverOffset: 10,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    padding: 20,
                                    color: '#374151',
                                    font: {
                                      size: 12,
                                    },
                                  },
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white',
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                  borderWidth: 1,
                                  cornerRadius: 6,
                                  callbacks: {
                                    label: (context) => {
                                      const label = context.label || '';
                                      const value = context.parsed || 0;
                                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                      return `${label}: ${value} (${percentage}%)`;
                                    }
                                  }
                                },
                              },
                              animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 2000,
                                easing: 'easeOutElastic',
                              },
                              interaction: {
                                intersect: false,
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Second Row of Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Tickets Distribution Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-chart-pie text-yellow-600"></i>
                          Support Tickets Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Pie
                            data={{
                              labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
                              datasets: [
                                {
                                  data: [
                                    ticketsArray.filter(t => t.status === 'open').length,
                                    ticketsArray.filter(t => t.status === 'in_progress').length,
                                    ticketsArray.filter(t => t.status === 'resolved').length,
                                    ticketsArray.filter(t => t.status === 'closed').length,
                                  ],
                                  backgroundColor: [
                                    '#3B82F6', // Blue for open
                                    '#8B5CF6', // Purple for in progress
                                    '#10B981', // Green for resolved
                                    '#6B7280', // Gray for closed
                                  ],
                                  borderColor: [
                                    '#2563EB',
                                    '#7C3AED',
                                    '#059669',
                                    '#4B5563',
                                  ],
                                  borderWidth: 2,
                                  hoverOffset: 10,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    padding: 20,
                                    color: '#374151',
                                    font: {
                                      size: 12,
                                    },
                                  },
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white',
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                  borderWidth: 1,
                                  cornerRadius: 6,
                                  callbacks: {
                                    label: (context) => {
                                      const label = context.label || '';
                                      const value = context.parsed || 0;
                                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                      return `${label}: ${value} (${percentage}%)`;
                                    }
                                  }
                                },
                              },
                              animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 2000,
                                easing: 'easeOutElastic',
                              },
                              interaction: {
                                intersect: false,
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quotations Status Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <i className="fas fa-chart-bar text-green-600"></i>
                          Quotations Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: ['Pending', 'Approved', 'Rejected', 'Converted'],
                              datasets: [
                                {
                                  label: 'Number of Quotations',
                                  data: [
                                    quotationsArray.filter(q => q.status === 'pending').length,
                                    quotationsArray.filter(q => q.status === 'approved').length,
                                    quotationsArray.filter(q => q.status === 'rejected').length,
                                    quotationsArray.filter(q => q.status === 'converted').length,
                                  ],
                                  backgroundColor: [
                                    'rgba(255, 193, 7, 0.8)',  // Yellow for pending
                                    'rgba(40, 167, 69, 0.8)',  // Green for approved
                                    'rgba(220, 53, 69, 0.8)',  // Red for rejected
                                    'rgba(54, 162, 235, 0.8)', // Blue for converted
                                  ],
                                  borderColor: [
                                    'rgba(255, 193, 7, 1)',
                                    'rgba(40, 167, 69, 1)',
                                    'rgba(220, 53, 69, 1)',
                                    'rgba(54, 162, 235, 1)',
                                  ],
                                  borderWidth: 2,
                                  borderRadius: 6,
                                  borderSkipped: false,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white',
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                  borderWidth: 1,
                                  cornerRadius: 6,
                                  displayColors: true,
                                  callbacks: {
                                    title: (context) => {
                                      return `${context[0].label} Quotations`;
                                    },
                                    label: (context) => {
                                      return `Count: ${context.parsed.y}`;
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                    color: '#6b7280',
                                  },
                                  grid: {
                                    color: 'rgba(229, 231, 235, 0.8)',
                                  },
                                },
                                x: {
                                  ticks: {
                                    color: '#6b7280',
                                  },
                                  grid: {
                                    display: false,
                                  },
                                },
                              },
                              animation: {
                                duration: 2000,
                                easing: 'easeOutBounce',
                              },
                              interaction: {
                                intersect: false,
                                mode: 'index',
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Installations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {installationsArray.slice(0, 5).map((installation: any) => (
                            <div 
                              key={installation.id} 
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() => navigateToModule('installations')}
                            >
                              <div>
                                <p className="font-medium">{installation.customerName || installation.customerId}</p>
                                <p className="text-sm text-gray-600">{installation.address}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                installation.status === 'completed' ? 'bg-green-600 text-white' :
                                installation.status === 'in_progress' ? 'bg-yellow-600 text-white' :
                                'bg-blue-600 text-white'
                              }`}>
                                {installation.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Complaints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {complaintsArray.slice(0, 5).map((complaint: any) => (
                            <div 
                              key={complaint.id} 
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() => navigateToModule('complaints')}
                            >
                              <div>
                                <p className="font-medium">{complaint.title}</p>
                                <p className="text-sm text-gray-600">{complaint.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                complaint.status === 'resolved' ? 'bg-green-600 text-white' :
                                complaint.status === 'investigating' ? 'bg-yellow-600 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {complaint.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeModule === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                          <i className="fas fa-plus mr-2"></i>
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          createUserMutation.mutate({
                            email: formData.get('email'),
                            firstName: formData.get('firstName'),
                            lastName: formData.get('lastName'),
                            role: formData.get('role'),
                            phone: formData.get('phone'),
                            address: formData.get('address'),
                          });
                        }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input id="firstName" name="firstName" required />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input id="lastName" name="lastName" required />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="technician">Technician</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" />
                          </div>
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" />
                          </div>
                          <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mb-4 flex gap-4">
                    <Input
                      placeholder="Search users by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700 first:rounded-tl-lg">Name</th>
                              <th className="text-left p-4 font-medium text-gray-700">Email</th>
                              <th className="text-left p-4 font-medium text-gray-700">Role</th>
                              <th className="text-left p-4 font-medium text-gray-700">Phone</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700 last:rounded-tr-lg">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(getSortedUsers(usersArray), ['firstName', 'lastName', 'email', 'role'])).map((user: any) => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div>
                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                  </div>
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      user.role === 'admin' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' :
                                      user.role === 'technician' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' :
                                      'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </td>
                                <td className="p-4">{user.phone || 'N/A'}</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      user.status === 'active' ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' :
                                      'bg-gray-600 text-white border-gray-600 hover:bg-gray-700'
                                    }
                                  >
                                    {user.status || 'active'}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingItem(user)}
                                    >
                                      <i className="fas fa-edit mr-1"></i>
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      disabled={deleteUserMutation.isPending}
                                    >
                                      <i className="fas fa-trash mr-1"></i>
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(getSortedUsers(usersArray), ['firstName', 'lastName', 'email', 'role']).length)} of {getFilteredData(getSortedUsers(usersArray), ['firstName', 'lastName', 'email', 'role']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(getSortedUsers(usersArray), ['firstName', 'lastName', 'email', 'role']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(getSortedUsers(usersArray), ['firstName', 'lastName', 'email', 'role']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === 'technicians' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Technicians Management</h2>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                          <i className="fas fa-plus mr-2"></i>
                          Add Technician
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl h-[90vh] md:h-[86vh] flex flex-col overflow-hidden">
                        <DialogHeader className="border-b pb-4 flex-shrink-0">
                          <DialogTitle className="text-2xl font-bold text-gray-900">Create New Technician</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 flex flex-col min-h-0">
                          <Tabs value={technicianTab} onValueChange={setTechnicianTab} className="flex-1 flex flex-col min-h-0">
                            <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
                              <TabsTrigger value="basic">Basic Info</TabsTrigger>
                              <TabsTrigger value="professional">Professional</TabsTrigger>
                              <TabsTrigger value="photo">Photo</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 min-h-0 relative">
                              <div className="absolute inset-0 overflow-y-scroll pr-2 pb-4 custom-scrollbar">
                                <Form {...technicianForm}>
                                  <div className="px-4 py-2">

                                    {/* Basic Info Tab */}
                                    <TabsContent value="basic" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 gap-6">
                                      <FormField
                                        control={technicianForm.control}
                                        name="name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter technician's full name"
                                                className={`mt-1 ${technicianForm.formState.errors.name ? 'border-red-500' : ''}`}
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={technicianForm.control}
                                        name="email"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Email *</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="email"
                                                placeholder="technician@example.com"
                                                className={`mt-1 ${technicianForm.formState.errors.email ? 'border-red-500' : ''}`}
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={technicianForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Phone *</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="+92 300 1234567"
                                                className={`mt-1 ${technicianForm.formState.errors.phone ? 'border-red-500' : ''}`}
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={technicianForm.control}
                                        name="status"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Status *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger className={`mt-1 ${technicianForm.formState.errors.status ? 'border-red-500' : ''}`}>
                                                  <SelectValue placeholder="Select employment status" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </TabsContent>

                                    {/* Professional Tab */}
                                    <TabsContent value="professional" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 gap-6">
                                      <FormField
                                        control={technicianForm.control}
                                        name="specialization"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Specialization *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger className={`mt-1 ${technicianForm.formState.errors.specialization ? 'border-red-500' : ''}`}>
                                                  <SelectValue placeholder="Select area of expertise" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="Solar Installation">Solar Installation</SelectItem>
                                                <SelectItem value="General Installation">General Installation</SelectItem>
                                                <SelectItem value="Electrical Systems">Electrical Systems</SelectItem>
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                <SelectItem value="Battery Systems">Battery Systems</SelectItem>
                                                <SelectItem value="Grid Connection">Grid Connection</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={technicianForm.control}
                                        name="experience"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Experience (Years) *</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="0"
                                                max="50"
                                                placeholder="e.g., 5"
                                                className={`mt-1 ${technicianForm.formState.errors.experience ? 'border-red-500' : ''}`}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                value={field.value || ''}
                                              />
                                            </FormControl>
                                            <p className="text-xs text-gray-500 mt-1">Years of relevant work experience</p>
                                            <FormMessage className="text-red-500 text-xs mt-1" />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={technicianForm.control}
                                        name="certifications"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-sm font-medium">Certifications & Licenses</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                placeholder="List relevant certifications, licenses, and training programs..."
                                                className="mt-1 min-h-[100px]"
                                                {...field}
                                              />
                                            </FormControl>
                                            <p className="text-xs text-gray-500 mt-1">Include certifications from NEPRA, PSEB, or other relevant bodies</p>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </TabsContent>

                                    {/* Photo Tab */}
                                    <TabsContent value="photo" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 gap-6">
                                      <div>
                                        <Label className="text-sm font-medium">Profile Photo</Label>
                                        <div className="mt-2 flex items-center justify-center w-full">
                                          <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                              <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                              <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> technician photo
                                              </p>
                                              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                                            </div>
                                            <input id="photo-upload" type="file" className="hidden" accept="image/*" />
                                          </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Professional headshot recommended for technician identification
                                        </p>
                                      </div>
                                    </div>
                                    </TabsContent>

                                  </div>
                                </Form>
                              </div>
                            </div>
                          </Tabs>
                        </div>

                        {/* Fixed Footer with Buttons */}
                        <div className="border-t bg-white px-6 py-4 flex justify-end gap-3 flex-shrink-0">
                          <Button type="button" variant="outline" onClick={() => {
                            setIsCreateModalOpen(false);
                            technicianForm.reset();
                          }}>
                            Cancel
                          </Button>
                          <Button 
                            disabled={createTechnicianMutation.isPending} 
                            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                            onClick={technicianForm.handleSubmit((data) => {
                              createTechnicianMutation.mutate(data);
                            }, (errors) => {
                              // Navigate to correct tab and focus on first error field
                              const firstErrorField = Object.keys(errors)[0];
                              if (firstErrorField) {
                                // Navigate to correct tab
                                const targetTab = technicianFieldToTab[firstErrorField] || "basic";
                                if (technicianTab !== targetTab) {
                                  setTechnicianTab(targetTab);
                                }
                                
                                // Get specific error message
                                const errorMessage = errors[firstErrorField as keyof typeof errors]?.message || "This field is required";
                                

                                
                                setTimeout(() => {
                                  const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement | null;
                                  if (element) {
                                    element.focus();
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 150); // Longer timeout to allow tab switch
                              }
                            })}
                          >
                            {createTechnicianMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus mr-2"></i>
                                Create Technician
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search technicians by name, email, or specialization..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Name</th>
                              <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                              <th className="text-left p-4 font-medium text-gray-700">Specialization</th>
                              <th className="text-left p-4 font-medium text-gray-700">Experience</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(techniciansArray, ['name', 'email', 'specializations'])).map((technician: any) => (
                              <tr key={technician.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div>
                                    <p className="font-medium">{technician.name}</p>
                                    <p className="text-sm text-gray-600">{technician.certifications}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <p className="text-sm">{technician.email}</p>
                                    <p className="text-sm text-gray-600">{technician.phone}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline">
                                    {Array.isArray(technician.specializations) 
                                      ? technician.specializations.join(', ') 
                                      : technician.specialization || 'Not specified'
                                    }
                                  </Badge>
                                </td>
                                <td className="p-4">{technician.experience} years</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      technician.status === 'active' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      technician.status === 'on_leave' ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' :
                                      technician.status === 'inactive' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                                      'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                                    }
                                  >
                                    {technician.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingItem(technician)}
                                    >
                                      <i className="fas fa-edit mr-1"></i>
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteTechnicianMutation.mutate(technician.id)}
                                      disabled={deleteTechnicianMutation.isPending}
                                    >
                                      <i className="fas fa-trash mr-1"></i>
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(techniciansArray, ['name', 'email', 'specialization']).length)} of {getFilteredData(techniciansArray, ['name', 'email', 'specialization']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(techniciansArray, ['name', 'email', 'specialization']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(techniciansArray, ['name', 'email', 'specialization']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === 'services' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
                    <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                      setIsCreateModalOpen(open);
                      if (!open) setFormErrors({});
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                          <i className="fas fa-plus mr-2"></i>
                          Add Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Service</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);

                          // Clear previous errors
                          setFormErrors({});

                          // Validate form
                          const errors: Record<string, string> = {};
                          if (!formData.get('name')) errors.name = 'Service name is required';
                          if (!formData.get('description')) errors.description = 'Description is required';
                          if (!formData.get('category')) errors.category = 'Category is required';
                          if (!formData.get('price')) errors.price = 'Price is required';
                          if (!formData.get('status')) errors.status = 'Status is required';

                          if (Object.keys(errors).length > 0) {
                            setFormErrors(errors);
                            return;
                          }

                          createServiceMutation.mutate({
                            name: formData.get('name'),
                            description: formData.get('description'),
                            category: formData.get('category'),
                            price: formData.get('price'),
                            isActive: formData.get('status') === 'active',
                          });
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Service Name</Label>
                            <Input id="name" name="name" className={formErrors.name ? 'border-red-500' : ''} />
                            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" className={formErrors.description ? 'border-red-500' : ''} />
                            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select name="category">
                              <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="installation">Installation</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                            {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                          </div>
                          <div>
                            <Label htmlFor="price">Price (PKR)</Label>
                            <Input id="price" name="price" type="number" step="0.01" className={formErrors.price ? 'border-red-500' : ''} />
                            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select name="status">
                              <SelectTrigger className={formErrors.status ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            {formErrors.status && <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>}
                          </div>
                          <Button type="submit" className="w-full" disabled={createServiceMutation.isPending}>
                            {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search services by name, category, or description..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Service Name</th>
                              <th className="text-left p-4 font-medium text-gray-700">Category</th>
                              <th className="text-left p-4 font-medium text-gray-700">Price</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(servicesArray, ['name', 'category', 'description'])).map((service: any) => (
                              <tr key={service.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {service.description && service.description.length > 50 
                                        ? `${service.description.substring(0, 50)}...` 
                                        : service.description}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline">{service.category}</Badge>
                                </td>
                                <td className="p-4">PKR {Number(service.price)?.toLocaleString('en-US')}</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      service.isActive ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                    }
                                  >
                                    {service.isActive ? 'active' : 'inactive'}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingItem(service)}
                                    >
                                      <i className="fas fa-edit mr-1"></i>
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteServiceMutation.mutate(service.id)}
                                      disabled={deleteServiceMutation.isPending}
                                    >
                                      <i className="fas fa-trash mr-1"></i>
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(servicesArray, ['name', 'category', 'description']).length)} of {getFilteredData(servicesArray, ['name', 'category', 'description']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(servicesArray, ['name', 'category', 'description']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(servicesArray, ['name', 'category', 'description']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === 'installations' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Installation Management</h2>
                    <Button onClick={() => setIsCreateInstallationModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <i className="fas fa-plus mr-2"></i>
                      Create Installation
                    </Button>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search installations by customer, address, or status..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                              <th className="text-left p-4 font-medium text-gray-700">Address</th>
                              <th className="text-left p-4 font-medium text-gray-700">Capacity</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Date</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(installationsArray, ['customerName', 'customerId', 'address', 'status'])).map((installation: any) => (
                              <tr key={installation.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div>
                                    <p className="font-medium">{installation.customerName || installation.customerId}</p>
                                  </div>
                                </td>
                                <td className="p-4">{installation.address}</td>
                                <td className="p-4">{installation.capacity} kW</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      installation.status === 'completed' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      installation.status === 'in_progress' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      installation.status === 'pending' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                                      installation.status === 'cancelled' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                                      'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                                    }
                                  >
                                    {installation.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  {new Date(installation.installationDate || installation.createdAt).toLocaleDateString('en-GB')}
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setViewingInstallation(installation)}
                                    >
                                      <i className="fas fa-eye mr-1"></i>
                                      View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingInstallation(installation)}
                                    >
                                      <i className="fas fa-edit mr-1"></i>
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteInstallationMutation.mutate(installation.id)}
                                      disabled={deleteInstallationMutation.isPending}
                                    >
                                      <i className="fas fa-trash mr-1"></i>
                                      Delete
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setAssigningTechnician(installation)}
                                      className={
                                        installation.technicianId 
                                          ? "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                                          : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                      }
                                    >
                                      <i className="fas fa-user-cog mr-1"></i>
                                      {installation.technicianId ? 'Reassign Technician' : 'Technician'}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(installationsArray, ['customerName', 'customerId', 'address', 'status']).length)} of {getFilteredData(installationsArray, ['customerName', 'customerId', 'address', 'status']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(installationsArray, ['customerName', 'customerId', 'address', 'status']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(installationsArray, ['customerName', 'customerId', 'address', 'status']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeModule === 'quotations' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Quotations Management</h2>
                    <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                      setIsCreateModalOpen(open);
                      if (!open) setFormErrors({});
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                          <i className="fas fa-plus mr-2"></i>
                          Add Quotation
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Quotation</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);

                          // Clear previous errors
                          setFormErrors({});

                          // Validate form
                          const errors: Record<string, string> = {};
                          if (!formData.get('customerName')) errors.customerName = 'Customer name is required';
                          if (!formData.get('propertyAddress')) errors.propertyAddress = 'Property address is required';
                          if (!formData.get('systemSize')) errors.systemSize = 'System size is required';
                          if (!formData.get('estimatedCost')) errors.estimatedCost = 'Estimated cost is required';

                          if (Object.keys(errors).length > 0) {
                            setFormErrors(errors);
                            return;
                          }

                          createQuotationMutation.mutate({
                            customerName: formData.get('customerName'),
                            propertyAddress: formData.get('propertyAddress'),
                            propertyType: formData.get('propertyType'),
                            systemSize: formData.get('systemSize'),
                            estimatedCost: formData.get('estimatedCost'),
                            status: formData.get('status'),
                          });
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" name="customerName" className={formErrors.customerName ? 'border-red-500' : ''} />
                            {formErrors.customerName && <p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="propertyAddress">Property Address</Label>
                            <Textarea id="propertyAddress" name="propertyAddress" className={formErrors.propertyAddress ? 'border-red-500' : ''} />
                            {formErrors.propertyAddress && <p className="text-red-500 text-sm mt-1">{formErrors.propertyAddress}</p>}
                          </div>
                          <div>
                            <Label htmlFor="propertyType">Property Type</Label>
                            <Select name="propertyType">
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="systemSize">System Size (kW)</Label>
                            <Input id="systemSize" name="systemSize" type="number" step="0.1" className={formErrors.systemSize ? 'border-red-500' : ''} />
                            {formErrors.systemSize && <p className="text-red-500 text-sm mt-1">{formErrors.systemSize}</p>}
                          </div>
                          <div>
                            <Label htmlFor="estimatedCost">Estimated Cost (PKR)</Label>
                            <Input id="estimatedCost" name="estimatedCost" type="number" step="0.01" className={formErrors.estimatedCost ? 'border-red-500' : ''} />
                            {formErrors.estimatedCost && <p className="text-red-500 text-sm mt-1">{formErrors.estimatedCost}</p>}
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select name="status">
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full" disabled={createQuotationMutation.isPending}>
                            {createQuotationMutation.isPending ? "Creating..." : "Create Quotation"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search quotations by customer or ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                              <th className="text-left p-4 font-medium text-gray-700">Appliances</th>
                              <th className="text-left p-4 font-medium text-gray-700">System Size</th>
                              <th className="text-left p-4 font-medium text-gray-700">Total Cost</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(quotationsArray, ['customerName', 'customerId', 'id'])).map((quotation: any) => (
                              <tr key={quotation.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div>
                                    <p className="font-medium">{quotation.customerName}</p>
                                    <p className="text-sm text-gray-600">{quotation.customerEmail}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {(() => {
                                    try {
                                      return quotation.items ? JSON.parse(quotation.items).length : 0;
                                    } catch {
                                      return 0;
                                    }
                                  })()} items
                                </td>
                                <td className="p-4">{Number(quotation.systemSize)?.toFixed(1)} kW</td>
                                <td className="p-4">PKR {Number(quotation.estimatedCost || quotation.amount)?.toLocaleString('en-US')}</td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      quotation.status === 'approved' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      quotation.status === 'pending' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                                      quotation.status === 'rejected' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                                      quotation.status === 'converted' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                                    }
                                  >
                                    {quotation.status || 'pending'}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setViewingQuotation(quotation)}
                                    >
                                      <i className="fas fa-eye mr-1"></i>
                                      View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingQuotation(quotation)}
                                    >
                                      <i className="fas fa-edit mr-1"></i>
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => deleteQuotationMutation.mutate(quotation.id)}
                                      disabled={deleteQuotationMutation.isPending}
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <i className="fas fa-trash mr-1"></i>
                                      Delete
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        createInstallationFromQuotation.mutate(quotation.id);
                                      }}
                                      disabled={createInstallationFromQuotation.isPending}
                                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                    >
                                      <i className="fas fa-plus mr-1"></i>
                                      {createInstallationFromQuotation.isPending ? "Creating..." : "Create Installation"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(quotationsArray, ['customerName', 'customerId', 'id']).length)} of {getFilteredData(quotationsArray, ['customerName', 'customerId', 'id']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(quotationsArray, ['customerName', 'customerId', 'id']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(quotationsArray, ['customerName', 'customerId', 'id']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* View Quotation Modal */}
                  <Dialog open={!!viewingQuotation} onOpenChange={() => setViewingQuotation(null)}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader className="border-b pb-4 flex-shrink-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                          Quotation Details
                        </DialogTitle>
                        <p className="text-sm text-gray-500">
                          Quote ID: {viewingQuotation?.id} • Created: {viewingQuotation ? new Date(viewingQuotation.createdAt).toLocaleDateString() : ''}
                        </p>
                      </DialogHeader>

                      {viewingQuotation && (
                        <>
                        <div className="flex-1 overflow-hidden">
                          <Tabs defaultValue="overview" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-5 mb-6 flex-shrink-0">
                              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                              <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                              <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                              <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
                              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #f9fafb'}}>
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6 mt-0">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-l-4 border-l-blue-500">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <i className="fas fa-user text-blue-500"></i>
                                      Customer
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Name:</span>
                                        <span className="font-medium">{viewingQuotation.customerName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Email:</span>
                                        <span className="font-medium text-xs">{viewingQuotation.customerEmail || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-green-500">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <i className="fas fa-solar-panel text-green-500"></i>
                                      System
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Size:</span>
                                        <span className="font-bold text-green-600">{Number(viewingQuotation.systemSize)?.toFixed(1)} kW</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Cost:</span>
                                        <span className="font-bold text-lg">PKR {Number(viewingQuotation.estimatedCost || viewingQuotation.amount)?.toLocaleString('en-US')}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-purple-500">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <i className="fas fa-chart-line text-purple-500"></i>
                                      Status
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Current:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          viewingQuotation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                          viewingQuotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          viewingQuotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                          viewingQuotation.status === 'converted' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {(viewingQuotation.status || 'pending').toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Updated:</span>
                                        <span className="text-xs">{new Date(viewingQuotation.updatedAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {viewingQuotation.propertyAddress && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <i className="fas fa-map-marker-alt text-red-500"></i>
                                      Property Location
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                      <i className="fas fa-home mr-2"></i>
                                      {viewingQuotation.propertyAddress}
                                    </p>
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>

                            {/* Customer Tab */}
                            <TabsContent value="customer" className="space-y-6 mt-0">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <i className="fas fa-user-circle text-blue-500"></i>
                                    Customer Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div className="border-l-4 border-l-blue-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                                        <p className="text-lg font-semibold">{viewingQuotation.customerName}</p>
                                      </div>
                                      <div className="border-l-4 border-l-green-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                                        <p className="text-lg">{viewingQuotation.customerEmail || 'Not provided'}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      {/* Parse contact info from notes */}
                                      {(() => {
                                        const notes = viewingQuotation.notes || '';
                                        const contactMatch = notes.match(/Contact:\s*([^,]+)/);
                                        if (contactMatch) {
                                          return (
                                            <div className="border-l-4 border-l-purple-400 pl-4">
                                              <Label className="text-sm font-medium text-gray-600">Contact Number</Label>
                                              <p className="text-lg font-semibold">{contactMatch[1].trim()}</p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                      <div className="border-l-4 border-l-orange-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Registration Date</Label>
                                        <p className="text-lg">{new Date(viewingQuotation.createdAt).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric' 
                                        })}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>

                            {/* System Tab */}
                            <TabsContent value="system" className="space-y-6 mt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <i className="fas fa-solar-panel text-yellow-500"></i>
                                      System Specifications
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">System Size</span>
                                        <span className="text-2xl font-bold text-green-600">{Number(viewingQuotation.systemSize)?.toFixed(1)} kW</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min(100, (Number(viewingQuotation.systemSize) / 20) * 100)}%`}}></div>
                                      </div>
                                    </div>
                                    {viewingQuotation.inverterSize && (
                                      <div className="border-l-4 border-l-blue-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Inverter Size</Label>
                                        <p className="text-lg font-semibold">{viewingQuotation.inverterSize}</p>
                                      </div>
                                    )}
                                    {viewingQuotation.batteryCapacity && (
                                      <div className="border-l-4 border-l-orange-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Battery Capacity</Label>
                                        <p className="text-lg font-semibold">{viewingQuotation.batteryCapacity}</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <i className="fas fa-dollar-sign text-green-500"></i>
                                      Financial Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                      <div className="text-center">
                                        <span className="text-sm font-medium text-gray-700 block">Total Estimated Cost</span>
                                        <span className="text-3xl font-bold text-green-600">PKR {Number(viewingQuotation.estimatedCost || viewingQuotation.amount)?.toLocaleString('en-US')}</span>
                                      </div>
                                    </div>
                                    {viewingQuotation.installationTimeline && (
                                      <div className="border-l-4 border-l-purple-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Installation Timeline</Label>
                                        <p className="text-lg font-semibold">{viewingQuotation.installationTimeline}</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Installation Timeline Card */}
                                {viewingQuotation.installationTimeline && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <i className="fas fa-calendar-alt text-indigo-500"></i>
                                        Installation Timeline
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <i className="fas fa-clock text-indigo-600"></i>
                                            <div>
                                              <p className="font-medium text-gray-900">Expected Duration</p>
                                              <p className="text-sm text-gray-600">From approval to completion</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-2xl font-bold text-indigo-600">{viewingQuotation.installationTimeline}</span>
                                            <p className="text-sm font-medium text-gray-700">timeline</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>

                              {viewingQuotation.totalLoad && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <i className="fas fa-bolt text-yellow-500"></i>
                                      Load Analysis
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-700">Total Load Requirement</span>
                                        <span className="text-2xl font-bold text-yellow-600">{viewingQuotation.totalLoad} W</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>

                            {/* Property Tab */}
                            <TabsContent value="property" className="space-y-6 mt-0">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <i className="fas fa-home text-blue-500"></i>
                                    Property Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div className="border-l-4 border-l-red-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Property Address</Label>
                                        <p className="text-lg">{viewingQuotation.propertyAddress || 'Not provided'}</p>
                                      </div>
                                      <div className="border-l-4 border-l-blue-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Property Type</Label>
                                        <p className="text-lg capitalize">{viewingQuotation.propertyType || 'Not specified'}</p>
                                      </div>
                                      {/* Parse society/area from notes */}
                                      {(() => {
                                        const notes = viewingQuotation.notes || '';
                                        const societyMatch = notes.match(/Society:\s*([^,]+)/);
                                        if (societyMatch) {
                                          return (
                                            <div className="border-l-4 border-l-purple-400 pl-4">
                                              <Label className="text-sm font-medium text-gray-600">Society/Area</Label>
                                              <p className="text-lg">{societyMatch[1].trim()}</p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    <div className="space-y-4">
                                      <div className="border-l-4 border-l-green-400 pl-4">
                                        <Label className="text-sm font-medium text-gray-600">Roof Type</Label>
                                        <p className="text-lg capitalize">{viewingQuotation.roofType || 'Not specified'}</p>
                                      </div>
                                      {/* Parse roof area from notes or use existing field */}
                                      {(() => {
                                        let roofArea = viewingQuotation.roofArea;
                                        if (!roofArea && viewingQuotation.notes) {
                                          const roofAreaMatch = viewingQuotation.notes.match(/Roof Area:\s*([^,]+)/);
                                          if (roofAreaMatch) {
                                            roofArea = roofAreaMatch[1].trim();
                                          }
                                        }
                                        if (roofArea) {
                                          return (
                                            <div className="border-l-4 border-l-orange-400 pl-4">
                                              <Label className="text-sm font-medium text-gray-600">Roof Dimensions</Label>
                                              <p className="text-lg">{roofArea}</p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                      {/* Parse property size from notes */}
                                      {(() => {
                                        const notes = viewingQuotation.notes || '';
                                        const houseMatch = notes.match(/House:\s*([^,]+)/);
                                        if (houseMatch) {
                                          return (
                                            <div className="border-l-4 border-l-indigo-400 pl-4">
                                              <Label className="text-sm font-medium text-gray-600">Property Size</Label>
                                              <p className="text-lg">{houseMatch[1].trim()}</p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>

                            {/* Details Tab */}
                            <TabsContent value="details" className="space-y-6 mt-0">
                              {/* Appliances Section - Only show if appliances data exists and has non-zero values */}
                              {viewingQuotation.appliances && (() => {
                                try {
                                  const appliances = JSON.parse(viewingQuotation.appliances);
                                  const nonZeroAppliances = Object.entries(appliances).filter(([key, value]) => Number(value) > 0);

                                  if (nonZeroAppliances.length === 0) return null;

                                  const applianceLabels: Record<string, string> = {
                                    'ac15Ton': 'Air Conditioner (1.5 Ton)',
                                    'ac1Ton': 'Air Conditioner (1 Ton)',
                                    'fans': 'Ceiling Fans',
                                    'refrigerator': 'Refrigerator',
                                    'lights': 'LED Lights',
                                    'motors': 'Motors/Pumps',
                                    'iron': 'Iron',
                                    'washingMachine': 'Washing Machine',
                                    'computerTV': 'Computer/TV',
                                    'cctv': 'CCTV System',
                                    'other': 'Other Appliances'
                                  };

                                  return (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <i className="fas fa-plug text-blue-500"></i>
                                          Electrical Appliances
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">Load calculation based on customer requirements</p>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          {nonZeroAppliances.map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200 hover:bg-green-50 transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <div>
                                                  <p className="font-medium text-gray-900">{applianceLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                  <p className="text-sm text-gray-600">Quantity required</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <span className="text-2xl font-bold text-blue-600">{value as number}</span>
                                                <p className="text-xs text-gray-500">units</p>
                                              </div>
                                            </div>
                                          ))}

                                          {/* Total Load Summary */}
                                          {viewingQuotation.totalLoad && (
                                            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <i className="fas fa-bolt text-yellow-500 text-xl"></i>
                                                  <div>
                                                    <p className="font-semibold text-gray-900">Total Calculated Load</p>
                                                    <p className="text-sm text-gray-600">Combined power requirement</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <span className="text-3xl font-bold text-green-600">{viewingQuotation.totalLoad}</span>
                                                  <p className="text-sm font-medium text-gray-700">Watts</p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                } catch (e) {
                                  return null; // Don't show anything if JSON parsing fails
                                }
                              })()}

                              {/* System Specifications */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <i className="fas fa-solar-panel text-green-500"></i>
                                    Recommended System Configuration
                                  </CardTitle>
                                  <p className="text-sm text-gray-600">Based on load analysis and requirements</p>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {/* Solar Panels */}
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-gray-200">
                                      <div className="flex items-center gap-3">
                                        <i className="fas fa-solar-panel text-yellow-600"></i>
                                        <div>
                                          <p className="font-medium text-gray-900">Solar Panel System</p>
                                          <p className="text-sm text-gray-600">Total capacity required</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-2xl font-bold text-yellow-600">{Number(viewingQuotation.systemSize)?.toFixed(1)}</span>
                                        <p className="text-sm font-medium text-gray-700">kW</p>
                                      </div>
                                    </div>

                                    {/* Inverter Size if available */}
                                    {viewingQuotation.inverterSize && (
                                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                          <i className="fas fa-microchip text-blue-600"></i>
                                          <div>
                                            <p className="font-medium text-gray-900">Inverter System</p>
                                            <p className="text-sm text-gray-600">Power conversion capacity</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-2xl font-bold text-blue-600">{viewingQuotation.inverterSize}</span>
                                          <p className="text-sm font-medium text-gray-700">capacity</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Battery Capacity if available */}
                                    {viewingQuotation.batteryCapacity && (
                                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                          <i className="fas fa-battery-full text-purple-600"></i>
                                          <div>
                                            <p className="font-medium text-gray-900">Battery Storage</p>
                                            <p className="text-sm text-gray-600">Backup power capacity</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-2xl font-bold text-purple-600">{viewingQuotation.batteryCapacity}</span>
                                          <p className="text-sm font-medium text-gray-700">capacity</p>
                                        </div>
                                      </div>
                                    )}


                                  </div>
                                </CardContent>
                              </Card>

                              {/* Additional Information from Notes - Only show special items not moved to other tabs */}
                              {viewingQuotation.notes && (() => {
                                const notes = viewingQuotation.notes;
                                const specialItems = [];

                                // Parse panels required (system-specific)
                                const panelsMatch = notes.match(/Panels Required:\s*([^,]+)/);
                                if (panelsMatch) {
                                  specialItems.push({
                                    icon: 'fas fa-solar-panel',
                                    label: 'Solar Panels Required',
                                    value: panelsMatch[1].trim() + ' panels',
                                    color: 'orange'
                                  });
                                }

                                // Parse inverter (system-specific if not already in main fields)
                                const inverterMatch = notes.match(/Inverter:\s*([^,]+)/);
                                if (inverterMatch && !viewingQuotation.inverterSize) {
                                  specialItems.push({
                                    icon: 'fas fa-microchip',
                                    label: 'Inverter Specification',
                                    value: inverterMatch[1].trim(),
                                    color: 'indigo'
                                  });
                                }

                                // Parse battery (system-specific if not already in main fields)
                                const batteryMatch = notes.match(/Battery:\s*([^,]+)/);
                                if (batteryMatch && !viewingQuotation.batteryCapacity) {
                                  specialItems.push({
                                    icon: 'fas fa-battery-full',
                                    label: 'Battery Specification',
                                    value: batteryMatch[1].trim(),
                                    color: 'pink'
                                  });
                                }

                                const colorClasses: Record<string, string> = {
                                  blue: 'from-blue-50 to-blue-100 text-blue-600',
                                  green: 'from-green-50 to-green-100 text-green-600',
                                  red: 'from-red-50 to-red-100 text-red-600',
                                  purple: 'from-purple-50 to-purple-100 text-purple-600',
                                  yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
                                  orange: 'from-orange-50 to-orange-100 text-orange-600',
                                  indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
                                  pink: 'from-pink-50 to-pink-100 text-pink-600'
                                };

                                // Only show the card if there are special items to display
                                if (specialItems.length > 0) {
                                  return (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <i className="fas fa-info-circle text-blue-500"></i>
                                          Additional Specifications
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">Extra system requirements and specifications</p>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          {specialItems.map((item, index) => (
                                            <div key={index} className={`flex items-center justify-between p-4 bg-gradient-to-r ${colorClasses[item.color]} rounded-lg border border-gray-200`}>
                                              <div className="flex items-center gap-3">
                                                <i className={`${item.icon} ${item.color === 'yellow' ? 'text-yellow-700' : item.color === 'orange' ? 'text-orange-700' : ''}`}></i>
                                                <div>
                                                  <p className="font-medium text-gray-900">{item.label}</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <span className="font-semibold text-gray-800">{item.value}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                }
                                return null;
                              })()}

                              {/* Timeline */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <i className="fas fa-clock text-purple-500"></i>
                                    Timeline & History
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200">
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">Quotation Created</p>
                                        <p className="text-sm text-gray-600">{new Date(viewingQuotation.createdAt).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-gray-200">
                                      <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">Last Updated</p>
                                        <p className="text-sm text-gray-600">{new Date(viewingQuotation.updatedAt).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            </div>
                          </Tabs>
                        </div>

                        {/* PDF Action Buttons - Fixed Footer */}
                        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-200 flex-shrink-0 bg-white">
                          <Button
                            onClick={() => handleDownloadQuotePDF(viewingQuotation)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                          >
                            <i className="fas fa-download"></i>
                            Download PDF Report
                          </Button>
                          <Button
                            onClick={() => handlePrintQuotation(viewingQuotation)}
                            variant="outline"
                            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors"
                          >
                            <i className="fas fa-print"></i>
                            Print Quotation
                          </Button>
                        </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Edit Quotation Modal */}
                  <Dialog open={!!editingQuotation} onOpenChange={(open) => {
                    if (!open) {
                      setEditingQuotation(null);
                      setFormErrors({});
                    }
                  }}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader className="border-b pb-4 flex-shrink-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Edit Quotation</DialogTitle>
                        <p className="text-sm text-gray-500">Quote ID: {editingQuotation?.id}</p>
                      </DialogHeader>
                      {editingQuotation && (
                        <form onSubmit={(e) => {
                          e.preventDefault();

                          // Clear previous errors
                          setFormErrors({});

                          // Get current values from state or inputs directly
                          const formData = {
                            id: editingQuotation.id,
                            customerName: editingQuotation.customerName,
                            customerEmail: editingQuotation.customerEmail || '',
                            propertyAddress: editingQuotation.propertyAddress,
                            propertyType: editingQuotation.propertyType || '',
                            roofType: editingQuotation.roofType || '',
                            systemSize: parseFloat(editingQuotation.systemSize?.toString() || '0'),
                            estimatedCost: parseFloat(editingQuotation.estimatedCost?.toString() || editingQuotation.amount?.toString() || '0'),
                            status: editingQuotation.status || 'pending',
                            notes: editingQuotation.notes || '',
                            installationTimeline: editingQuotation.installationTimeline || '',
                          };

                          // Get any updated values from form inputs
                          const form = e.currentTarget;
                          const inputs = form.querySelectorAll('input, textarea, select');
                          let cleanedNotes = formData.notes || '';

                          inputs.forEach((input: any) => {
                            const name = input.name;
                            if (name && input.value !== undefined) {
                              if (name === 'systemSize' || name === 'estimatedCost') {
                                (formData as any)[name] = parseFloat(input.value) || 0;
                              } else {
                                (formData as any)[name] = input.value;
                              }
                            }
                          });

                          // Clean notes by removing information that's now in dedicated tabs
                          if (cleanedNotes) {
                            // Remove contact information (now in Contact tab)
                            cleanedNotes = cleanedNotes.replace(/Contact:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/Email:\s*[^,]+,?\s*/gi, '');

                            // Remove technical information (now in Technical tab)
                            cleanedNotes = cleanedNotes.replace(/Society:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/House:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/Roof Area:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/Panels Required:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/Inverter:\s*[^,]+,?\s*/gi, '');
                            cleanedNotes = cleanedNotes.replace(/Battery:\s*[^,]+,?\s*/gi, '');

                            // Clean up extra commas and spaces
                            cleanedNotes = cleanedNotes.replace(/,\s*,/g, ',');
                            cleanedNotes = cleanedNotes.replace(/^,\s*/, '');
                            cleanedNotes = cleanedNotes.replace(/,\s*$/, '');
                            cleanedNotes = cleanedNotes.trim();

                            formData.notes = cleanedNotes;
                          }

                          console.log('Submitting quotation update:', formData);

                          // Inline validation with specific field errors
                          const validationErrors: Record<string, string> = {};
                          if (!formData.customerName) validationErrors.customerName = 'Customer name is required';
                          if (!formData.propertyAddress) validationErrors.propertyAddress = 'Property address is required';
                          if (!formData.systemSize || formData.systemSize <= 0) validationErrors.systemSize = 'System size is required';
                          if (!formData.estimatedCost || formData.estimatedCost <= 0) validationErrors.estimatedCost = 'Estimated cost is required';

                          if (Object.keys(validationErrors).length > 0) {
                            setFormErrors(validationErrors);
                            return;
                          }

                          updateQuotationMutation.mutate(formData);
                        }} className="flex-1 overflow-hidden flex flex-col">
                          <div className="flex-1 overflow-hidden">
                            <Tabs defaultValue="customer" className="h-full flex flex-col">
                              <TabsList className="grid w-full grid-cols-6 mb-6 flex-shrink-0">
                                <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                                <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
                                <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                                <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
                                <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
                                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                              </TabsList>

                              <div className="flex-1 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #f9fafb'}}>
                                {/* Customer Tab */}
                                <TabsContent value="customer" className="space-y-4 mt-0">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="customerName">Customer Name *</Label>
                                      <Input 
                                        id="customerName" 
                                        name="customerName" 
                                        key={`customerName-${editingQuotation.id}`}
                                        defaultValue={editingQuotation.customerName}
                                        className={formErrors.customerName ? 'border-red-500' : ''}
                                      />
                                      {formErrors.customerName && <p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>}
                                    </div>
                                    <div>
                                      <Label htmlFor="customerEmail">Customer Email</Label>
                                      <Input 
                                        id="customerEmail" 
                                        name="customerEmail" 
                                        type="email"
                                        key={`customerEmail-${editingQuotation.id}`}
                                        defaultValue={editingQuotation.customerEmail || ''}
                                      />
                                    </div>
                                  </div>
                                </TabsContent>

                                {/* Property Tab */}
                                <TabsContent value="property" className="space-y-4 mt-0">
                                  <div>
                                    <Label htmlFor="propertyAddress">Property Address *</Label>
                                    <Textarea 
                                      id="propertyAddress" 
                                      name="propertyAddress" 
                                      key={`propertyAddress-${editingQuotation.id}`}
                                      defaultValue={editingQuotation.propertyAddress}
                                      className={formErrors.propertyAddress ? 'border-red-500' : ''}
                                      rows={3}
                                    />
                                    {formErrors.propertyAddress && <p className="text-red-500 text-sm mt-1">{formErrors.propertyAddress}</p>}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="propertyType">Property Type</Label>
                                      <Select name="propertyType" key={`propertyType-${editingQuotation.id}`} defaultValue={editingQuotation.propertyType || 'residential'}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select property type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="residential">Residential</SelectItem>
                                          <SelectItem value="commercial">Commercial</SelectItem>
                                          <SelectItem value="industrial">Industrial</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="roofType">Roof Type</Label>
                                      <Select name="roofType" key={`roofType-${editingQuotation.id}`} defaultValue={editingQuotation.roofType || 'flat'}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select roof type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="flat">Flat</SelectItem>
                                          <SelectItem value="sloped">Sloped</SelectItem>
                                          <SelectItem value="tile">Tile</SelectItem>
                                          <SelectItem value="metal">Metal</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </TabsContent>

                                {/* System Tab */}
                                <TabsContent value="system" className="space-y-4 mt-0">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="systemSize">System Size (kW) *</Label>
                                      <Input 
                                        id="systemSize" 
                                        name="systemSize" 
                                        type="number" 
                                        step="0.1" 
                                        key={`systemSize-${editingQuotation.id}`}
                                        defaultValue={editingQuotation.systemSize}
                                        className={formErrors.systemSize ? 'border-red-500' : ''}
                                      />
                                      {formErrors.systemSize && <p className="text-red-500 text-sm mt-1">{formErrors.systemSize}</p>}
                                    </div>
                                    <div>
                                      <Label htmlFor="estimatedCost">Estimated Cost (PKR) *</Label>
                                      <Input 
                                        id="estimatedCost" 
                                        name="estimatedCost" 
                                        type="number" 
                                        step="0.01" 
                                        key={`estimatedCost-${editingQuotation.id}`}
                                        defaultValue={editingQuotation.estimatedCost || editingQuotation.amount}
                                        className={formErrors.estimatedCost ? 'border-red-500' : ''}
                                      />
                                      {formErrors.estimatedCost && <p className="text-red-500 text-sm mt-1">{formErrors.estimatedCost}</p>}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="status">Status</Label>
                                      <Select name="status" key={`status-${editingQuotation.id}`} defaultValue={editingQuotation.status || 'pending'}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="installationTimeline">Installation Timeline</Label>
                                      <Input 
                                        id="installationTimeline" 
                                        name="installationTimeline" 
                                        key={`installationTimeline-${editingQuotation.id}`}
                                        defaultValue={editingQuotation.installationTimeline || ''}
                                        placeholder="e.g., 2-3 weeks"
                                      />
                                    </div>
                                  </div>
                                </TabsContent>

                                {/* Contact Tab */}
                                <TabsContent value="contact" className="space-y-4 mt-0">
                                  {(() => {
                                    // Parse contact info from notes
                                    const notes = editingQuotation.notes || '';
                                    const contactMatch = notes.match(/Contact:\s*([^,]+)/);
                                    const emailMatch = notes.match(/Email:\s*([^,]+)/);
                                    const phoneNumber = contactMatch?.[1]?.trim() || '';
                                    const emailAddress = emailMatch?.[1]?.trim() || editingQuotation.customerEmail || '';

                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="contactPhone">Phone Number</Label>
                                          <Input 
                                            id="contactPhone" 
                                            name="contactPhone" 
                                            defaultValue={phoneNumber}
                                            placeholder="e.g., +92 300 1234567"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="contactEmail">Email Address</Label>
                                          <Input 
                                            id="contactEmail" 
                                            name="contactEmail" 
                                            type="email"
                                            defaultValue={emailAddress}
                                            placeholder="customer@example.com"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </TabsContent>

                                {/* Technical Tab */}
                                <TabsContent value="technical" className="space-y-4 mt-0">
                                  {(() => {
                                    // Parse technical info from notes
                                    const notes = editingQuotation.notes || '';
                                    const societyMatch = notes.match(/Society:\s*([^,]+)/);
                                    const houseMatch = notes.match(/House:\s*([^,]+)/);
                                    const roofAreaMatch = notes.match(/Roof Area:\s*([^,]+)/);
                                    const panelsMatch = notes.match(/Panels Required:\s*([^,]+)/);
                                    const inverterMatch = notes.match(/Inverter:\s*([^,]+)/);
                                    const batteryMatch = notes.match(/Battery:\s*([^,]+)/);

                                    return (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="society">Society/Area</Label>
                                            <Input 
                                              id="society" 
                                              name="society" 
                                              defaultValue={societyMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., Gulberg"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="houseType">House Type</Label>
                                            <Input 
                                              id="houseType" 
                                              name="houseType" 
                                              defaultValue={houseMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., 1kanal"
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="roofArea">Roof Area</Label>
                                            <Input 
                                              id="roofArea" 
                                              name="roofArea" 
                                              defaultValue={roofAreaMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., 400 × 20"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="panelsRequired">Panels Required</Label>
                                            <Input 
                                              id="panelsRequired" 
                                              name="panelsRequired" 
                                              defaultValue={panelsMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., 77"
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="inverterSpec">Inverter Specification</Label>
                                            <Input 
                                              id="inverterSpec" 
                                              name="inverterSpec" 
                                              defaultValue={inverterMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., 51kW"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="batterySpec">Battery Specification</Label>
                                            <Input 
                                              id="batterySpec" 
                                              name="batterySpec" 
                                              defaultValue={batteryMatch?.[1]?.trim() || ''}
                                              placeholder="e.g., 16&Ah"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </TabsContent>

                                {/* Notes Tab */}
                                <TabsContent value="notes" className="space-y-4 mt-0">
                                  {(() => {
                                    // Clean notes by removing information that's now in dedicated tabs
                                    let cleanedNotes = editingQuotation.notes || '';
                                    if (cleanedNotes) {
                                      // Remove contact information (now in Contact tab)
                                      cleanedNotes = cleanedNotes.replace(/Contact:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/Email:\s*[^,]+,?\s*/gi, '');

                                      // Remove technical information (now in Technical tab)
                                      cleanedNotes = cleanedNotes.replace(/Society:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/House:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/Roof Area:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/Panels Required:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/Inverter:\s*[^,]+,?\s*/gi, '');
                                      cleanedNotes = cleanedNotes.replace(/Battery:\s*[^,]+,?\s*/gi, '');

                                      // Clean up extra commas and spaces
                                      cleanedNotes = cleanedNotes.replace(/,\s*,/g, ',');
                                      cleanedNotes = cleanedNotes.replace(/^,\s*/, '');
                                      cleanedNotes = cleanedNotes.replace(/,\s*$/, '');
                                      cleanedNotes = cleanedNotes.trim();
                                    }

                                    return (
                                      <div>
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <Textarea 
                                          id="notes" 
                                          name="notes" 
                                          key={`notes-${editingQuotation.id}`}
                                          defaultValue={cleanedNotes}
                                          rows={8}
                                          placeholder="Any additional information or special requirements..."
                                        />
                                        {cleanedNotes !== (editingQuotation.notes || '') && (
                                          <p className="text-xs text-gray-500 mt-2">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Contact and technical details have been moved to their respective tabs.
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </TabsContent>
                              </div>
                            </Tabs>
                          </div>

                          {/* Submit Button - Fixed Footer */}
                          <div className="flex justify-center pt-4 border-t border-gray-200 flex-shrink-0 bg-white">
                            <Button type="submit" className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors" disabled={updateQuotationMutation.isPending}>
                              {updateQuotationMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save mr-2"></i>
                                  Update Quotation
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {activeModule === 'complaints' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Complaints Management</h2>
                    <Button
                      onClick={() => setIsCreateComplaintModalOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Complaint
                    </Button>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search complaints by title or customer..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Complaint #</th>
                              <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                              <th className="text-left p-4 font-medium text-gray-700">Title</th>
                              <th className="text-left p-4 font-medium text-gray-700">Priority</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Date</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(complaintsArray, ['title', 'customerName', 'customerId'])).map((complaint: any) => (
                              <tr key={complaint.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <span className="font-mono text-sm text-red-600">#{complaint.id.split('-')[1] || complaint.id.slice(-3)}</span>
                                </td>
                                <td className="p-4">{complaint.customerName || complaint.customerId}</td>
                                <td className="p-4">
                                  <p className="font-medium">{complaint.title}</p>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      complaint.priority === 'high' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                                      complaint.priority === 'medium' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                    }
                                  >
                                    {complaint.priority}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      complaint.status === 'resolved' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      complaint.status === 'investigating' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                                      complaint.status === 'open' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      complaint.status === 'closed' ? 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600' :
                                      'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                    }
                                  >
                                    {complaint.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  {new Date(complaint.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-1 flex-wrap">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setViewingComplaint(complaint)}
                                      title="View"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingComplaint(complaint)}
                                      title="Edit"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setAssigningTechnician(complaint)}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Assign Technician"
                                    >
                                      <i className="fas fa-user-plus"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "Delete Complaint",
                                          description: `Are you sure you want to delete the complaint "${complaint.title}"? This action cannot be undone.`,
                                          onConfirm: () => {
                                            deleteComplaintMutation.mutate(complaint.id);
                                            setConfirmModal({ ...confirmModal, isOpen: false });
                                          },
                                          confirmText: "Delete Complaint",
                                          cancelText: "Cancel"
                                        });
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Delete"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(complaintsArray, ['title', 'customerName', 'customerId']).length)} of {getFilteredData(complaintsArray, ['title', 'customerName', 'customerId']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(complaintsArray, ['title', 'customerName', 'customerId']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(complaintsArray, ['title', 'customerName', 'customerId']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Create Complaint Modal */}
                  <Dialog open={isCreateComplaintModalOpen} onOpenChange={setIsCreateComplaintModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Complaint</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const data = Object.fromEntries(formData.entries());
                        
                        createComplaintMutation.mutate({
                          customerId: `customer-${Date.now()}`, // Generate unique customer ID
                          customerName: data.customerName,
                          installationId: null,
                          title: data.title,
                          description: data.description,
                          priority: data.priority,
                          status: data.status || 'open',
                        });
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="customerName">Customer Name *</Label>
                          <Input id="customerName" name="customerName" required />
                        </div>
                        
                        <div>
                          <Label htmlFor="title">Complaint Title *</Label>
                          <Input id="title" name="title" required />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" rows={4} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="priority">Priority *</Label>
                            <Select name="priority" defaultValue="medium" required>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue="open">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setIsCreateComplaintModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createComplaintMutation.isPending}>
                            {createComplaintMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus mr-2"></i>
                                Create Complaint
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Complaint Modal */}
                  {editingComplaint && (
                    <Dialog open={!!editingComplaint} onOpenChange={() => setEditingComplaint(null)}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Complaint</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const data = Object.fromEntries(formData.entries());
                          
                          updateComplaintMutation.mutate({
                            id: editingComplaint.id,
                            customerId: editingComplaint.customerId, // Keep existing
                            customerName: data.customerName,
                            installationId: editingComplaint.installationId, // Keep existing
                            title: data.title,
                            description: data.description,
                            priority: data.priority,
                            status: data.status,
                            resolution: data.resolution,
                          });
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" name="customerName" defaultValue={editingComplaint.customerName} disabled className="bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <Label htmlFor="title">Complaint Title *</Label>
                            <Input id="title" name="title" defaultValue={editingComplaint.title} required />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingComplaint.description || ''} rows={4} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="priority">Priority *</Label>
                              <Select name="priority" defaultValue={editingComplaint.priority} required>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select name="status" defaultValue={editingComplaint.status}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="resolution">Resolution</Label>
                            <Textarea id="resolution" name="resolution" defaultValue={editingComplaint.resolution || ''} rows={3} placeholder="Enter resolution details when complaint is resolved..." />
                          </div>
                          
                          <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setEditingComplaint(null)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={updateComplaintMutation.isPending}>
                              {updateComplaintMutation.isPending ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save mr-2"></i>
                                  Update Complaint
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* View Complaint Modal */}
                  {viewingComplaint && (
                    <Dialog open={!!viewingComplaint} onOpenChange={() => setViewingComplaint(null)}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Complaint Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Customer Name</Label>
                            <p className="font-medium">{viewingComplaint.customerName}</p>
                          </div>
                          
                          <div>
                            <Label>Complaint Title</Label>
                            <p className="font-medium">{viewingComplaint.title}</p>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-gray-700">{viewingComplaint.description || 'No description provided'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label>Priority</Label>
                              <div className="mt-1">
                                <Badge 
                                  className={
                                    viewingComplaint.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                                    viewingComplaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-blue-100 text-blue-800 border-blue-200'
                                  }
                                >
                                  {viewingComplaint.priority}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div className="mt-1">
                                <Badge 
                                  className={
                                    viewingComplaint.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                    viewingComplaint.status === 'investigating' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    viewingComplaint.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }
                                >
                                  {viewingComplaint.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Created Date</Label>
                              <p className="text-sm">{new Date(viewingComplaint.createdAt).toLocaleDateString()}</p>
                            </div>
                            {viewingComplaint.resolvedAt && (
                              <div>
                                <Label>Resolved Date</Label>
                                <p className="text-sm">{new Date(viewingComplaint.resolvedAt).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                          
                          {viewingComplaint.resolution && (
                            <div>
                              <Label>Resolution</Label>
                              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{viewingComplaint.resolution}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setViewingComplaint(null)}>
                              Close
                            </Button>
                            <Button 
                              onClick={async () => {
                                // Get technician info if assigned
                                let technicianInfo = null;
                                if (viewingComplaint.assignedTechnicianId) {
                                  try {
                                    const response = await fetch(`/api/technicians/${viewingComplaint.assignedTechnicianId}`);
                                    if (response.ok) {
                                      technicianInfo = await response.json();
                                    }
                                  } catch (error) {
                                    console.error('Failed to fetch technician info:', error);
                                  }
                                }
                                
                                const currentDate = new Date().toLocaleDateString('en-GB');
                                const createdDate = new Date(viewingComplaint.createdAt);
                                const resolvedDate = viewingComplaint.resolvedAt ? new Date(viewingComplaint.resolvedAt) : null;
                                
                                // Calculate resolution timeline
                                const resolutionTime = resolvedDate ? 
                                  Math.ceil((resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

                                // Generate comprehensive print content
                                const printContent = `
                                  <div style="padding: 0; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
                                    <!-- Header -->
                                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: white; padding: 30px; text-align: center; margin-bottom: 30px;">
                                      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ElectroCare Solar Solutions</h1>
                                      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Professional Solar Energy Services</p>
                                      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                                        <h2 style="margin: 0; font-size: 20px;">CUSTOMER COMPLAINT REPORT</h2>
                                      </div>
                                    </div>

                                    <!-- Main Content -->
                                    <div style="flex-grow: 1; padding: 0 30px;">
                                      <!-- Report Info -->
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                                          <div>
                                            <strong style="color: #374151;">Complaint ID:</strong><br>
                                            <span style="font-family: monospace; color: #ef4444; font-weight: bold;">#${viewingComplaint.id.split('-')[1] || viewingComplaint.id.slice(-3)}</span>
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Report Date:</strong><br>
                                            ${currentDate}
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Status:</strong><br>
                                            <span style="
                                              padding: 4px 12px; 
                                              border-radius: 12px; 
                                              font-size: 12px; 
                                              font-weight: bold;
                                              background: ${viewingComplaint.status === 'resolved' ? '#dcfce7' : 
                                                           viewingComplaint.status === 'investigating' ? '#fef3c7' : 
                                                           viewingComplaint.status === 'open' ? '#dbeafe' : '#f3f4f6'};
                                              color: ${viewingComplaint.status === 'resolved' ? '#166534' : 
                                                      viewingComplaint.status === 'investigating' ? '#92400e' : 
                                                      viewingComplaint.status === 'open' ? '#1e40af' : '#374151'};
                                            ">${viewingComplaint.status.toUpperCase()}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Customer Information -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Customer Information</h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                          <div>
                                            <strong style="color: #374151;">Customer Name:</strong><br>
                                            <span style="font-size: 16px; color: #1f2937;">${viewingComplaint.customerName}</span>
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Priority Level:</strong><br>
                                            <span style="
                                              padding: 6px 14px; 
                                              border-radius: 20px; 
                                              font-size: 13px; 
                                              font-weight: bold;
                                              background: ${viewingComplaint.priority === 'high' ? '#fef2f2' : 
                                                           viewingComplaint.priority === 'medium' ? '#fffbeb' : '#eff6ff'};
                                              color: ${viewingComplaint.priority === 'high' ? '#991b1b' : 
                                                      viewingComplaint.priority === 'medium' ? '#92400e' : '#1e40af'};
                                              border: 1px solid ${viewingComplaint.priority === 'high' ? '#fecaca' : 
                                                                  viewingComplaint.priority === 'medium' ? '#fed7aa' : '#dbeafe'};
                                            ">${viewingComplaint.priority.toUpperCase()}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Complaint Details -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Complaint Details</h3>
                                        <div style="margin-bottom: 15px;">
                                          <strong style="color: #374151;">Title:</strong><br>
                                          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; font-size: 16px; color: #1f2937;">
                                            ${viewingComplaint.title}
                                          </div>
                                        </div>
                                        
                                        ${viewingComplaint.description ? `
                                          <div style="margin-bottom: 15px;">
                                            <strong style="color: #374151;">Description:</strong><br>
                                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; line-height: 1.6; color: #374151;">
                                              ${viewingComplaint.description}
                                            </div>
                                          </div>
                                        ` : ''}
                                      </div>

                                      <!-- Timeline -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Timeline</h3>
                                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                          <div style="display: grid; grid-template-columns: 1fr 1fr ${resolvedDate ? '1fr' : ''}; gap: 20px;">
                                            <div>
                                              <strong style="color: #374151;">Date Submitted:</strong><br>
                                              <span style="color: #1f2937;">${createdDate.toLocaleDateString('en-GB')}</span><br>
                                              <span style="color: #6b7280; font-size: 12px;">${createdDate.toLocaleTimeString('en-GB')}</span>
                                            </div>
                                            <div>
                                              <strong style="color: #374151;">Days Since Submission:</strong><br>
                                              <span style="color: #1f2937; font-weight: bold;">${Math.ceil((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                            </div>
                                            ${resolvedDate ? `
                                              <div>
                                                <strong style="color: #374151;">Resolution Time:</strong><br>
                                                <span style="color: #059669; font-weight: bold;">${resolutionTime} days</span><br>
                                                <span style="color: #6b7280; font-size: 12px;">Resolved on ${resolvedDate.toLocaleDateString('en-GB')}</span>
                                              </div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      </div>

                                      ${technicianInfo ? `
                                        <!-- Assigned Technician -->
                                        <div style="margin-bottom: 25px;">
                                          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Assigned Technician</h3>
                                          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd;">
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                              <div>
                                                <strong style="color: #374151;">Name:</strong><br>
                                                <span style="color: #1f2937; font-size: 16px;">${technicianInfo.name}</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Specialization:</strong><br>
                                                <span style="color: #1f2937;">${technicianInfo.specializations ? technicianInfo.specializations.join(', ') : 'N/A'}</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Experience:</strong><br>
                                                <span style="color: #1f2937;">${technicianInfo.experienceYears || 0} years</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Rating:</strong><br>
                                                <span style="color: #059669; font-weight: bold;">${technicianInfo.rating || '0.0'}/5.0</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ` : ''}

                                      ${viewingComplaint.resolution ? `
                                        <!-- Resolution -->
                                        <div style="margin-bottom: 25px;">
                                          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Resolution</h3>
                                          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0;">
                                            <div style="line-height: 1.6; color: #374151; margin-bottom: 15px;">
                                              ${viewingComplaint.resolution}
                                            </div>
                                            ${resolvedDate ? `
                                              <div style="border-top: 1px solid #bbf7d0; padding-top: 15px; color: #065f46;">
                                                <strong>Resolved on:</strong> ${resolvedDate.toLocaleDateString('en-GB')} at ${resolvedDate.toLocaleTimeString('en-GB')}
                                              </div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      ` : ''}
                                    </div>

                                    <!-- Footer -->
                                    <div style="background: #f8fafc; padding: 20px 30px; margin-top: 30px; border-top: 1px solid #e2e8f0;">
                                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px; color: #6b7280;">
                                        <div>
                                          <strong style="color: #374151;">ElectroCare Solar Solutions</strong><br>
                                          Phone: +92 300 1234567<br>
                                          Email: support@electrocare.com<br>
                                          Website: www.electrocare.com
                                        </div>
                                        <div style="text-align: right;">
                                          <strong style="color: #374151;">Report Generated:</strong><br>
                                          ${currentDate}<br>
                                          <br>
                                          <em>This is an official complaint report</em>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                `;

                                // Open print window
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>Complaint Report - ${viewingComplaint.customerName} - ${viewingComplaint.id}</title>
                                        <style>
                                          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                          @media print {
                                            body { padding: 0; }
                                            .no-print { display: none; }
                                          }
                                          @page {
                                            margin: 1cm;
                                            size: A4;
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        ${printContent}
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.focus();
                                  setTimeout(() => printWindow.print(), 250);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <i className="fas fa-print mr-2"></i>
                              Print Complaint
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}

              {activeModule === 'tickets' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tickets Management</h2>
                    <Button 
                      onClick={() => setIsCreateTicketModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Ticket
                    </Button>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search tickets by subject or customer..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="max-w-md"
                    />
                  </div>

                  <Card className="rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left p-4 font-medium text-gray-700">Ticket #</th>
                              <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                              <th className="text-left p-4 font-medium text-gray-700">Subject</th>
                              <th className="text-left p-4 font-medium text-gray-700">Category</th>
                              <th className="text-left p-4 font-medium text-gray-700">Priority</th>
                              <th className="text-left p-4 font-medium text-gray-700">Status</th>
                              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedData(getFilteredData(ticketsArray, ['subject', 'customerName', 'customerId'])).map((ticket: any) => (
                              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <span className="font-mono text-sm text-blue-600">#{ticket.id.split('-')[1] || ticket.id.slice(-3)}</span>
                                </td>
                                <td className="p-4">{ticket.customerName || ticket.customerId}</td>
                                <td className="p-4">
                                  <p className="font-medium">{ticket.subject}</p>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline">{ticket.category}</Badge>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      ticket.priority === 'high' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                                      ticket.priority === 'medium' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                    }
                                  >
                                    {ticket.priority}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    className={
                                      ticket.status === 'resolved' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                                      ticket.status === 'in_progress' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                                      ticket.status === 'open' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                                      ticket.status === 'closed' ? 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600' :
                                      'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                    }
                                  >
                                    {ticket.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-1 flex-wrap">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setViewingTicket(ticket)}
                                      title="View"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingTicket(ticket)}
                                      title="Edit"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setAssigningTechnician(ticket)}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Assign Technician"
                                    >
                                      <i className="fas fa-user-plus"></i>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "Delete Ticket",
                                          description: `Are you sure you want to delete ticket #${ticket.id.split('-')[1] || ticket.id.slice(-3)}? This action cannot be undone.`,
                                          onConfirm: () => {
                                            deleteTicketMutation.mutate(ticket.id);
                                            setConfirmModal({ ...confirmModal, isOpen: false });
                                          },
                                          confirmText: "Delete Ticket",
                                          cancelText: "Cancel"
                                        });
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Delete"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(ticketsArray, ['subject', 'customerName', 'customerId']).length)} of {getFilteredData(ticketsArray, ['subject', 'customerName', 'customerId']).length} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredData(ticketsArray, ['subject', 'customerName', 'customerId']).length), currentPage + 1))}
                            disabled={currentPage === getTotalPages(getFilteredData(ticketsArray, ['subject', 'customerName', 'customerId']).length)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Create Ticket Modal */}
                  {isCreateTicketModalOpen && (
                    <Dialog open={isCreateTicketModalOpen} onOpenChange={setIsCreateTicketModalOpen}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Ticket</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const data = Object.fromEntries(formData.entries());
                          
                          createTicketMutation.mutate({
                            customerId: `customer-${Date.now()}`, // Generate unique customer ID
                            customerName: data.customerName,
                            subject: data.subject,
                            description: data.description,
                            priority: data.priority,
                            status: data.status || 'open',
                            category: data.category,
                            assignedToId: data.assignedToId === "unassigned" ? null : data.assignedToId,
                          });
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name *</Label>
                            <Input id="customerName" name="customerName" required />
                          </div>
                          
                          <div>
                            <Label htmlFor="subject">Subject *</Label>
                            <Input id="subject" name="subject" required />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" rows={3} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="priority">Priority *</Label>
                              <Select name="priority" defaultValue="medium" required>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select name="status" defaultValue="open">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select name="category">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technical">Technical Support</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                  <SelectItem value="installation">Installation</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="assignedToId">Assign To</Label>
                              <Select name="assignedToId" defaultValue="unassigned">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {techniciansArray?.map((tech: any) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsCreateTicketModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createTicketMutation.isPending}>
                              {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Edit Ticket Modal */}
                  {editingTicket && (
                    <Dialog open={!!editingTicket} onOpenChange={() => setEditingTicket(null)}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Ticket</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const data = Object.fromEntries(formData.entries());
                          
                          updateTicketMutation.mutate({
                            id: editingTicket.id,
                            customerId: editingTicket.customerId, // Keep existing
                            customerName: data.customerName,
                            subject: data.subject,
                            description: data.description,
                            priority: data.priority,
                            status: data.status,
                            category: data.category,
                            assignedToId: data.assignedToId === "unassigned" ? null : data.assignedToId,
                            response: data.response,
                          });
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" name="customerName" defaultValue={editingTicket.customerName} disabled className="bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <Label htmlFor="subject">Subject *</Label>
                            <Input id="subject" name="subject" defaultValue={editingTicket.subject} required />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingTicket.description || ''} rows={3} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="priority">Priority *</Label>
                              <Select name="priority" defaultValue={editingTicket.priority} required>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select name="status" defaultValue={editingTicket.status}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select name="category" defaultValue={editingTicket.category || ''}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technical">Technical Support</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                  <SelectItem value="installation">Installation</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="assignedToId">Assign To</Label>
                              <Select name="assignedToId" defaultValue={editingTicket.assignedToId || "unassigned"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {techniciansArray?.map((tech: any) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="response">Response/Resolution</Label>
                            <Textarea id="response" name="response" defaultValue={editingTicket.response || ''} rows={4} placeholder="Add response or resolution details..." />
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setEditingTicket(null)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={updateTicketMutation.isPending}>
                              {updateTicketMutation.isPending ? "Updating..." : "Update Ticket"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* View Ticket Modal */}
                  {viewingTicket && (
                    <Dialog open={!!viewingTicket} onOpenChange={() => setViewingTicket(null)}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Ticket Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Customer Name</Label>
                            <p className="font-medium">{viewingTicket.customerName}</p>
                          </div>
                          
                          <div>
                            <Label>Subject</Label>
                            <p className="font-medium">{viewingTicket.subject}</p>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-gray-700">{viewingTicket.description || 'No description provided'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label>Priority</Label>
                              <div className="mt-1">
                                <Badge 
                                  className={
                                    viewingTicket.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                                    viewingTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-blue-100 text-blue-800 border-blue-200'
                                  }
                                >
                                  {viewingTicket.priority}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div className="mt-1">
                                <Badge 
                                  className={
                                    viewingTicket.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                    viewingTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    viewingTicket.status === 'open' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    viewingTicket.status === 'closed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                  }
                                >
                                  {viewingTicket.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {viewingTicket.category && (
                            <div>
                              <Label>Category</Label>
                              <p className="text-sm text-gray-700">{viewingTicket.category}</p>
                            </div>
                          )}

                          {viewingTicket.assignedToId && (
                            <div>
                              <Label>Assigned To</Label>
                              <p className="text-sm text-gray-700">
                                {techniciansArray?.find((tech: any) => tech.id === viewingTicket.assignedToId)?.name || viewingTicket.assignedToId}
                              </p>
                            </div>
                          )}

                          {viewingTicket.response && (
                            <div>
                              <Label>Response/Resolution</Label>
                              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{viewingTicket.response}</p>
                            </div>
                          )}

                          <div>
                            <Label>Created Date</Label>
                            <p className="text-sm text-gray-700">{new Date(viewingTicket.createdAt).toLocaleDateString()}</p>
                          </div>

                          {viewingTicket.resolvedAt && (
                            <div>
                              <Label>Resolved Date</Label>
                              <p className="text-sm text-gray-700">{new Date(viewingTicket.resolvedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setViewingTicket(null)}>
                              Close
                            </Button>
                            <Button 
                              onClick={async () => {
                                // Get technician info if assigned
                                let technicianInfo = null;
                                if (viewingTicket.assignedTechnicianId) {
                                  try {
                                    const response = await fetch(`/api/technicians/${viewingTicket.assignedTechnicianId}`);
                                    if (response.ok) {
                                      technicianInfo = await response.json();
                                    }
                                  } catch (error) {
                                    console.error('Failed to fetch technician info:', error);
                                  }
                                }
                                
                                const currentDate = new Date().toLocaleDateString('en-GB');
                                const createdDate = new Date(viewingTicket.createdAt);
                                const resolvedDate = viewingTicket.resolvedAt ? new Date(viewingTicket.resolvedAt) : null;
                                
                                // Calculate resolution timeline
                                const resolutionTime = resolvedDate ? 
                                  Math.ceil((resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

                                // Generate comprehensive print content
                                const printContent = `
                                  <div style="padding: 0; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
                                    <!-- Header -->
                                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: white; padding: 30px; text-align: center; margin-bottom: 30px;">
                                      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ElectroCare Solar Solutions</h1>
                                      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Professional Solar Energy Services</p>
                                      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                                        <h2 style="margin: 0; font-size: 20px;">SUPPORT TICKET REPORT</h2>
                                      </div>
                                    </div>

                                    <!-- Main Content -->
                                    <div style="flex-grow: 1; padding: 0 30px;">
                                      <!-- Report Info -->
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                                          <div>
                                            <strong style="color: #374151;">Ticket ID:</strong><br>
                                            <span style="font-family: monospace; color: #2563eb; font-weight: bold;">#${viewingTicket.id.split('-')[1] || viewingTicket.id.slice(-3)}</span>
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Report Date:</strong><br>
                                            ${currentDate}
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Status:</strong><br>
                                            <span style="
                                              padding: 4px 12px; 
                                              border-radius: 12px; 
                                              font-size: 12px; 
                                              font-weight: bold;
                                              background: ${viewingTicket.status === 'resolved' ? '#dcfce7' : 
                                                           viewingTicket.status === 'in_progress' ? '#dbeafe' : 
                                                           viewingTicket.status === 'open' ? '#fef3c7' : 
                                                           viewingTicket.status === 'closed' ? '#f3f4f6' : '#fef2f2'};
                                              color: ${viewingTicket.status === 'resolved' ? '#166534' : 
                                                      viewingTicket.status === 'in_progress' ? '#1e40af' : 
                                                      viewingTicket.status === 'open' ? '#92400e' : 
                                                      viewingTicket.status === 'closed' ? '#374151' : '#991b1b'};
                                            ">${viewingTicket.status.toUpperCase()}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Customer Information -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Customer Information</h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                          <div>
                                            <strong style="color: #374151;">Customer Name:</strong><br>
                                            <span style="font-size: 16px; color: #1f2937;">${viewingTicket.customerName}</span>
                                          </div>
                                          <div>
                                            <strong style="color: #374151;">Priority Level:</strong><br>
                                            <span style="
                                              padding: 6px 14px; 
                                              border-radius: 20px; 
                                              font-size: 13px; 
                                              font-weight: bold;
                                              background: ${viewingTicket.priority === 'high' ? '#fef2f2' : 
                                                           viewingTicket.priority === 'medium' ? '#fffbeb' : '#eff6ff'};
                                              color: ${viewingTicket.priority === 'high' ? '#991b1b' : 
                                                      viewingTicket.priority === 'medium' ? '#92400e' : '#1e40af'};
                                              border: 1px solid ${viewingTicket.priority === 'high' ? '#fecaca' : 
                                                                  viewingTicket.priority === 'medium' ? '#fed7aa' : '#dbeafe'};
                                            ">${viewingTicket.priority.toUpperCase()}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Ticket Details -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Ticket Details</h3>
                                        <div style="margin-bottom: 15px;">
                                          <strong style="color: #374151;">Subject:</strong><br>
                                          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; font-size: 16px; color: #1f2937;">
                                            ${viewingTicket.subject}
                                          </div>
                                        </div>
                                        
                                        ${viewingTicket.description ? `
                                          <div style="margin-bottom: 15px;">
                                            <strong style="color: #374151;">Description:</strong><br>
                                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; line-height: 1.6; color: #374151;">
                                              ${viewingTicket.description}
                                            </div>
                                          </div>
                                        ` : ''}
                                        
                                        ${viewingTicket.category ? `
                                          <div style="margin-bottom: 15px;">
                                            <strong style="color: #374151;">Category:</strong><br>
                                            <span style="color: #1f2937; background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-size: 14px;">${viewingTicket.category}</span>
                                          </div>
                                        ` : ''}
                                      </div>

                                      <!-- Timeline -->
                                      <div style="margin-bottom: 25px;">
                                        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Timeline</h3>
                                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                          <div style="display: grid; grid-template-columns: 1fr 1fr ${resolvedDate ? '1fr' : ''}; gap: 20px;">
                                            <div>
                                              <strong style="color: #374151;">Date Submitted:</strong><br>
                                              <span style="color: #1f2937;">${createdDate.toLocaleDateString('en-GB')}</span><br>
                                              <span style="color: #6b7280; font-size: 12px;">${createdDate.toLocaleTimeString('en-GB')}</span>
                                            </div>
                                            <div>
                                              <strong style="color: #374151;">Days Since Submission:</strong><br>
                                              <span style="color: #1f2937; font-weight: bold;">${Math.ceil((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                            </div>
                                            ${resolvedDate ? `
                                              <div>
                                                <strong style="color: #374151;">Resolution Time:</strong><br>
                                                <span style="color: #059669; font-weight: bold;">${resolutionTime} days</span><br>
                                                <span style="color: #6b7280; font-size: 12px;">Resolved on ${resolvedDate.toLocaleDateString('en-GB')}</span>
                                              </div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      </div>

                                      ${technicianInfo ? `
                                        <!-- Assigned Technician -->
                                        <div style="margin-bottom: 25px;">
                                          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Assigned Technician</h3>
                                          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd;">
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                              <div>
                                                <strong style="color: #374151;">Name:</strong><br>
                                                <span style="color: #1f2937; font-size: 16px;">${technicianInfo.name}</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Specialization:</strong><br>
                                                <span style="color: #1f2937;">${technicianInfo.specializations ? technicianInfo.specializations.join(', ') : 'N/A'}</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Experience:</strong><br>
                                                <span style="color: #1f2937;">${technicianInfo.experienceYears || 0} years</span>
                                              </div>
                                              <div>
                                                <strong style="color: #374151;">Rating:</strong><br>
                                                <span style="color: #059669; font-weight: bold;">${technicianInfo.rating || '0.0'}/5.0</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ` : ''}

                                      ${viewingTicket.response ? `
                                        <!-- Resolution -->
                                        <div style="margin-bottom: 25px;">
                                          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Response/Resolution</h3>
                                          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0;">
                                            <div style="line-height: 1.6; color: #374151; margin-bottom: 15px;">
                                              ${viewingTicket.response}
                                            </div>
                                            ${resolvedDate ? `
                                              <div style="border-top: 1px solid #bbf7d0; padding-top: 15px; color: #065f46;">
                                                <strong>Resolved on:</strong> ${resolvedDate.toLocaleDateString('en-GB')} at ${resolvedDate.toLocaleTimeString('en-GB')}
                                              </div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      ` : ''}
                                    </div>

                                    <!-- Footer -->
                                    <div style="background: #f8fafc; padding: 20px 30px; margin-top: 30px; border-top: 1px solid #e2e8f0;">
                                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px; color: #6b7280;">
                                        <div>
                                          <strong style="color: #374151;">ElectroCare Solar Solutions</strong><br>
                                          Phone: +92 300 1234567<br>
                                          Email: support@electrocare.com<br>
                                          Website: www.electrocare.com
                                        </div>
                                        <div style="text-align: right;">
                                          <strong style="color: #374151;">Report Generated:</strong><br>
                                          ${currentDate}<br>
                                          <br>
                                          <em>This is an official support ticket report</em>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                `;

                                // Open print window
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>Support Ticket Report - ${viewingTicket.customerName} - ${viewingTicket.id}</title>
                                        <style>
                                          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                          @media print {
                                            body { padding: 0; }
                                            .no-print { display: none; }
                                          }
                                          @page {
                                            margin: 1cm;
                                            size: A4;
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        ${printContent}
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.focus();
                                  setTimeout(() => printWindow.print(), 250);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <i className="fas fa-print mr-2"></i>
                              Print Ticket
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />

        {/* Assign Technician Modal */}
        {assigningTechnician && (
          <Dialog open={!!assigningTechnician} onOpenChange={() => setAssigningTechnician(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Assign Technician to {assigningTechnician.subject ? 'Ticket' : 'Complaint'} 
                  #{assigningTechnician.id.split('-')[1] || assigningTechnician.id.slice(-3)}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const technicianId = formData.get('technicianId') as string;
                
                if (assigningTechnician.subject) {
                  // This is a ticket
                  updateTicketMutation.mutate({
                    id: assigningTechnician.id,
                    customerId: assigningTechnician.customerId,
                    customerName: assigningTechnician.customerName,
                    subject: assigningTechnician.subject,
                    description: assigningTechnician.description,
                    priority: assigningTechnician.priority,
                    status: assigningTechnician.status,
                    category: assigningTechnician.category,
                    assignedToId: technicianId === "unassigned" ? null : technicianId,
                    assignedTechnicianId: technicianId === "unassigned" ? null : technicianId,
                    response: assigningTechnician.response,
                  });
                } else {
                  // This is a complaint - update with assigned technician
                  updateComplaintMutation.mutate({
                    id: assigningTechnician.id,
                    customerId: assigningTechnician.customerId,
                    customerName: assigningTechnician.customerName,
                    installationId: assigningTechnician.installationId,
                    title: assigningTechnician.title,
                    description: assigningTechnician.description,
                    priority: assigningTechnician.priority,
                    status: assigningTechnician.status,
                    resolution: assigningTechnician.resolution,
                    assignedTechnicianId: technicianId === "unassigned" ? null : technicianId,
                  });
                }
                setAssigningTechnician(null);
              }} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold">
                    {assigningTechnician.subject ? 'Support Ticket' : 'Customer Complaint'}
                  </Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><strong>Subject/Title:</strong> {assigningTechnician.subject || assigningTechnician.title}</p>
                    <p className="text-sm"><strong>Customer:</strong> {assigningTechnician.customerName}</p>
                    <p className="text-sm">
                      <strong>Priority:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold ${
                        assigningTechnician.priority === 'high' ? 'bg-red-100 text-red-800' :
                        assigningTechnician.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {assigningTechnician.priority?.toUpperCase()}
                      </span>
                    </p>
                    {assigningTechnician.category && (
                      <p className="text-sm"><strong>Category:</strong> {assigningTechnician.category}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="technicianId">Select Technician *</Label>
                  <Select name="technicianId" defaultValue={assigningTechnician.assignedTechnicianId || assigningTechnician.assignedToId || "unassigned"} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center">
                          <i className="fas fa-user-slash mr-2 text-gray-400"></i>
                          Unassigned
                        </div>
                      </SelectItem>
                      {techniciansArray?.map((tech: any) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-xs text-gray-500">
                                {tech.specializations?.join(', ') || tech.specialization || 'General'} • 
                                {tech.experienceYears || 0} years • 
                                Rating: {tech.rating || '0.0'}/5.0
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the best technician based on specialization and workload
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setAssigningTechnician(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateTicketMutation.isPending || updateComplaintMutation.isPending}>
                    {(updateTicketMutation.isPending || updateComplaintMutation.isPending) ? "Assigning..." : "Assign Technician"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="border-b pb-4 flex-shrink-0">
                <DialogTitle className="text-2xl font-bold text-gray-900">Edit {activeModule === 'users' ? 'User' : activeModule === 'services' ? 'Service' : 'Technician'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                if (activeModule === 'users') {
                  updateUserMutation.mutate({
                    id: editingItem.id,
                    email: formData.get('email'),
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    role: formData.get('role'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                  });
                } else if (activeModule === 'services') {
                  updateServiceMutation.mutate({
                    id: editingItem.id,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    price: formData.get('price'),
                    isActive: formData.get('status') === 'active',
                  });
                } else if (activeModule === 'technicians') {
                  // Use React Hook Form submission with validation error handling
                  return editTechnicianForm.handleSubmit(
                    // onValid - called when form is valid
                    (formData) => {
                      updateTechnicianMutation.mutate({
                        id: editingItem.id,
                        ...formData,
                      });
                    },
                    // onInvalid - called when form has validation errors
                    (errors) => {
                      console.log('Form validation errors:', errors);
                      
                      // Find the first error and navigate to its tab
                      const firstErrorField = Object.keys(errors)[0];
                      const targetTab = technicianFieldToTab[firstErrorField] || "basic";
                      
                      // Navigate to the tab containing the error
                      if (editTechnicianTab !== targetTab) {
                        setEditTechnicianTab(targetTab);
                      }
                      
                      // Focus the field with error after tab switch
                      setTimeout(() => {
                        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement | null;
                        if (errorElement) {
                          errorElement.focus();
                          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }
                  )(e);
                }
              }} className="space-y-4">

                {activeModule === 'users' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" defaultValue={editingItem.firstName} required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" defaultValue={editingItem.lastName} required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingItem.email} required />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" defaultValue={editingItem.role} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={editingItem.phone} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" name="address" defaultValue={editingItem.address} />
                    </div>
                  </>
                )}

                {activeModule === 'services' && (
                  <>
                    <div>
                      <Label htmlFor="name">Service Name</Label>
                      <Input id="name" name="name" defaultValue={editingItem.name} required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingItem.description} required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={editingItem.category} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price (PKR)</Label>
                      <Input id="price" name="price" type="number" step="0.01" defaultValue={editingItem.price} required />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingItem.isActive ? 'active' : 'inactive'} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {activeModule === 'technicians' && (
                  <Form {...editTechnicianForm}>
                    <div className="flex-1 overflow-hidden">
                      <Tabs value={editTechnicianTab} onValueChange={setEditTechnicianTab} className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 mb-6 flex-shrink-0">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="professional">Professional</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto pr-2">
                          {/* Basic Info Tab */}
                          <TabsContent value="basic" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 gap-6">
                              <FormField
                                control={editTechnicianForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Enter full name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editTechnicianForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" placeholder="technician@electrocare.com" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editTechnicianForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone *</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="+92 300 1234567" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editTechnicianForm.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>

                          {/* Professional Tab */}
                          <TabsContent value="professional" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 gap-6">
                              <FormField
                                control={editTechnicianForm.control}
                                name="specialization"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Specialization *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select specialization" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="Solar Installation">Solar Installation</SelectItem>
                                        <SelectItem value="General Installation">General Installation</SelectItem>
                                        <SelectItem value="Electrical Systems">Electrical Systems</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Battery Systems">Battery Systems</SelectItem>
                                        <SelectItem value="Grid Connection">Grid Connection</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editTechnicianForm.control}
                                name="experience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Experience (Years) *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="0" 
                                        max="50" 
                                        placeholder="e.g., 5"
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormDescription>Years of relevant work experience</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editTechnicianForm.control}
                                name="certifications"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Certifications</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="e.g., Solar Installation Certified, Electrical Safety Training"
                                        rows={3}
                                      />
                                    </FormControl>
                                    <FormDescription>List relevant certifications and training</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </Form>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={
                    activeModule === 'users' ? updateUserMutation.isPending :
                    activeModule === 'services' ? updateServiceMutation.isPending :
                    updateTechnicianMutation.isPending
                  }
                >
                  {(
                    activeModule === 'users' ? updateUserMutation.isPending :
                    activeModule === 'services' ? updateServiceMutation.isPending :
                    updateTechnicianMutation.isPending
                  ) 
                    ? "Updating..." 
                    : `Update ${activeModule === 'users' ? 'User' : activeModule === 'services' ? 'Service' : 'Technician'}`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Technician Assignment Dialog */}
        {assigningTechnician && (
          <Dialog open={!!assigningTechnician} onOpenChange={() => setAssigningTechnician(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Technician to Installation</DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Customer: {assigningTechnician.customerName}<br />
                  Address: {assigningTechnician.address}<br />
                  System Size: {assigningTechnician.capacity} kW
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="technician">Select Technician</Label>
                  <Select onValueChange={(technicianId) => {
                    assignTechnicianMutation.mutate({
                      installationId: assigningTechnician.id,
                      technicianId
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {techniciansArray
                        .filter(tech => tech.status === 'active')
                        .map(technician => (
                          <SelectItem key={technician.id} value={technician.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-medium">{technician.name}</p>
                                <p className="text-xs text-gray-500">
                                  {technician.specializations?.slice(0, 2).join(', ')} • 
                                  {technician.experienceYears}y exp • 
                                  {technician.rating}★
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {techniciansArray.filter(tech => tech.status === 'active').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active technicians available. Please ensure technicians are marked as active.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setAssigningTechnician(null)}
                    disabled={assignTechnicianMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Enhanced Quotation Modal */}
        <EnhancedQuotationModal
          isOpen={!!editingQuotation}
          onClose={() => setEditingQuotation(null)}
          onSave={async (formData) => {
            try {
              console.log('Enhanced Modal Save Data:', formData);

              // Convert form data to match API expectations
              const quotationData = {
                ...formData,
                id: editingQuotation?.id || formData.id,
                customerId: editingQuotation?.customerId,
                customerEmail: formData.email, // Map email from form to customerEmail
              };

              // Remove email field and add customerEmail
              delete quotationData.email;

              console.log('Sending to mutation:', quotationData);
              await updateQuotationMutation.mutateAsync(quotationData);
            } catch (error) {
              console.error('Enhanced modal save error:', error);
              throw error;
            }
          }}
          quotation={editingQuotation}
          isLoading={updateQuotationMutation.isPending}
        />

        {/* Installation View Modal */}
        <Dialog open={viewingInstallation !== null} onOpenChange={() => setViewingInstallation(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Installation Details</DialogTitle>
            </DialogHeader>
            {viewingInstallation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                    <p className="text-gray-900">{viewingInstallation.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Installation ID</Label>
                    <p className="text-gray-900">{viewingInstallation.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-gray-900">{viewingInstallation.address || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">System Capacity</Label>
                    <p className="text-gray-900">{viewingInstallation.capacity} kW</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={
                      viewingInstallation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      viewingInstallation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      viewingInstallation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      viewingInstallation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {viewingInstallation.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Cost</Label>
                    <p className="text-gray-900">PKR {Number(viewingInstallation.totalCost || 0).toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Installation Date</Label>
                    <p className="text-gray-900">
                      {new Date(viewingInstallation.installationDate || viewingInstallation.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Assigned Technician</Label>
                    <p className="text-gray-900">
                      {viewingInstallation.technicianId 
                        ? (techniciansArray?.find(t => t.id === viewingInstallation.technicianId)?.name || 'Unknown')
                        : 'Not assigned'
                      }
                    </p>
                  </div>
                </div>
                {viewingInstallation.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <p className="text-gray-900 whitespace-pre-line">{viewingInstallation.notes}</p>
                  </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      if (!viewingInstallation) return;

                      // Create print content
                      const printContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
                          <h1 style="color: #2563eb; margin-bottom: 20px;">Installation Details</h1>
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div>
                              <strong>Customer Name:</strong><br>
                              ${viewingInstallation.customerName || 'N/A'}
                            </div>
                            <div>
                              <strong>Installation ID:</strong><br>
                              ${viewingInstallation.id}
                            </div>
                            <div>
                              <strong>Address:</strong><br>
                              ${viewingInstallation.address || 'N/A'}
                            </div>
                            <div>
                              <strong>System Capacity:</strong><br>
                              ${viewingInstallation.capacity} kW
                            </div>
                            <div>
                              <strong>Status:</strong><br>
                              ${viewingInstallation.status}
                            </div>
                            <div>
                              <strong>Total Cost:</strong><br>
                              PKR ${Number(viewingInstallation.totalCost || 0).toLocaleString('en-US')}
                            </div>
                            <div>
                              <strong>Installation Date:</strong><br>
                              ${new Date(viewingInstallation.installationDate || viewingInstallation.createdAt).toLocaleDateString('en-GB')}
                            </div>
                            <div>
                              <strong>Assigned Technician:</strong><br>
                              ${viewingInstallation.technicianId 
                                ? (techniciansArray?.find(t => t.id === viewingInstallation.technicianId)?.name || 'Unknown')
                                : 'Not assigned'
                              }
                            </div>
                          </div>
                          ${viewingInstallation.notes ? `
                            <div style="margin-top: 20px;">
                              <strong>Notes:</strong><br>
                              ${viewingInstallation.notes}
                            </div>
                          ` : ''}
                          <div style="margin-top: 40px; text-align: center; color: #666;">
                            <p>Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}</p>
                          </div>
                        </div>
                      `;

                      // Open print window
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>Installation Details - ${viewingInstallation.customerName}</title>
                              <style>
                                body { margin: 0; padding: 0; }
                                @media print {
                                  body { padding: 20px; }
                                }
                              </style>
                            </head>
                            <body>
                              ${printContent}
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Installation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Installation Create/Edit Modal */}
        <Dialog open={isCreateInstallationModalOpen || editingInstallation !== null} onOpenChange={() => {
          setIsCreateInstallationModalOpen(false);
          setEditingInstallation(null);
          setFormErrors({});
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInstallation ? 'Edit Installation' : 'Create Installation'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());

              // Reset form errors
              setFormErrors({});

              // Form validation
              const errors: Record<string, string> = {};

              // Skip customer name validation when editing (field is disabled)
              if (!editingInstallation && !data.customerName?.toString().trim()) {
                errors.customerName = "Customer name is required";
              }

              if (!data.address?.toString().trim()) {
                errors.address = "Address is required";
              }

              if (!data.capacity?.toString().trim()) {
                errors.capacity = "System capacity is required";
              } else if (isNaN(Number(data.capacity)) || Number(data.capacity) <= 0) {
                errors.capacity = "System capacity must be a valid number greater than 0";
              }

              if (!data.status?.toString().trim()) {
                errors.status = "Status is required";
              }

              if (!data.installationDate?.toString().trim()) {
                errors.installationDate = "Installation date is required";
              }

              // Validate totalCost if provided
              if (data.totalCost?.toString().trim() && (isNaN(Number(data.totalCost)) || Number(data.totalCost) < 0)) {
                errors.totalCost = "Total cost must be a valid number";
              }

              if (Object.keys(errors).length > 0) {
                setFormErrors(errors);

                // Focus on first error field
                const firstErrorField = Object.keys(errors)[0];
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                if (errorElement) {
                  errorElement.focus();
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
              }

              // Prepare data for submission - handle empty numeric fields
              const submissionData = {
                ...data,
                capacity: Number(data.capacity),
                totalCost: data.totalCost?.toString().trim() ? Number(data.totalCost) : 0,
              };

              if (editingInstallation) {
                updateInstallationMutation.mutate({ ...submissionData, id: editingInstallation.id });
              } else {
                createInstallationMutation.mutate(submissionData);
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter customer name"
                  defaultValue={editingInstallation?.customerName || ''}
                  className={formErrors.customerName ? 'border-red-500' : ''}
                  disabled={!!editingInstallation}
                />
                {formErrors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete installation address..."
                  defaultValue={editingInstallation?.address || ''}
                  className={formErrors.address ? 'border-red-500' : ''}
                />
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">System Capacity (kW) *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 5.00"
                    defaultValue={editingInstallation?.capacity || ''}
                    className={formErrors.capacity ? 'border-red-500' : ''}
                  />
                  {formErrors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.capacity}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="totalCost">Total Cost (PKR)</Label>
                  <Input
                    id="totalCost"
                    name="totalCost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 500000"
                    defaultValue={editingInstallation?.totalCost || ''}
                    className={formErrors.totalCost ? 'border-red-500' : ''}
                  />
                  {formErrors.totalCost && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.totalCost}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue={editingInstallation?.status || 'pending'}>
                    <SelectTrigger className={formErrors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="installationDate">Installation Date *</Label>
                  <Input
                    id="installationDate"
                    name="installationDate"
                    type="date"
                    defaultValue={editingInstallation?.installationDate 
                      ? new Date(editingInstallation.installationDate).toISOString().split('T')[0] 
                      : ''
                    }
                    className={formErrors.installationDate ? 'border-red-500' : ''}
                    placeholder="dd/mm/yyyy"
                  />
                  {formErrors.installationDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.installationDate}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional installation notes..."
                  defaultValue={editingInstallation?.notes || ''}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingInstallation(null);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInstallationMutation.isPending || updateInstallationMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createInstallationMutation.isPending || updateInstallationMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-save mr-2"></i>
                  )}
                  {editingInstallation ? 'Update Installation' : 'Create Installation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Redesigned Assign Technician Modal */}
        <Dialog open={assigningTechnician !== null} onOpenChange={() => setAssigningTechnician(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Technician</DialogTitle>
              <DialogDescription>
                Assign a technician to installation: {assigningTechnician?.customerName}
              </DialogDescription>
            </DialogHeader>
            {assigningTechnician && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Installation Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <p className="font-medium">{assigningTechnician.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <p className="font-medium">{assigningTechnician.capacity} kW</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className="ml-1 text-xs">{assigningTechnician.status}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="text-xs text-gray-700">{assigningTechnician.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="technicianSelect" className="text-base font-medium">
                    Select Technician
                  </Label>
                  <Select
                    name="technicianId"
                    defaultValue={assigningTechnician.technicianId || ''}
                    onValueChange={(value) => {
                      const form = document.getElementById('assignTechnicianForm') as HTMLFormElement;
                      if (form) {
                        const input = form.querySelector('input[name="technicianId"]') as HTMLInputElement;
                        if (input) {
                          input.value = value;
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {techniciansArray
                        ?.filter((technician: any) => technician.status === 'active')
                        ?.map((technician: any) => (
                        <SelectItem key={technician.id} value={technician.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{technician.name}</span>
                              <span className="text-xs text-gray-500">
                                {technician.specializations} • {technician.experienceYears} years exp.
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={technician.isAvailable ? 'default' : 'secondary'} className="text-xs">
                                {technician.isAvailable ? 'Available' : 'Busy'}
                              </Badge>
                              {technician.rating && (
                                <span className="text-xs text-yellow-600">
                                  ⭐ {technician.rating}/5
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <form
                  id="assignTechnicianForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const technicianId = formData.get('technicianId') as string;

                    if (!technicianId) {
                      toast({
                        title: "Selection Required",
                        description: "Please select a technician to assign",
                        variant: "destructive"
                      });
                      return;
                    }

                    assignTechnicianMutation.mutate({
                      installationId: assigningTechnician.id,
                      technicianId
                    });
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="technicianId" />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setAssigningTechnician(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={assignTechnicianMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {assignTechnicianMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-user-check mr-2"></i>
                      )}
                      Assign Technician
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, title: '', description: '', continueText: 'Continue' })}
          title={successModal.title}
          description={successModal.description}
          continueText={successModal.continueText}
        />

        {/* Confirmation Modal */}
        <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && setConfirmModal({ ...confirmModal, isOpen: false })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-exclamation-triangle text-red-600 text-sm"></i>
                </div>
                {confirmModal.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-gray-600">{confirmModal.description}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                {confirmModal.cancelText}
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                {confirmModal.confirmText}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedFeature>
    </div>
  );
}