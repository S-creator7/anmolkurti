import React, { useState } from "react"; // Ensure you have the QR code image in the assets folder
const PaytmPayment = () => {
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const handlePaymentClick = () => {
    setShowPaymentSection(true);
  };

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("UTR Number:", utrNumber);
    console.log("Screenshot:", screenshot);
    // You can also send this data to backend here
    alert("Payment details submitted!");
  };

  return (
    <div className="p-4">
      {!showPaymentSection ? (
        <button
          onClick={handlePaymentClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Pay with Paytm
        </button>
      ) : (
        <div className="border p-4 mt-4 rounded shadow bg-white">
          <h2 className="text-lg font-semibold mb-2">Scan to Pay</h2>
          <img
             src="/qrcode.jpg"
  alt="Paytm QR Code"
  className="w-64 h-auto mb-4 border"
          />

          <label className="block mb-2">
            Enter UTR Number:
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="block w-full mt-1 p-2 border rounded"
              placeholder="Ex: 1234567890"
            />
          </label>

          <label className="block mb-4">
            Or Upload Screenshot:
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block mt-1"
            />
          </label>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Payment Info
          </button>
        </div>
      )}
    </div>
  );
};

export default PaytmPayment;
