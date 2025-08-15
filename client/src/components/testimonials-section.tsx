export default function TestimonialsSection() {
  const testimonials = [
    {
      id: "1",
      content: "SolarTech Pro transformed our home with a seamless installation. Our electricity bills have dropped by 80% and the system works flawlessly.",
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
    },
    {
      id: "2", 
      content: "The technicians were professional and completed the installation in just two days. The solar calculator helped us choose the perfect system size.",
      name: "Rajesh Kumar",
      location: "Delhi, India",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
    },
    {
      id: "3",
      content: "Excellent customer service and maintenance support. Our business has saved over ₹2 lakhs this year with their commercial solar solution.",
      name: "Anita Gupta",
      location: "Bangalore, Karnataka", 
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">What Our Customers Say</h2>
          <p className="text-xl text-neutral">Real experiences from families and businesses using our solar solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-accent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="fas fa-star"></i>
                  ))}
                </div>
              </div>
              <p className="text-neutral mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={`${testimonial.name} testimonial`} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium text-dark">{testimonial.name}</div>
                  <div className="text-sm text-neutral">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
