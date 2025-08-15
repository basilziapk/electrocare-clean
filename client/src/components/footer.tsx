import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-solar-panel text-primary text-2xl mr-2"></i>
              <span className="text-xl font-bold text-white">ElectroCare</span>
            </div>
            <p className="text-gray-300 mb-4">
              Leading provider of solar energy solutions with professional installation and 24/7 support.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Solar Installation
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Maintenance & Repair
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Consultation
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Energy Audit
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/customer" className="text-gray-300 hover:text-primary transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <a href="/api/login" className="text-gray-300 hover:text-primary transition-colors">
                  Technician Login
                </a>
              </li>
              <li>
                <Link href="/calculator" className="text-gray-300 hover:text-primary transition-colors">
                  Solar Calculator
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <i className="fas fa-phone mr-2"></i> 1800-123-SOLAR
              </p>
              <p>
                <i className="fas fa-envelope mr-2"></i> info@greentechpk.com
              </p>
              <p>
                <i className="fas fa-map-marker-alt mr-2"></i> Mardan, Pakistan
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
          <p>
            &copy; 2024 ElectroCare. All rights reserved. | {' '}
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
