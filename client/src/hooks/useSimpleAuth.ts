import React, { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type SimpleUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "technician" | "customer";
  status: "active" | "inactive" | "suspended";
};

type SimpleAuthContextType = {
  user: SimpleUser | null;
  isLoading: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

export function SimpleAuthProvider(props: { children: ReactNode }) {
  const authValue = useSimpleAuthInternal();
  const contextElement = React.createElement(SimpleAuthContext.Provider, {
    value: authValue
  }, props.children);
  return contextElement;
}

function useSimpleAuthInternal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["/api/local-db-auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/local-db-auth/user", {
        credentials: "include",
      });
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/local-db-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }

      return response.json();
    },
    onSuccess: (user: SimpleUser) => {
      queryClient.setQueryData(["/api/local-db-auth/user"], user);
      toast({
        title: "Login Successful",
        description: "Welcome back, " + user.firstName + "!",
      });
      
      // Redirect to appropriate dashboard based on role
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (user.role === "technician") {
          window.location.href = "/technician-dashboard";
        } else if (user.role === "customer") {
          window.location.href = "/customer-dashboard";
        }
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/local-db-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Registration failed");
      }

      return response.json();
    },
    onSuccess: (user: SimpleUser) => {
      queryClient.setQueryData(["/api/local-db-auth/user"], user);
      toast({
        title: "Registration Successful",
        description: "Welcome to ElectroCare, " + user.firstName + "!",
      });
      
      // Redirect to appropriate dashboard based on role
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (user.role === "technician") {
          window.location.href = "/technician-dashboard";
        } else if (user.role === "customer") {
          window.location.href = "/customer-dashboard";
        }
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/local-db-auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/local-db-auth/user"], null);
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Logged Out", 
        description: "You have been successfully logged out",
      });
      // Immediately redirect to home page 
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user: userQuery.data ?? null,
    isLoading: userQuery.isLoading,
    loginMutation,
    logoutMutation,
    registerMutation,
  };
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context) {
    return context;
  }
  return useSimpleAuthInternal();
}