import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import CouponCode from "./CouponCode";
import sabpaisaLogo from '../assets/sabpaisa_logo.png'
import paytmLogo from '../assets/paytm_logo.png'
import razorPayLogo from '../assets/razorpay_logo.png'
import SabpaisaPaymentModal from "./SabpaisaPaymentModal";
import axios from "axios";

const CartTotal = ({ checkoutMode, hasCriticalStockIssues }) => {
  let backendUrl = import.meta.env.VITE_BACKEND_URL;

  const {
    currency,
    delivery_fee,
    getCartAmount,
    cartItems,
    directBuyItem,
    formData,
  } = useContext(ShopContext);
  // const [localAppliedCoupon, setLocalAppliedCoupon] = useState(null);
  // Use props if provided (for PlaceOrder), otherwise use local state (for Cart)
  // const appliedCoupon = propAppliedCoupon !== undefined ? propAppliedCoupon : localAppliedCoupon;
  // const onCouponApplied = propOnCouponApplied || setLocalAppliedCoupon;
  // const onRemoveCoupon = propOnRemoveCoupon || (() => setLocalAppliedCoupon(null));
  const [onCouponApplied, setOnCouponApplied] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState();
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee =
    appliedCoupon && appliedCoupon.discountType === "free_shipping"
      ? 0
      : delivery_fee;

  let subtotal = 0;
  if (directBuyItem) {
    subtotal = directBuyItem.price;
  } else {
    subtotal = getCartAmount();
  }
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  //manual payment via QR code
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [manualPaymentMode, setManualPaymentMode] = useState(false);
  const handleManualPaytmSubmit = async () => {
    if (!utrNumber) {
      alert("Please provide UTR or screenshot");
      return;
    }
    console.log("Direct Buy Item", formData);



    const formDataToSend = { ...formData, utrNumber, orderAmount: total };
    if (paymentScreenshot) {
      formDataToSend.append("screenshot", paymentScreenshot);
    }
    console.log("Submitting payment details:", formDataToSend)

    try {
      const response = await axios.post(
        `${backendUrl}/order/place-order`,
        formDataToSend,
      );
      console.log("Payment details submitted:", response.data);
      alert("Payment details submitted successfully!");
      setManualPaymentMode(false);
      setUtrNumber("");
      setPaymentScreenshot(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit payment details. Try again.");
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("razorPay");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSabpaisaModal, setShowSabpaisaModal] = useState(false);
  // Reset isRedirecting on component mount to allow multiple submissions
  useEffect(() => {
    setIsRedirecting(false);
  }, []);

  const handleCouponApplied = (coupon) => {
    setOnCouponApplied(coupon);
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
  };

  const handleCheckoutClick = () => {
    setShowSabpaisaModal(true);
  };

  const initiatePaytmPayment = async () => {
    const orderId = "ORDER_" + new Date().getTime();
    const customerId = "CUSTOMER_" + new Date().getTime();
    try {
      const res = await axios.post(`${backendUrl}/order/paytm/initiate`, {
        orderId,
        amount: total.toFixed(2),
        customerId,
        mobileNo: formData.phone,
        emailId: formData.email,
      });
      console.log("Response", res);

      const { paymentData, paytm_url } = res.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paytm_url;

      for (const key in paymentData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Paytm Error:", error);
      alert("Payment failed. Try again.");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/order/razorpay/create-order`, {
        amount: total,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Your Store Name",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          const res = await axios.post(`${backendUrl}/order/razorpay/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData: {
              items: directBuyItem ? [directBuyItem] : cartItems,
              address: formData.address,
              couponCode: appliedCoupon?.code,
              isGuest: checkoutMode === "guest",
              guestInfo: checkoutMode === "guest" ? formData : null
            }
          });

          if (res.data.success) {
            clearCart();
            navigate(`/order-success/${res.data.orderId}`);
          } else {
            alert(res.data.message);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment initiation failed.");
    }
  };


  return (
    <div className='w-full bg-white border rounded-lg p-4 mb-4"'>
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      {/* Coupon Code Section */}
      <CouponCode
        onCouponApplied={handleCouponApplied}
        appliedCoupon={appliedCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      <div className="flex flex-col gap-2 mt-4 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency}
            {subtotal}.00
          </p>
        </div>

        {appliedCoupon && (
          <>
            <div className="flex justify-between text-green-600">
              <p>Discount ({appliedCoupon.code})</p>
              <p>
                -{currency}
                {discountAmount}.00
              </p>
            </div>
            <hr />
          </>
        )}

        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency}
            {shippingFee}.00
          </p>
        </div>
        <hr />
        <div className="flex justify-between text-lg font-bold">
          <p>Total</p>
          <p>
            {currency}
            {total}.00
          </p>
        </div>

        {appliedCoupon && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            <p>
              🎉 You saved {currency}
              {discountAmount}.00 with coupon {appliedCoupon.code}!
            </p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <Title text1={"PAYMENT"} text2={"METHOD"} />
        {/* --------------- Payment Method Selection ------------- */}

        <div className='flex gap-3 flex-col lg:flex-row'>

          {/* <div onClick={() => setPaymentMethod('sabpaisa')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'sabpaisa' ? 'bg-green-400' : ''}`}></p>
            <img
              src={sabpaisaLogo}
              alt="SabPaisa Logo"
              className="h-6 mx-3"
            />
          </div>

          <div onClick={() => setPaymentMethod('paytm')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'paytm' ? 'bg-green-400' : ''}`}></p>
            <img
              src={paytmLogo}
              alt="SabPaisa Logo"
              className="h-6 mx-3"
            />
          </div> */}
          <div onClick={() => setPaymentMethod('razorPay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
            <p className={`min-w-3.5 h-3.5 border rounded-full ${paymentMethod === 'razorPay' ? 'bg-green-400' : ''}`}></p>
            <img
              src={razorPayLogo}
              alt="SabPaisa Logo"
              className="h-6 mx-3"
            />
          </div>

        </div>


        <div className="w-full text-end mt-8">
          {hasCriticalStockIssues && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                Cannot proceed: Some items have critical stock issues. Please
                review your order above.
              </div>
            </div>
          )}
        </div>
        <div className="mt-6">
          {paymentMethod === "paytm" && manualPaymentMode && (
            <div className="mt-6 border p-4 rounded-lg bg-gray-50">
              <h3 className="text-md font-bold mb-2">Scan & Pay using Paytm</h3>
              <img
                src="/qrcode.jpg"
                alt="Paytm QR Code"
                className="w-60 h-60 mx-auto mb-4 border object-contain"
              />

              <label className="block text-sm font-medium mb-1">
                Enter UTR Number:
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Enter UTR or Reference Number"
                className="w-full p-2 border rounded mb-3"
              />

              <label className="block text-sm font-medium mb-1">
                Upload Screenshot:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                className="w-full mb-4"
              />

              <button
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleManualPaytmSubmit}
                disabled={!utrNumber && !paymentScreenshot}
              >
                Submit Payment Details
              </button>
              <button
                className="mt-2 w-full py-2 text-sm text-gray-600 underline"
                onClick={() => setManualPaymentMode(false)}
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={isRedirecting || hasCriticalStockIssues}
            className={`w-full mt-4 px-16 py-3 text-sm font-medium transition-all rounded-lg ${hasCriticalStockIssues || isRedirecting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
              }`}
            onClick={() => {
              if (paymentMethod === "paytm") {
                setManualPaymentMode(true);
              } else if (paymentMethod === "razorPay") {
                handleRazorpayPayment();
              } else {
                handleCheckoutClick();
              }
            }}

          >
            {hasCriticalStockIssues
              ? "RESOLVE STOCK ISSUES TO CONTINUE"
              : isRedirecting
                ? "Redirecting..."
                : checkoutMode === "guest"
                  ? "PLACE ORDER AS GUEST"
                  : "PROCEED TO CHECKOUT"}
          </button>

          <SabpaisaPaymentModal
            isOpen={showSabpaisaModal}
            onClose={() => setShowSabpaisaModal(false)}
            amount={total}
          />
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
