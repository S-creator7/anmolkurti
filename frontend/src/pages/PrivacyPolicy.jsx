import React from 'react';
import Title from '../components/Title';

const PrivacyPolicy = () => {
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='max-w-4xl mx-auto space-y-8 text-gray-700'>
        <div className='bg-gray-50 p-6 rounded-lg'>
          <p className='text-lg text-center'>
            At Anmol Kurti's, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>
        </div>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>1. Information We Collect</h2>
          <div className='space-y-3'>
            <h3 className='font-medium'>Personal Information:</h3>
            <ul className='list-disc list-inside space-y-1 ml-4'>
              <li>Name, email address, phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through payment gateways)</li>
              <li>Account login credentials</li>
            </ul>
            
            <h3 className='font-medium mt-4'>Automatically Collected Information:</h3>
            <ul className='list-disc list-inside space-y-1 ml-4'>
              <li>IP address and browser information</li>
              <li>Device information and operating system</li>
              <li>Website usage patterns and preferences</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>2. How We Use Your Information</h2>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your purchases and account</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>3. Information Sharing</h2>
          <p className='mb-3'>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate our business (payment processors, shipping companies, etc.)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of our business</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>4. Data Security</h2>
          <p className='mb-3'>We implement appropriate security measures to protect your personal information:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>SSL encryption for data transmission</li>
            <li>Secure payment processing through trusted gateways</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and employee training</li>
            <li>Data backup and recovery procedures</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>5. Cookies and Tracking</h2>
          <p className='mb-3'>We use cookies and similar technologies to enhance your browsing experience:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li><strong>Essential Cookies:</strong> Required for website functionality</li>
            <li><strong>Performance Cookies:</strong> Help us analyze website usage</li>
            <li><strong>Marketing Cookies:</strong> Used for personalized advertising (with consent)</li>
          </ul>
          <p className='mt-3'>You can manage cookie preferences in your browser settings.</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>6. Your Rights</h2>
          <p className='mb-3'>You have the following rights regarding your personal information:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Request transfer of your data</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Objection:</strong> Object to certain data processing activities</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>7. Data Retention</h2>
          <p>We retain your personal information only as long as necessary to:</p>
          <ul className='list-disc list-inside space-y-2 ml-4 mt-3'>
            <li>Fulfill the purposes for which it was collected</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>8. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>9. Children's Privacy</h2>
          <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it promptly.</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>11. Contact Us</h2>
          <p className='mb-3'>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <p><strong>Email:</strong> anmolkurtis24@gmail.com</p>
            <p><strong>Phone:</strong> +91 7587035699</p>
            <p><strong>Address:</strong> Rajasthan, India</p>
          </div>
        </section>

        <div className='text-center mt-8 p-4 bg-orange-50 rounded-lg'>
          <p className='text-sm text-gray-600'>
            <strong>Effective Date:</strong> June 30, 2025<br/>
            Last Updated: June 30, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 