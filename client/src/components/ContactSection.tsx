export default function ContactSection() {
  return (
    <div className="relative h-[500px] lg:h-[600px]">
      {/* Full Width Map */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3297.3888679744447!2d72.02608931515!3d34.18938898057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDExJzIxLjgiTiA3MsKwMDEnMzMuOSJF!5e0!3m2!1sen!2s!4v1642528731614!5m2!1sen!2s&gestureHandling=greedy"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      ></iframe>
      
      {/* Contact Information Overlay */}
      <div className="absolute top-2 left-2 bg-white rounded-lg shadow-2xl p-8 max-w-sm z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
        
        <div className="space-y-4 text-gray-700 text-sm">
          <div>
            <span className="font-semibold">Phone: </span>
            <span>+92 1233218777</span>
          </div>
          
          <div>
            <span className="font-semibold">WhatsApp: </span>
            <a 
              href="https://wa.me/921233218777" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline"
            >
              +92 1233218777
            </a>
          </div>
          
          <div>
            <span className="font-semibold">Email: </span>
            <span>info@solarenergypros.com</span>
          </div>
          
          <div>
            <span className="font-semibold">Location: </span>
            <span>Opposite Haji Gul Plaza, Mardan, KPK, Pakistan</span>
          </div>
          
          <div>
            <span className="font-semibold">Hours: </span>
            <span>Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}