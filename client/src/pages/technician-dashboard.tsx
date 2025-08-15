import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import NewNavigation from "@/components/new-navigation";
import { ProtectedFeature } from "@/components/protected-feature";
import Footer from "@/components/footer";
import DashboardCard from "@/components/dashboard-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TechnicianDashboard() {
  const { user, isLoading } = useSimpleAuth();
  const { toast } = useToast();

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

  const { data: technician } = useQuery({
    queryKey: ["/api/technicians/me"],
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && user?.role !== 'technician') {
    // Redirect users with wrong role immediately to home
    window.location.href = "/";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayInstallations = installations?.filter((inst: any) => {
    const today = new Date().toDateString();
    const instDate = new Date(inst.installationDate || inst.createdAt).toDateString();
    return instDate === today && inst.status === 'in_progress';
  }).length || 0;

  const pendingTasks = installations?.filter((inst: any) => 
    inst.status === 'pending' || inst.status === 'in_progress'
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      <ProtectedFeature
        feature="Technician Dashboard"
        title="Technician Access Required"
        description="You need technician privileges to access this dashboard"
        requireRole="technician"
      >
      
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Technician Dashboard</h1>
          <p className="text-xl">Welcome back, {user?.firstName || user?.email}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Badge variant={technician?.isAvailable ? "default" : "secondary"} className="px-3 py-1">
              {technician?.isAvailable ? "Available" : "Busy"}
            </Badge>
            <Button>Update Status</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Today's Jobs"
            value={todayInstallations.toString()}
            icon="fas fa-calendar-day"
            color="primary"
          />
          <DashboardCard
            title="Pending Tasks"
            value={pendingTasks.toString()}
            icon="fas fa-tasks"
            color="accent"
          />
          <DashboardCard
            title="Completion Rate"
            value={technician?.completionRate ? `${technician.completionRate}%` : "N/A"}
            icon="fas fa-check-circle"
            color="secondary"
          />
        </div>

        {/* Assigned Jobs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assigned Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installations?.filter((inst: any) => inst.status !== 'completed').map((installation: any) => (
                <div key={installation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" 
                      alt="Solar installation" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-dark">Solar Panel Installation</p>
                      <p className="text-sm text-neutral">{installation.location || installation.address || 'Location not specified'}</p>
                      <p className="text-sm text-neutral">Capacity: {installation.capacity ? `${installation.capacity} kW` : 'TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      installation.status === 'in_progress' ? "default" :
                      installation.status === 'pending' ? "secondary" : "outline"
                    }>
                      {installation.status?.replace('_', ' ') || 'pending'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <i className="fas fa-edit mr-1"></i>
                      Update
                    </Button>
                  </div>
                </div>
              )) || (
                <p className="text-neutral text-center py-8">No assigned jobs found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints?.slice(0, 5).map((complaint: any) => (
                <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-dark">{complaint.title}</p>
                    <p className="text-sm text-neutral">{complaint.description}</p>
                    <p className="text-xs text-neutral">
                      Created: {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      complaint.status === 'resolved' ? "default" :
                      complaint.status === 'investigating' ? "secondary" : "destructive"
                    }>
                      {complaint.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </Button>
                  </div>
                </div>
              )) || (
                <p className="text-neutral text-center py-8">No complaints assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
      </ProtectedFeature>
    </div>
  );
}
