import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import CouponCode from "./CouponCode";
import sabpaisaLogo from '../assets/sabpaisa_logo.png'
import paytmLogo from '../assets/paytm_logo.png'
import razorPayLogo from '../assets/razorpay_logo.png'
import SabpaisaPaymentModal from "./SabpaisaPaymentModal";
import axios from "axios";
import { toast } from 'react-toastify';
import CheckoutForm from "./CheckoutForm";


const CartTotal = ({ hasCriticalStockIssues }) => {
  const delivery_fee = 100;
  const FREE_DELIVERY_THRESHOLD = 2000;

  const { backendUrl, token, navigate, currency, getCartAmount, cartItems, directBuyItem, formData, products, clearCart } = useContext(ShopContext);

  const isFormFilled = Object.values(formData).every((val) => val.trim() !== "");
  const isLoggedIn = !!token;
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  console.log("IS Logged in", isLoggedIn, token)
  let subtotal = directBuyItem
    ? Number(directBuyItem.price) * (directBuyItem.quantity)
    : Number(getCartAmount());

  // shipping
  let shippingFee = 0;
  if (appliedCoupon?.discountType === "free_shipping") {
    shippingFee = 0;
  } else {
    shippingFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : delivery_fee;
  }

  // discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount !== undefined) {
      // Use backend-calculated discount
      discount = Number(appliedCoupon.discountAmount) || 0;
    } else {
      // fallback if only type/value is present
      const value = Number(appliedCoupon.value || appliedCoupon.discountValue || 0);
      if (appliedCoupon.discountType === "percentage") {
        discount = (subtotal * value) / 100;
      } else if (appliedCoupon.discountType === "fixed") {
        discount = value;
      }
    }
  }

  const total = Math.max(0, subtotal - discount + Number(shippingFee));
  const amountLeftForFreeDelivery =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FREE_DELIVERY_THRESHOLD - subtotal;

  const [paymentMethod, setPaymentMethod] = useState("razorPay");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showSabpaisaModal, setShowSabpaisaModal] = useState(false);
  // Reset isRedirecting on component mount to allow multiple submissions
  const [checkoutMode, setCheckoutMode] = useState(null); // 'guest' or 'login'

  useEffect(() => {
    if (isLoggedIn) {
      setCheckoutMode('login');
    } else if (checkoutMode === null) {
      setCheckoutMode('guest'); // Default to guest if not logged in
    }
  }, [isLoggedIn, checkoutMode]);

  useEffect(() => {
    setIsRedirecting(false);
  }, []);

  const handleCouponApplied = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
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
  const buildCartItemsArray = (cartItems, products) => {
    const itemsArray = [];
    for (const productId in cartItems) {
      const sizesObj = cartItems[productId];
      for (const size in sizesObj) {
        const quantity = sizesObj[size];
        if (quantity > 0) {
          const product = products.find(p => p._id === productId);
          if (product) {
            itemsArray.push({
              _id: productId,
              name: product.name,
              size: size, // use the cart size key here
              quantity: quantity,
            });
          }
        }
      }
    }
    return itemsArray;
  };

  useEffect(() => {
    console.log("All Products:", products)
    console.log("Direct Buy Item:", directBuyItem)
    console.log("Cart Items:", buildCartItemsArray(cartItems, products))
    console.log("Form data", formData)
  }, [])

  const handleCheckout = () => {
    if (!isFormFilled) {
      toast.error("Please Sign Up To Proceed");
      return;
    }

    // ✅ Proceed to Razorpay payment if form is filled
    handleRazorpayPayment();
  };

  const handleRazorpayPayment = async () => {
    console.log("Form data while submitting", formData)

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }




    try {
      // Step 1: Create Razorpay Order
      const { data } = await axios.post(
        `${backendUrl}/order/razorpay/create-order`,
        {
          amount: total,
          isGuest: checkoutMode === "guest",
        },
        {
          headers: checkoutMode === "login" ? { token } : {},
        }
      );
      const items = directBuyItem
        ? [{
          _id: directBuyItem._id,
          name: directBuyItem.name,
          size: directBuyItem.selectedSize, // correct for direct buy
          quantity: directBuyItem.quantity,
        }]
        : buildCartItemsArray(cartItems, products); // where buildCartItemsArray uses size keys from cartItems

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Your Store",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          const res = await axios.post(
            `${backendUrl}/order/razorpay/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isGuest: checkoutMode === "guest",
              orderData: {
                items,
                address: {
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  zipcode: formData.zipcode,
                  country: formData.country,
                },
                couponCode: appliedCoupon?.code,
                isGuest: checkoutMode === "guest",
                guestInfo: checkoutMode === "guest" ? formData : null
              }

            },
            {
              headers: checkoutMode === "login" ? { token } : {},
            }
          );

          console.log("Success response", res)
          if (res.data.success) {
            clearCart();
            console.log("Navigating to order success page");
            navigate(`/order-success?orderId=${res.data.orderId}`);
          } else {
            console.log("")
            alert(res.data.message);
            navigate('/order-failure')
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
          <p>Subtotal:</p>
          <p>
            {currency}{subtotal.toFixed(2)}
          </p>
        </div>

        {appliedCoupon && (
          <>
            <div className="flex justify-between text-green-600">
              <p>Discount ({appliedCoupon.code})</p>
              <p>
                -{currency}{discount.toFixed(2)}
              </p>
            </div>
            <hr />
          </>
        )}

        {/* <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency}
            {shippingFee}.00
          </p>
        </div> */}
        {/* Shipping Fee */}
        <div className="flex justify-between text-sm mb-1">
          <span>Shipping:</span>
          <span>
            {shippingFee === 0 ? "FREE" : `${currency}${shippingFee.toFixed(2)}`}
          </span>
        </div>

        {/* Free Delivery Message */}
        {amountLeftForFreeDelivery > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            🚚 Add {currency}
            {amountLeftForFreeDelivery}.00 more to avail <b>FREE Delivery!</b>
          </div>
        )}
        <hr />
        <div className="flex justify-between text-lg font-bold">
          <p>Total:</p>
          <p>
            {currency}{total.toFixed(2)}
          </p>
        </div>

        {/* Delivery Address Section */}
        {formData?.street && (
          <div className="mt-6 p-3 border rounded bg-gray-50 text-sm">
            <h3 className="font-semibold mb-2">📦 Delivering To:</h3>
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.street}, {formData.city}</p>
            <p>{formData.state} - {formData.zipcode}</p>
            <p>{formData.country}</p>
            <p>📞 {formData.phone}</p>
          </div>
        )}

        {appliedCoupon && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            <p>
              🎉 You saved {currency}
              {discount}.00 with coupon {appliedCoupon.code}!
            </p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <Title text1={"PAYMENT"} text2={"METHOD"} />
        {/* --------------- Payment Method Selection ------------- */}

        <div className='flex gap-3 flex-col lg:flex-row'>

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
          <button
            type="button"
            disabled={isRedirecting || hasCriticalStockIssues}
            className={`w-full mt-4 px-16 py-3 text-sm font-medium transition-all rounded-lg ${hasCriticalStockIssues || isRedirecting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
              }`}
            onClick={() => handleCheckout()}

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
