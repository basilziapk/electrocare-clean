import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface InstallationModalProps {
  open: boolean;
  onClose: () => void;
  installation?: any;
}

export default function InstallationModal({ open, onClose, installation }: InstallationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    address: '',
    installationAddress: '',
    systemSize: '',
    status: 'pending',
    progress: 0,
    assignedToId: '',
    scheduledDate: '',
    estimatedCost: '',
    notes: ''
  });

  // Fetch technicians for assignment
  const { data: technicians = [] } = useQuery({ 
    queryKey: ['/api/technicians'],
    enabled: open
  });

  // Fetch users for customer selection
  const { data: users = [] } = useQuery({ 
    queryKey: ['/api/users'],
    enabled: open
  });

  useEffect(() => {
    if (installation) {
      setFormData({
        customerId: installation.customerId || '',
        customerName: installation.customerName || '',
        address: installation.address || '',
        installationAddress: installation.address || '',
        systemSize: installation.capacity?.toString() || '',
        status: installation.status || 'pending',
        progress: installation.progress || 0,
        assignedToId: installation.technicianId || '',
        scheduledDate: installation.installationDate ? new Date(installation.installationDate).toISOString().split('T')[0] : '',
        estimatedCost: installation.totalCost?.toString() || '',
        notes: installation.notes || ''
      });
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        address: '',
        installationAddress: '',
        systemSize: '',
        status: 'pending',
        progress: 0,
        assignedToId: '',
        scheduledDate: '',
        estimatedCost: '',
        notes: ''
      });
    }
  }, [installation, open]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/installations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      toast({
        title: "Installation Created",
        description: "Solar installation has been successfully created and added to the system.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Unable to create installation. Please check your input and try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/installations/${installation.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
      toast({
        title: "Installation Updated",
        description: "Solar installation details have been successfully updated in the system.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Unable to update installation. Please check your input and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields - customer selection only required for new installations
    if (!installation && !formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer for this installation.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.assignedToId) {
      toast({
        title: "Validation Error",
        description: "Please select a technician to assign to this installation.",
        variant: "destructive",
      });
      return;
    }
    
    const submitData = {
      customerId: formData.customerId,
      address: formData.installationAddress,
      capacity: parseFloat(formData.systemSize) || null,
      status: formData.status,
      technicianId: formData.assignedToId || null,
      totalCost: parseFloat(formData.estimatedCost) || null,
      installationDate: formData.scheduledDate ? formData.scheduledDate : null,
      notes: formData.notes
    };

    console.log('Submitting data:', submitData);

    if (installation) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <i className="fas fa-solar-panel text-blue-600"></i>
            {installation ? 'Edit Installation' : 'New Installation'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer Name</Label>
              {installation ? (
                // When editing, show customer name as disabled field
                <Input
                  value={formData.customerName || 'Loading...'}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              ) : (
                // When creating, allow customer selection
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => {
                    const selectedUser = (users as any[])
                      .filter(user => user.role === 'customer')
                      .find(u => u.id === value);
                    setFormData(prev => ({
                      ...prev,
                      customerId: value,
                      customerName: selectedUser ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email : ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(users as any[])
                      .filter(user => user.role === 'customer')
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Installation Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="installationAddress">Installation Address</Label>
              <Textarea
                id="installationAddress"
                value={formData.installationAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, installationAddress: e.target.value }))}
                placeholder="Enter complete installation address"
                required
                rows={2}
                disabled={!!installation}
                className={installation ? "bg-gray-50 text-gray-600" : ""}
              />
            </div>

            {/* System Size */}
            <div className="space-y-2">
              <Label htmlFor="systemSize">System Size (kW)</Label>
              <Input
                id="systemSize"
                type="number"
                step="0.1"
                value={formData.systemSize}
                onChange={(e) => setFormData(prev => ({ ...prev, systemSize: e.target.value }))}
                placeholder="e.g., 5.5"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                placeholder="0-100"
              />
            </div>

            {/* Assigned Technician */}
            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assigned Technician</Label>
              <Select
                value={formData.assignedToId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedToId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician *" />
                </SelectTrigger>
                <SelectContent>
                  {(technicians as any[])
                    .sort((a: any, b: any) => {
                      const nameA = a.firstName && a.lastName 
                        ? `${a.firstName} ${a.lastName}` 
                        : a.name || a.email || a.id;
                      const nameB = b.firstName && b.lastName 
                        ? `${b.firstName} ${b.lastName}` 
                        : b.name || b.email || b.id;
                      return nameA.localeCompare(nameB);
                    })
                    .map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.firstName && tech.lastName 
                        ? `${tech.firstName} ${tech.lastName}` 
                        : tech.name || tech.email || tech.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (PKR)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                placeholder="e.g., 25000"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this installation..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className={`fas ${installation ? 'fa-save' : 'fa-plus'} mr-2`}></i>
              )}
              {installation ? 'Update Installation' : 'Create Installation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}