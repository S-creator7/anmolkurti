import React from 'react';
import Title from '../components/Title';
import ScrollToTop from '../components/scrollToTop';

const TermsConditions = () => {
  return (
    <div className='border-t pt-14'>
      <ScrollToTop />
      
      {/* Header */}
      <div className='text-center mb-16'>
        <Title text1={'TERMS &'} text2={'CONDITIONS'} />
        <p className='text-gray-600 mt-4 max-w-2xl mx-auto'>
          Please read these terms and conditions carefully before using our services.
        </p>
        <p className='text-sm text-gray-500 mt-2'>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Terms Content */}
      <div className='max-w-4xl mx-auto px-4 space-y-12'>
        
        {/* 1. Acceptance of Terms */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>1</span>
            Acceptance of Terms
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              By accessing and using the Anmol Kurti website (anmolkurti.com), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className='text-gray-600 leading-relaxed'>
              These terms apply to all visitors, users, and others who access or use our service.
            </p>
          </div>
        </section>

        {/* 2. Description of Service */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>2</span>
            Description of Service
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              Anmol Kurti is an online e-commerce platform that provides customers with access to purchase traditional Indian clothing, 
              including kurtis, kurti sets, and related accessories.
            </p>
            <ul className='list-disc list-inside text-gray-600 space-y-2'>
              <li>Online product catalog and ordering system</li>
              <li>Secure payment processing</li>
              <li>Order tracking and customer support</li>
              <li>User account management</li>
            </ul>
          </div>
        </section>

        {/* 3. User Accounts */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>3</span>
            User Accounts
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              To access certain features of our service, you may be required to create an account. You are responsible for:
            </p>
            <ul className='list-disc list-inside text-gray-600 space-y-2 mb-4'>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Updating your information to keep it current</li>
            </ul>
            <p className='text-gray-600 leading-relaxed'>
              You must notify us immediately of any unauthorized use of your account.
            </p>
          </div>
        </section>

        {/* 4. Orders and Payments */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>4</span>
            Orders and Payments
          </h2>
          <div className='prose prose-gray max-w-none'>
            <h3 className='text-lg font-medium text-gray-800 mb-3'>Order Acceptance</h3>
            <p className='text-gray-600 leading-relaxed mb-4'>
              All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.
            </p>
            
            <h3 className='text-lg font-medium text-gray-800 mb-3'>Pricing</h3>
            <p className='text-gray-600 leading-relaxed mb-4'>
              All prices are listed in Indian Rupees (₹) and are subject to change without notice. Prices include applicable taxes unless otherwise stated.
            </p>
            
            <h3 className='text-lg font-medium text-gray-800 mb-3'>Payment Methods</h3>
            <ul className='list-disc list-inside text-gray-600 space-y-2'>
              <li>Credit/Debit Cards</li>
              <li>Net Banking</li>
              <li>UPI Payments</li>
              <li>Cash on Delivery (where available)</li>
            </ul>
          </div>
        </section>

        {/* 5. Shipping and Delivery */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>5</span>
            Shipping and Delivery
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              We strive to process and ship orders within 2-3 business days. Delivery times may vary based on location and shipping method selected.
            </p>
            <ul className='list-disc list-inside text-gray-600 space-y-2'>
              <li>Standard delivery: 5-7 business days</li>
              <li>Express delivery: 2-3 business days (additional charges apply)</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Shipping charges are calculated based on weight and location</li>
            </ul>
          </div>
        </section>

        {/* 6. Returns and Refunds */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>6</span>
            Returns and Refunds
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              We offer a 7-day return policy for most items. Items must be returned in original condition with tags attached.
            </p>
            <h3 className='text-lg font-medium text-gray-800 mb-3'>Return Conditions</h3>
            <ul className='list-disc list-inside text-gray-600 space-y-2 mb-4'>
              <li>Items must be unworn and in original packaging</li>
              <li>Return request must be initiated within 7 days of delivery</li>
              <li>Customer is responsible for return shipping costs</li>
              <li>Refunds will be processed within 7-10 business days</li>
            </ul>
            <p className='text-gray-600 leading-relaxed'>
              Certain items may not be eligible for return due to hygiene reasons or customization.
            </p>
          </div>
        </section>

        {/* 7. Intellectual Property */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>7</span>
            Intellectual Property
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              All content on this website, including but not limited to text, graphics, logos, images, and software, 
              is the property of Anmol Kurti and is protected by copyright and trademark laws.
            </p>
            <p className='text-gray-600 leading-relaxed'>
              You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </div>
        </section>

        {/* 8. Privacy Policy */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>8</span>
            Privacy Policy
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information 
              when you use our service.
            </p>
            <p className='text-gray-600 leading-relaxed'>
              By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.
            </p>
          </div>
        </section>

        {/* 9. Limitation of Liability */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>9</span>
            Limitation of Liability
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              Anmol Kurti shall not be liable for any direct, indirect, incidental, special, or consequential damages 
              resulting from the use or inability to use our service.
            </p>
            <p className='text-gray-600 leading-relaxed'>
              Our total liability to you for any damages shall not exceed the amount paid by you for the specific product or service.
            </p>
          </div>
        </section>

        {/* 10. Governing Law */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>10</span>
            Governing Law
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              These terms and conditions are governed by and construed in accordance with the laws of India, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in Rajnandgaon, Chhattisgarh.
            </p>
          </div>
        </section>

        {/* 11. Changes to Terms */}
        <section className='bg-white rounded-2xl p-8 shadow-soft border border-gray-50'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3'>
            <span className='w-8 h-8 bg-hotpink-100 text-hotpink-600 rounded-full flex items-center justify-center text-sm font-bold'>11</span>
            Changes to Terms
          </h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page.
            </p>
            <p className='text-gray-600 leading-relaxed'>
              Your continued use of the service after any changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className='bg-gradient-to-r from-hotpink-50 to-hotpink-100 rounded-2xl p-8 border border-hotpink-200'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Contact Information</h2>
          <div className='prose prose-gray max-w-none'>
            <p className='text-gray-600 leading-relaxed mb-4'>
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className='bg-white rounded-xl p-6 space-y-3'>
              <p className='text-gray-600'>
                <strong>Email:</strong> <a href="mailto:anmolkurtis24@gmail.com" className='text-hotpink-600 hover:text-hotpink-700'>anmolkurtis24@gmail.com</a>
              </p>
              <p className='text-gray-600'>
                <strong>Phone:</strong> <a href="tel:+917587035699" className='text-hotpink-600 hover:text-hotpink-700'>+91 7587035699</a>
              </p>
              <p className='text-gray-600'>
                <strong>Address:</strong> Basantpur Road, Kaurin Bhatha, Rajnandgaon, CG
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Bottom Spacing */}
      <div className='h-16'></div>
    </div>
  );
};

export default TermsConditions; 