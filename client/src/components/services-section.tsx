import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function ServicesSection() {
  const { isAuthenticated } = useAuth();
  
  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const defaultServices = [
    {
      id: "1",
      name: "Solar Installation",
      description: "Professional installation of solar panel systems with warranty and ongoing support.",
      icon: "fas fa-tools",
      color: "primary",
      features: [
        "Site assessment & design",
        "Professional installation", 
        "25-year warranty"
      ]
    },
    {
      id: "2", 
      name: "Maintenance & Repair",
      description: "Regular maintenance and repair services to keep your solar system running at peak efficiency.",
      icon: "fas fa-wrench",
      color: "secondary",
      features: [
        "Scheduled maintenance",
        "Emergency repairs",
        "Performance monitoring"
      ]
    },
    {
      id: "3",
      name: "Consultation",
      description: "Expert consultation to design the perfect solar solution for your specific needs and budget.",
      icon: "fas fa-user-tie",
      color: "accent",
      features: [
        "Energy audit",
        "Custom system design",
        "ROI analysis"
      ]
    }
  ];

  const servicesToShow = services && services.length > 0 ? services.slice(0, 3) : defaultServices;

  const handleRequestService = (serviceId: string) => {
    if (isAuthenticated) {
      // Navigate to dashboard or service request form
      window.location.href = '/customer';
    } else {
      window.location.href = '/api/login';
    }
  };

  return (
    <section id="services" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Our Solar Services</h2>
          <p className="text-xl text-neutral max-w-3xl mx-auto">
            From consultation to maintenance, we provide comprehensive solar energy solutions tailored to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesToShow.map((service, index) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`bg-${service.color}/10 w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
                <i className={`${service.icon} text-${service.color} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-dark mb-4">{service.name}</h3>
              <p className="text-neutral mb-6">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {(service.features || defaultServices.find(ds => ds.id === service.id)?.features || []).map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-neutral">
                    <i className="fas fa-check text-secondary mr-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full bg-${service.color} hover:bg-${service.color}/90 text-white`}
                onClick={() => handleRequestService(service.id)}
              >
                Request Service
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
