import React from "react";
import uniqid from "uniqid";

const SabpaisaPaymentGateway = ({
  formData,
  amount,
}) => {
  const handleRedirect = () => {
    const baseUrl = "https://secure.sabpaisa.in/SabPaisa/sabpaisaInit"; 
    const params = new URLSearchParams({
      clientCode: import.meta.env.VITE_SABPAISA_CLIENT_CODE,
      transUserName: import.meta.env.VITE_SABPAISA_TRANS_USER,
      transUserPassword: import.meta.env.VITE_SABPAISA_TRANS_PASS,
      authkey: import.meta.env.VITE_SABPAISA_AUTH_KEY,
      authiv: import.meta.env.VITE_SABPAISA_AUTH_IV,
      payerName: `${formData.firstName} ${formData.lastName}`,
      payerEmail: formData.email,
      payerMobile: formData.phone,
      payerAddress: `${formData.street}, ${formData.city}, ${formData.state}`,
      clientTxnId: uniqid(),
      amount: amount,
      callbackUrl: `${window.location.origin}/sabpaisa-response`
    });

    window.location.href = `${baseUrl}?${params.toString()}`;
  };

  return <button onClick={handleRedirect} className="btn btn-success">Proceed to Pay</button>;
};

export default SabpaisaPaymentGateway;
