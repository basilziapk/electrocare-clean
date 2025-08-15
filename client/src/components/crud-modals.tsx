import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Award, Settings } from "lucide-react";

// Enhanced Success Modal Component
export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  iconType = "success" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  message: string;
  iconType?: "success" | "delete" | "error";
}) {
  const getIcon = () => {
    switch (iconType) {
      case "delete":
        return <i className="fas fa-trash text-3xl text-red-600"></i>;
      case "error":
        return <i className="fas fa-exclamation-triangle text-3xl text-red-600"></i>;
      default:
        return <i className="fas fa-check-circle text-3xl text-green-600"></i>;
    }
  };

  const getBgColor = () => {
    switch (iconType) {
      case "delete":
      case "error":
        return "bg-red-100";
      default:
        return "bg-green-100";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto">
        <div className="text-center py-6">
          <div className={`w-16 h-16 ${getBgColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <Button 
            onClick={onClose}
            className={`${iconType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-2`}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Form Modal
const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "technician", "customer"]),
});

export function UserFormModal({ 
  isOpen, 
  onClose, 
  user = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "customer" as const,
    },
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || "customer",
      });
    } else {
      form.reset({
        email: "",
        firstName: "",
        lastName: "",
        role: "customer",
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";
      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowSuccessModal(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {user ? "Update user information" : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ahmad.khan@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Khan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Success!"
        message={`User ${user ? "updated" : "created"} successfully`}
        iconType="success"
      />
    </>
  );
}

// Service Form Modal
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  duration: z.string().optional(),
  requirements: z.string().optional(),
});

export function ServiceFormModal({ 
  isOpen, 
  onClose, 
  service = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  service?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      requirements: "",
    },
  });
  
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        price: service.price || "",
        duration: service.duration || "",
        requirements: service.requirements || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        category: "",
        price: "",
        duration: "",
        requirements: "",
      });
    }
  }, [service, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = service ? `/api/services/${service.id}` : "/api/services";
      const method = service ? "PUT" : "POST";
      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowSuccessModal(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Create Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update service information" : "Add a new service"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Solar Panel Installation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service..." 
                      {...field} 
                    />
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
                        <SelectValue placeholder="Select a category" />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (PKR)</FormLabel>
                    <FormControl>
                      <Input placeholder="50000" type="number" {...field} />
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
                    <FormLabel>Duration</FormLabel>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}
      title="Success!"
      message={`Service ${service ? "updated" : "created"} successfully`}
      iconType="success"
    />
    </>
  );
}

// Complaint Form Modal
const complaintSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "investigating", "resolved"]),
});

export function ComplaintFormModal({ 
  isOpen, 
  onClose, 
  complaint = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  complaint?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      customerName: "",
      title: "",
      description: "",
      priority: "medium" as const,
      status: "open" as const,
    },
  });
  
  useEffect(() => {
    if (complaint) {
      form.reset({
        customerName: complaint.customerName || "",
        title: complaint.title || "",
        description: complaint.description || "",
        priority: complaint.priority || "medium",
        status: complaint.status || "open",
      });
    } else {
      form.reset({
        customerName: "",
        title: "",
        description: "",
        priority: "medium",
        status: "open",
      });
    }
  }, [complaint, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Generate a dummy customer ID for new complaints
      const customerId = complaint?.customerId || `user-${Date.now()}`;
      
      const processedData = {
        ...data,
        customerId,
      };
      
      const endpoint = complaint ? `/api/complaints/${complaint.id}` : "/api/complaints";
      const method = complaint ? "PUT" : "POST";
      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(processedData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setShowSuccessModal(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{complaint ? "Edit Complaint" : "Create Complaint"}</DialogTitle>
          <DialogDescription>
            {complaint ? "Update complaint information" : "Submit a new complaint"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the complaint..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {complaint && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    <SuccessModal 
      isOpen={showSuccessModal} 
      onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}
      title="Success!"
      message={`Complaint ${complaint ? "updated" : "created"} successfully`}
    />
    </>
  );
}

// Technician Form Modal
const technicianSchema = z.object({
  name: z.string().min(1, "Technician name is required"),
  profileImage: z.string().optional(),
  specializations: z.string().min(1, "Specializations are required"),
  experienceYears: z.string().min(1, "Experience years is required"),
  certifications: z.string().optional(),
  isAvailable: z.boolean(),
  rating: z.string().optional(),
  completionRate: z.string().optional(),
});

export function TechnicianFormModal({ 
  isOpen, 
  onClose, 
  technician = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  technician?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) { // 2MB limit
      setSelectedFile(file);
      // Create base64 data URL for preview only
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFilePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
    }
  };

  // Upload mutation for saving files to profiles folder
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set the file path from server response
      form.setValue('profileImage', data.filePath);
      setFilePreview(null); // Clear preview since we now have the uploaded path
      setSelectedFile(null); // Clear selected file
      toast({
        title: "Upload Successful",
        description: "Profile image uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUploadImage = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };
  
  const form = useForm({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: "",
      profileImage: "",
      specializations: "",
      experienceYears: "",
      certifications: "",
      isAvailable: true,
      rating: "",
      completionRate: "",
    },
  });

  // Reset form and file selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFilePreview(null);
      if (technician) {
        form.reset({
          name: technician.name || "",
          profileImage: technician.profileImage || "",
          specializations: technician.specializations || "",
          experienceYears: technician.experienceYears?.toString() || "",
          certifications: technician.certifications || "",
          isAvailable: technician.isAvailable ?? true,
          rating: technician.rating?.toString() || "",
          completionRate: technician.completionRate?.toString() || "",
        });
        // Set existing profile image as preview if available
        if (technician.profileImage) {
          setFilePreview(technician.profileImage);
        }
      } else {
        form.reset({
          name: "",
          profileImage: "",
          specializations: "",
          experienceYears: "",
          certifications: "",
          isAvailable: true,
          rating: "",
          completionRate: "",
        });
      }
    }
  }, [isOpen, technician, form]);
  
  useEffect(() => {
    if (technician) {
      form.reset({
        name: technician.name || technician.userId || "",
        profileImage: technician.profileImage || "",
        specializations: technician.specializations?.join(", ") || "",
        experienceYears: technician.experienceYears?.toString() || "",
        certifications: technician.certifications?.join(", ") || "",
        isAvailable: technician.isAvailable ?? true,
        rating: technician.rating?.toString() || "",
        completionRate: technician.completionRate?.toString() || "",
      });
    } else {
      form.reset({
        name: "",
        profileImage: "",
        specializations: "",
        experienceYears: "",
        certifications: "",
        isAvailable: true,
        rating: "",
        completionRate: "",
      });
    }
  }, [technician, form]);
  
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof technicianSchema>) => {
      const processedData = {
        ...data,
        name: data.name,
        profileImage: data.profileImage || null,
        specializations: data.specializations.split(',').map(s => s.trim()).filter(Boolean),
        certifications: data.certifications ? data.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
        experienceYears: parseInt(data.experienceYears),
        rating: data.rating ? parseFloat(data.rating) : null,
        completionRate: data.completionRate ? parseFloat(data.completionRate) : null,
      };
      
      if (technician) {
        await apiRequest(`/api/technicians/${technician.id}`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
        });
      } else {
        await apiRequest('/api/technicians', {
          method: 'POST',
          body: JSON.stringify(processedData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians'] });
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof technicianSchema>) => {
    mutation.mutate(data);
  };
  
  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{technician ? "Edit" : "Create"} Technician</DialogTitle>
          <DialogDescription>
            {technician ? "Update technician details" : "Add a new technician to the system"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-1">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Performance
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technician Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ahmad Khan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specializations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specializations (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="Installation, Maintenance, Repairs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (years)</FormLabel>
                          <FormControl>
                            <Input placeholder="5" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications (comma-separated, optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="NABCEP, Solar PV, Battery Storage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available for assignments</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="profile" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Profile Picture</FormLabel>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {filePreview ? (
                              <img 
                                src={filePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : technician?.profileImage ? (
                              <img 
                                src={technician.profileImage.startsWith('/') ? technician.profileImage : `/profiles/${technician.profileImage}`} 
                                alt="Current" 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  // If image fails to load, show fallback
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {!filePreview && !technician?.profileImage && (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                            {!filePreview && technician?.profileImage && (
                              <User className="w-8 h-8 text-gray-400" style={{ display: 'none' }} />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="profile-image-upload"
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('profile-image-upload')?.click()}
                                className="flex items-center gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Browse Image
                              </Button>
                              <Button 
                                type="button"
                                variant="default"
                                onClick={handleUploadImage}
                                disabled={!selectedFile || uploadMutation.isPending}
                                className="flex items-center gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                {uploadMutation.isPending ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                              JPG, PNG up to 2MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4 mt-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="4.5" type="number" step="0.1" min="0" max="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="completionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Rate % (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="95" type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter className="flex-shrink-0 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : technician ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
    
    <SuccessModal 
      isOpen={showSuccessModal} 
      onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}
      title="Success!"
      message={`Technician ${technician ? "updated" : "created"} successfully`}
    />
    </>
  );
}

// Quotation Form Modal
const quotationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  propertyType: z.string().min(1, "Property type is required"),
  roofType: z.string().min(1, "Roof type is required"),
  energyConsumption: z.string().optional(),
  systemSize: z.string().min(1, "System size is required"),
  estimatedCost: z.string().optional(),
  installationTimeline: z.string().min(1, "Installation timeline is required"),
  notes: z.string().optional(),
  items: z.string().optional(),
  amount: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export function QuotationFormModal({ 
  isOpen, 
  onClose, 
  quotation = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  quotation?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customerName: "",
      propertyAddress: "",
      propertyType: "",
      roofType: "",
      energyConsumption: "",
      systemSize: "",
      estimatedCost: "",
      installationTimeline: "",
      notes: "",
      items: "",
      amount: "",
      status: "pending" as const,
    },
  });
  
  useEffect(() => {
    if (quotation) {
      form.reset({
        customerName: quotation.customerName || "",
        propertyAddress: quotation.propertyAddress || "",
        propertyType: quotation.propertyType || "",
        roofType: quotation.roofType || "",
        energyConsumption: quotation.energyConsumption?.toString() || "",
        systemSize: quotation.systemSize?.toString() || "",
        estimatedCost: quotation.estimatedCost?.toString() || "",
        installationTimeline: quotation.installationTimeline || "",
        notes: quotation.notes || "",
        items: quotation.items || "",
        amount: quotation.amount?.toString() || "",
        status: quotation.status || "pending",
      });
    } else {
      form.reset({
        customerName: "",
        propertyAddress: "",
        propertyType: "",
        roofType: "",
        energyConsumption: "",
        systemSize: "",
        estimatedCost: "",
        installationTimeline: "",
        notes: "",
        items: "",
        amount: "",
        status: "pending",
      });
    }
  }, [quotation, form]);
  
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof quotationSchema>) => {
      console.log("Quotation mutation data:", data);
      if (quotation) {
        const response = await apiRequest(`/api/quotations/${quotation.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        console.log("Update response:", response);
        return response;
      } else {
        const response = await apiRequest('/api/quotations', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        console.log("Create response:", response);
        return response;
      }
    },
    onSuccess: (data) => {
      console.log("Quotation mutation success:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      toast({
        title: quotation ? "Quotation Updated" : "Quotation Created", 
        description: `Quotation has been ${quotation ? "updated" : "created"} successfully!`,
        variant: "default",
      });
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Quotation mutation error:", error);
      toast({
        title: quotation ? "Update Failed" : "Creation Failed",
        description: error.message || "Failed to save quotation",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof quotationSchema>) => {
    mutation.mutate(data);
  };
  
  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quotation ? "Edit" : "New"} Quotation</DialogTitle>
          <DialogDescription>
            {quotation ? "Update quotation details" : "Add a new quotation to the system"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="propertyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Agricultural">Agricultural</SelectItem>
                      <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roofType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roof Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Flat Roof">Flat Roof</SelectItem>
                      <SelectItem value="Sloped Roof">Sloped Roof</SelectItem>
                      <SelectItem value="Tiled Roof">Tiled Roof</SelectItem>
                      <SelectItem value="Metal Roof">Metal Roof</SelectItem>
                      <SelectItem value="Concrete Roof">Concrete Roof</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="energyConsumption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Consumption (kWh) - Optional</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter monthly energy consumption" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Size (kW)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter system size in kilowatts" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost (PKR)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter estimated cost" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installationTimeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installation Timeline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2-3 weeks, 1 month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes or requirements" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <SuccessModal 
      isOpen={showSuccessModal} 
      onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}
      title="Success!"
      message={`Quotation ${quotation ? "updated" : "created"} successfully`}
    />
    </>
  );
}

// Ticket Form Modal
const ticketSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  assignedToId: z.string().optional(),
});

export function TicketFormModal({
  isOpen,
  onClose,
  ticket,
}: {
  isOpen: boolean;
  onClose: () => void;
  ticket?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      customerName: "",
      subject: "",
      description: "",
      priority: "medium" as const,
      status: "open" as const,
      assignedToId: "",
    },
  });
  
  useEffect(() => {
    if (ticket) {
      form.reset({
        customerName: ticket.customerName || ticket.customerId || "",
        subject: ticket.subject || "",
        description: ticket.description || "",
        priority: ticket.priority || "medium",
        status: ticket.status || "open",
        assignedToId: ticket.assignedToId || "",
      });
    } else {
      form.reset({
        customerName: "",
        subject: "",
        description: "",
        priority: "medium",
        status: "open",
        assignedToId: "",
      });
    }
  }, [ticket, form]);
  
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof ticketSchema>) => {
      const processedData = {
        ...data,
        customerId: ticket?.customerId || data.customerName.toLowerCase().replace(/\s+/g, '-'),
        customerName: data.customerName,
        assignedToId: data.assignedToId || null,
      };
      
      if (ticket) {
        await apiRequest(`/api/tickets/${ticket.id}`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
        });
      } else {
        await apiRequest('/api/tickets', {
          method: 'POST',
          body: JSON.stringify(processedData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof ticketSchema>) => {
    mutation.mutate(data);
  };
  
  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ticket ? 'Edit Ticket' : 'Create Ticket'}</DialogTitle>
          <DialogDescription>
            {ticket ? 'Update ticket details' : 'Add a new support ticket'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ticket subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter ticket description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter assignee ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    <SuccessModal 
      isOpen={showSuccessModal} 
      onClose={() => {
        setShowSuccessModal(false);
        onClose();
      }}
      title="Success!"
      message={`Ticket ${ticket ? "updated" : "created"} successfully`}
    />
    </>
  );
}

// Delete Confirmation Dialog
export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone."
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}