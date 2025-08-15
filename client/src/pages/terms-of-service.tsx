import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 1, 2025
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using the ElectroCare Solar Solutions website and services (the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Description of Services</h2>
              <p className="text-gray-700 mb-4">
                ElectroCare provides solar energy solutions including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Solar panel installation and consultation</li>
                <li>Energy system design and planning</li>
                <li>Maintenance and support services</li>
                <li>Solar calculator and assessment tools</li>
                <li>Customer support and ticketing system</li>
                <li>Installation tracking and management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of our Services, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Use of Services</h2>
              <p className="text-gray-700 mb-4">
                You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the Services in any way that violates applicable laws or regulations</li>
                <li>Engage in any conduct that restricts or inhibits others' use of the Services</li>
                <li>Attempt to gain unauthorized access to any portion of the Services</li>
                <li>Upload or transmit viruses or any other malicious code</li>
                <li>Use any automated system or software to extract data from the Services</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Solar Installation Services</h2>
              <p className="text-gray-700 mb-4">
                For solar installation services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All quotes are estimates and subject to site assessment</li>
                <li>Final pricing may vary based on actual site conditions</li>
                <li>Installation timelines are approximate and weather-dependent</li>
                <li>Property owner must provide necessary permissions and access</li>
                <li>Warranties are subject to manufacturer terms and conditions</li>
                <li>Regular maintenance is required to maintain warranty validity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                For paid services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Payment is due according to the agreed schedule</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Prices are subject to change with notice</li>
                <li>Late payments may incur additional charges</li>
                <li>We reserve the right to suspend services for non-payment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on our Services, including text, graphics, logos, images, audio clips, digital downloads, and software, is the property of ElectroCare or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. User Content</h2>
              <p className="text-gray-700 mb-4">
                By submitting content to our Services (including photos, reviews, or feedback), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute such content for our business purposes. You represent that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You own or have the right to submit the content</li>
                <li>Your content does not infringe any third-party rights</li>
                <li>Your content is accurate and not misleading</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of content</li>
                <li>Uninterrupted or error-free service</li>
                <li>Results obtained from use of the Services</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Solar calculations and estimates are for informational purposes only and actual results may vary based on numerous factors including weather, shading, and equipment performance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Limitation of Liability</h2>
              <p className="text-gray-700">
                TO THE FULLEST EXTENT PERMITTED BY LAW, ELECTROCARE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICES.
              </p>
              <p className="text-gray-700 mt-4">
                Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim in the twelve months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless ElectroCare, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from your use of the Services or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">12. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Services will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">13. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of Islamabad, Pakistan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">14. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the effective date. Your continued use of the Services after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">15. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">16. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms constitute the entire agreement between you and ElectroCare regarding the use of the Services, superseding any prior agreements between you and ElectroCare relating to the Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">17. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at:
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