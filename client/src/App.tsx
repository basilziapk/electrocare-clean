import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { SimpleAuthProvider } from "@/hooks/useSimpleAuth";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

import AdminDashboard from "@/pages/admin-dashboard";
import TechnicianDashboard from "@/pages/technician-dashboard";
import CustomerDashboard from "@/pages/customer-dashboard";
import Calculator from "@/pages/calculator";
import Profile from "@/pages/profile";
import SolarSolutions from "@/pages/solar-solutions";
import Services from "@/pages/services";
import { SolarInstallationWizard } from "@/pages/solar-installation-wizard";
import Products from "@/pages/products";
import Projects from "@/pages/projects";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Contact from "@/pages/contact";

function Router() {
  return (
    <Switch>
      {/* Original Home page preserved exactly */}
      <Route path="/" component={Home} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/products" component={Products} />
      <Route path="/projects" component={Projects} />
      <Route path="/solar-solutions" component={SolarSolutions} />
      <Route path="/services" component={Services} />
      <Route path="/new-installation" component={SolarInstallationWizard} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Dashboard routes for authenticated users */}
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/technician-dashboard" component={TechnicianDashboard} />
      <Route path="/customer-dashboard" component={CustomerDashboard} />
      <Route path="/profile" component={Profile} />
      

      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
