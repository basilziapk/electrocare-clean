import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";

export default function Profile() {
  const { user, isLoading } = useSimpleAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(true); // Always in edit mode except for email

  // Fetch full user details
  const { data: userDetails } = useQuery({
    queryKey: ["/api/users/profile"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/profile/upload-url", {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      try {
        const response = await apiRequest("/api/profile/picture", {
          method: "PUT",
          body: JSON.stringify({ profileImageUrl: uploadURL }),
        });
        
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });
        } else {
          throw new Error("Failed to update profile picture");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile picture",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    };
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/";
    return null;
  }

  const displayUser = userDetails || user || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <NewNavigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={displayUser?.profileImageUrl || ""} alt={displayUser?.firstName || ""} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {displayUser?.firstName?.charAt(0)?.toUpperCase() || displayUser?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880} // 5MB
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={handleUploadComplete}
                        buttonClassName="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 p-0"
                      >
                        <i className="fas fa-camera text-xs"></i>
                      </ObjectUploader>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {displayUser?.firstName && displayUser?.lastName 
                      ? `${displayUser.firstName} ${displayUser.lastName}` 
                      : displayUser?.email}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{displayUser?.email}</p>
                  <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                    {displayUser?.role || "customer"}
                  </div>
                  <div className="mt-4 w-full pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-2">
                        <span>Member Since:</span>
                        <span className="font-medium">
                          {displayUser?.createdAt 
                            ? new Date(displayUser.createdAt).toLocaleDateString() 
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>User ID:</span>
                        <span className="font-medium text-xs">{displayUser?.id?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            defaultValue={displayUser?.firstName || ""}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            defaultValue={displayUser?.lastName || ""}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={displayUser?.email || ""}
                          disabled={true}
                          className="bg-gray-100"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={displayUser?.phone || ""}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          defaultValue={displayUser?.address || ""}
                          placeholder="Enter your address"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Authentication Provider</h3>
                      <p className="text-sm text-gray-600">
                        Your account is secured with Replit authentication
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Last Login</h3>
                      <p className="text-sm text-gray-600">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive"
                        onClick={() => window.location.href = '/api/logout'}
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your account preferences and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates about your solar installations</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">SMS Alerts</h3>
                          <p className="text-sm text-gray-600">Get instant alerts for important updates</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Language</h3>
                          <p className="text-sm text-gray-600">English (US)</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}