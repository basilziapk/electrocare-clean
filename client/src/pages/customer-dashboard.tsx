import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import DashboardCard from "@/components/dashboard-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function CustomerDashboard() {
  const { user, isLoading } = useSimpleAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: installations } = useQuery({
    queryKey: ["/api/installations"],
    retry: false,
  });

  const { data: tickets } = useQuery({
    queryKey: ["/api/tickets"],
    retry: false,
  });

  const { data: complaints } = useQuery({
    queryKey: ["/api/complaints"],
    retry: false,
  });

  const { data: quotations } = useQuery({
    queryKey: [`/api/quotations/customer/${user?.id}`],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: editRequests } = useQuery({
    queryKey: ["/api/quotation-edit-requests"],
    retry: false,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setTicketDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/complaints", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Complaint submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setComplaintDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });

  const createEditRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/quotation-edit-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Edit request submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotation-edit-requests"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit edit request",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && user?.role !== 'customer') {
    // Redirect users with wrong role immediately to home
    window.location.href = "/";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalCapacity = installations?.reduce((sum: number, inst: any) => 
    sum + (parseFloat(inst.capacity) || 0), 0) || 0;

  const estimatedSavings = totalCapacity * 1000 * 30; // Rough calculation

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTicketMutation.mutate({
      subject: formData.get('subject'),
      description: formData.get('description'),
      category: formData.get('category'),
      priority: formData.get('priority'),
    });
  };

  const handleCreateComplaint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createComplaintMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      installationId: formData.get('installationId') || null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Dashboard</h1>
          <p className="text-xl">Welcome back, {user?.firstName || user?.email}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <i className="fas fa-plus mr-2"></i>New Support Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority">
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={createTicketMutation.isPending}>
                    {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="My Installations"
            value={installations?.length?.toString() || '0'}
            icon="fas fa-solar-panel"
            color="primary"
          />
          <DashboardCard
            title="Total Capacity"
            value={`${totalCapacity.toFixed(1)} kW`}
            icon="fas fa-bolt"
            color="secondary"
          />
          <DashboardCard
            title="Estimated Monthly Savings"
            value={`₹${estimatedSavings.toLocaleString()}`}
            icon="fas fa-piggy-bank"
            color="accent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Solar Systems */}
          <Card>
            <CardHeader>
              <CardTitle>My Solar Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installations?.map((installation: any, index: number) => (
                  <div key={installation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-dark">System #{index + 1}</h4>
                      <Badge variant={
                        installation.status === 'completed' ? "default" :
                        installation.status === 'in_progress' ? "secondary" : "outline"
                      }>
                        {installation.status?.replace('_', ' ') || 'pending'}
                      </Badge>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                      alt="Residential solar installation" 
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral">Capacity:</span>
                        <span className="text-dark font-medium ml-1">
                          {installation.capacity ? `${installation.capacity} kW` : 'TBD'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral">Installed:</span>
                        <span className="text-dark font-medium ml-1">
                          {installation.installationDate ? 
                            new Date(installation.installationDate).toLocaleDateString() : 
                            'Pending'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-neutral text-center py-8">No installations found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Support Tickets</CardTitle>
                <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      File Complaint
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>File a Complaint</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateComplaint} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="complaint-description">Description</Label>
                        <Textarea id="complaint-description" name="description" required />
                      </div>
                      <div>
                        <Label htmlFor="complaint-priority">Priority</Label>
                        <Select name="priority">
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {installations?.length > 0 && (
                        <div>
                          <Label htmlFor="installationId">Related Installation (Optional)</Label>
                          <Select name="installationId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select installation" />
                            </SelectTrigger>
                            <SelectContent>
                              {installations.map((inst: any, index: number) => (
                                <SelectItem key={inst.id} value={inst.id}>
                                  System #{index + 1} - {inst.capacity ? `${inst.capacity} kW` : 'TBD'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button type="submit" disabled={createComplaintMutation.isPending}>
                        {createComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets?.slice(0, 5).map((ticket: any) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-dark">{ticket.subject}</h4>
                      <Badge variant={
                        ticket.status === 'resolved' ? "default" :
                        ticket.status === 'in_progress' ? "secondary" : "destructive"
                      }>
                        {ticket.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-neutral">
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Priority: {ticket.priority}</span>
                    </div>
                  </div>
                )) || (
                  <p className="text-neutral text-center py-8">No support tickets found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quotations Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-dark">My Quotations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations && quotations.length > 0 ? (
                  quotations.map((quotation: any) => (
                    <div key={quotation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-dark">
                          {quotation.projectType || 'Solar Installation'}
                        </h4>
                        <Badge 
                          className={
                            quotation.status === 'approved' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                            quotation.status === 'pending' ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' :
                            quotation.status === 'rejected' ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' :
                            quotation.status === 'converted' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' :
                            'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                          }
                        >
                          {quotation.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-neutral">System Size:</span>
                          <span className="ml-2 text-dark font-medium">
                            {quotation.systemSize ? `${quotation.systemSize} kW` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral">Amount:</span>
                          <span className="ml-2 text-dark font-medium">
                            Rs. {quotation.amount || quotation.estimatedCost || '0'}
                          </span>
                        </div>
                      </div>

                      {quotation.details && (
                        <p className="text-sm text-neutral mb-3">{quotation.details}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral">
                          Created: {new Date(quotation.createdAt).toLocaleDateString()}
                        </span>
                        
                        {/* Check if there's already an edit request for this quotation */}
                        {editRequests?.find((req: any) => req.quotationId === quotation.id && req.status === 'pending') ? (
                          <Badge variant="outline" className="text-xs">
                            Edit Request Pending
                          </Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Request Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Request Quotation Edit</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                createEditRequestMutation.mutate({
                                  quotationId: quotation.id,
                                  requestDetails: formData.get('requestDetails'),
                                });
                              }}>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="requestDetails">What would you like to change?</Label>
                                    <Textarea
                                      id="requestDetails"
                                      name="requestDetails"
                                      placeholder="Please describe the changes you'd like to make to this quotation..."
                                      className="min-h-[100px]"
                                      required
                                    />
                                  </div>
                                  <Button type="submit" disabled={createEditRequestMutation.isPending}>
                                    {createEditRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral text-center py-8">No quotations found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
