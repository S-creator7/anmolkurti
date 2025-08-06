import React, { useState, useContext } from 'react';
import SabpaisaPaymentGateway from './SabpaisaPaymentGateway';
import { ShopContext } from '../context/ShopContext'

const SabpaisaPaymentForm = ({amount }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { formData: deliveryData } = useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);

  const hiddenFields = ['clientCode', 'transUserName', 'transUserPassword', 'authkey', 'authiv', 'callbackUrl', 'clientTxnId'];
  const sabPaisaDefaultValues = {
    clientCode: import.meta.env.VITE_CLIENT_CODE,
    transUserName: import.meta.env.VITE_TRANS_USER_NAME,
    transUserPassword: import.meta.env.VITE_TRANS_USER_PASSWORD,
    authkey: import.meta.env.VITE_AUTH_KEY,
    authiv: import.meta.env.VITE_AUTH_IV,
    callbackUrl: `${backendUrl}/order/sabpaisa-callback`,
    clientTxnId: `TXN-${Date.now()}`,
  };

  const [formData, setFormData] = useState({
    ...sabPaisaDefaultValues,
    payerName: `${deliveryData.firstName || ''} ${deliveryData.lastName || ''}`,
    payerEmail: deliveryData.email || '',
    payerMobile: deliveryData.phone || '',
    payerAddress: `${deliveryData.street || ''}, ${deliveryData.city || ''}, ${deliveryData.state || ''} ${deliveryData.zipcode || ''}`,
    amount: amount|| 0,
    data: '',
    udf1: '',
    udf2: '',
    udf3: '',
    udf4: '',
    udf5: '',
    udf6: '',
    udf7: '',
    udf8: '',
    udf9: '',
    udf10: '',
    udf11: '',
    udf12: '',
    udf13: '',
    udf14: '',
    udf15: '',
    udf16: '',
    udf17: '',
    udf18: '',
    udf19: '',
    udf20: '',
    channelId: '',
    programId: '',
    mcc: '',
    amountType: ''
  });

  const sabpaisaFields = [
    { label: 'Client Code', name: 'clientCode' },
    { label: 'Trnx User Name', name: 'transUserName' },
    { label: 'Trnx User Password', name: 'transUserPassword' },
    { label: 'Auth Key', name: 'authkey' },
    { label: 'Auth IV', name: 'authiv' },
    { label: 'Name', name: 'payerName' },
    { label: 'Email', name: 'payerEmail' },
    { label: 'Phone', name: 'payerMobile' },
    { label: 'Amount', name: 'amount' },
    { label: 'Client Trnx Id', name: 'clientTxnId' },
    { label: 'Address', name: 'payerAddress' },
    { label: 'Callback Url', name: 'callbackUrl' },
    { label: 'Data', name: 'data' },
    { label: 'Udf1', name: 'udf1' },
    { label: 'Udf2', name: 'udf2' },
    { label: 'Udf3', name: 'udf3' },
    { label: 'Channel ID', name: 'channelId' },
    { label: 'Program ID', name: 'programId' },
    { label: 'MCC', name: 'mcc' },
    { label: 'Account Type', name: 'amountType' },
  ]

  const visibleFields = sabpaisaFields.filter(field => !hiddenFields.includes(field.name));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(true);
    // document.getElementById('renderSabPaisa')?.click();
  };

  return (
    <div className="bg-gray-100 text-gray-900 py-6 px-4">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          SabPaisa Payment Gateway
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleFields.map((input, idx) => (
            <div key={idx} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {input.label}
              </label>
              <input
                type="text"
                name={input.name}
                placeholder={input.label}
                value={formData[input.name]}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            // type="submit"
             onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow"
          >
            Proceed for Payment
          </button>
        </div>

        <SabpaisaPaymentGateway
          {...formData}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default SabpaisaPaymentForm;
