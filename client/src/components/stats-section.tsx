export default function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center animate-fade-in-up">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-home text-primary text-2xl"></i>
            </div>
            <div className="text-3xl font-bold text-dark">2,500+</div>
            <div className="text-neutral">Installations Completed</div>
          </div>
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-secondary text-2xl"></i>
            </div>
            <div className="text-3xl font-bold text-dark">150+</div>
            <div className="text-neutral">Expert Technicians</div>
          </div>
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-leaf text-accent text-2xl"></i>
            </div>
            <div className="text-3xl font-bold text-dark">50,000T</div>
            <div className="text-neutral">CO₂ Emissions Saved</div>
          </div>
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-star text-primary text-2xl"></i>
            </div>
            <div className="text-3xl font-bold text-dark">4.9/5</div>
            <div className="text-neutral">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
