import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 1, 2025
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Create an account or fill out forms on our website</li>
                <li>Request a solar installation quote or consultation</li>
                <li>Contact us for customer support</li>
                <li>Use our solar calculator or other tools</li>
                <li>Subscribe to our newsletters or updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Types of Information</h2>
              <p className="text-gray-700 mb-4">
                The types of information we may collect include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Physical address and property details</li>
                <li>Energy consumption patterns and requirements</li>
                <li>Roof dimensions and photographs for solar assessments</li>
                <li>Payment and billing information</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and complete solar installation requests</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Provide customer service and support</li>
                <li>Generate accurate solar system quotes and recommendations</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With your consent or at your direction</li>
                <li>With our trusted service providers who assist in our operations</li>
                <li>With our installation partners and technicians for service delivery</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In connection with a merger, sale, or acquisition of our business</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information by authorized personnel</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your information</li>
                <li>Object to certain processing of your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintain your session and preferences</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Improve user experience and site functionality</li>
                <li>Remember your settings and authentication status</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookies through your browser settings, though disabling cookies may limit some features of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>ElectroCare Solar Solutions</strong><br />
                  Email: info@greentechpk.com<br />
                  Phone: +92 300 1234567<br />
                  Address: Office 123, Solar Plaza, Islamabad, Pakistan
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}