"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';

// Contexts & Services
import { useCart } from '../../../../context/CartContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

// Modular Sub-Components
import EmptyCart from './components/EmptyCart';
import CartItemsList from './components/CartItemsList';
import AccessoriesCard from './components/AccessoriesCard';
import KitchenInfoCard from './components/KitchenInfoCard';
import DeliveryAddressCard from './components/DeliveryAddressCard';
import CouponCard from './components/CouponCard';
import CostSummaryCard from './components/CostSummaryCard';
import Address from './components/Address';
import Coupons from './components/Coupons';
import OrderSuccessModal from './components/OrderSuccessModal';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200";

// --- RAZORPAY SDK LOADER ---
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function FoodCartPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const {
    foodCart,
    foodCartTotal,
    updateFoodItemQuantity,
    removeFoodCartItem,
    clearFoodCart
  } = useCart();

  // Action States
  const [updatingId, setUpdatingId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Address States
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Coupon States
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Accessories / Cutlery States
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [optOutOfCutlery, setOptOutOfCutlery] = useState(false);

  // Checkout Options & Live Calculated Bill Summary States
  const [isRapid, setIsRapid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' or 'COD'
  const [billSummary, setBillSummary] = useState(null);
  const [distanceText, setDistanceText] = useState('Calculating...');
  const [calculatingBill, setCalculatingBill] = useState(false);

  // Order Confirmation Modal State
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // --- 1. Fetch Default Address on Mount ---
  useEffect(() => {
    const fetchInitialAddress = async () => {
      setLoadingAddress(true);
      try {
        const response = await UserAPI.getAddressList();
        if (response && response.success) {
          const addressList = response.data || [];
          const defaultAddr = addressList.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          } else if (addressList.length > 0) {
            setSelectedAddress(addressList[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching initial delivery address:", err);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchInitialAddress();
  }, []);

  // --- 2. Live Bill Preview & Calculation Call ---
  const calculateLiveBill = useCallback(async () => {
    const kitchen = foodCart?.foodId || {};
    const foodId = kitchen._id || (typeof foodCart?.foodId === 'string' ? foodCart?.foodId : null);
    if (!foodId) return;

    setCalculatingBill(true);
    try {
      let lat = 30.7114;
      let lng = 76.6908;

      if (typeof window !== "undefined") {
        const savedCoords = localStorage.getItem("userCoords");
        if (savedCoords) {
          try {
            const parsed = JSON.parse(savedCoords);
            if (parsed.lat && parsed.lng) {
              lat = Number(parsed.lat);
              lng = Number(parsed.lng);
            }
          } catch (e) {
            console.error("Error reading coordinates:", e);
          }
        }
      }

      const calculationPayload = {
        foodId,
        userLat: lat,
        userLng: lng,
        couponCode: appliedCoupon ? appliedCoupon.couponName : undefined,
        isRapid
      };

      const response = await UserAPI.previewFoodBill(calculationPayload);
      if (response && response.success) {
        setBillSummary(response.billSummary);
        if (response.distance) {
          setDistanceText(response.distance);
        }
      }
    } catch (err) {
      console.error("Error previewing bill:", err);
    } finally {
      setCalculatingBill(false);
    }
  }, [foodCart, appliedCoupon, isRapid, selectedAddress]);

  useEffect(() => {
    if (foodCart && foodCart.items && foodCart.items.length > 0) {
      calculateLiveBill();
    }
  }, [calculateLiveBill]);

  // --- Accessory Handlers ---
  const handleUpdateAccessoryQty = (item, delta) => {
    setSelectedAccessories((prev) => {
      const existing = prev.find((a) => a.id === item.id);
      if (!existing && delta > 0) {
        return [...prev, { ...item, quantity: 1 }];
      }
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((a) => a.id !== item.id);
        }
        return prev.map((a) => (a.id === item.id ? { ...a, quantity: newQty } : a));
      }
      return prev;
    });
  };

  const handleToggleOptOutCutlery = () => {
    setOptOutOfCutlery((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        setSelectedAccessories([]);
      }
      return nextVal;
    });
  };

  // --- Item Quantity Handlers ---
  const handleQtyChange = async (itemId, currentQty, action) => {
    setUpdatingId(itemId);
    try {
      if (currentQty === 1 && action === 'dec') {
        const response = await removeFoodCartItem(itemId);
        if (showNotification && response) {
          showNotification("Item removed from your tray.", "success");
        }
      } else {
        await updateFoodItemQuantity(itemId, action);
      }
    } catch (err) {
      console.error("Error modifying item quantity:", err);
      if (showNotification) {
        showNotification("Failed to update item quantity.", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingId(itemId);
    try {
      const response = await removeFoodCartItem(itemId);
      if (showNotification && response) {
        showNotification("Item removed from your tray.", "success");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      if (showNotification) {
        showNotification("Failed to remove item from tray.", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire food tray?")) return;
    setClearingCart(true);
    try {
      const response = await clearFoodCart();
      if (showNotification && response) {
        showNotification("Your food tray has been cleared.", "success");
      }
      setAppliedCoupon(null);
      setSelectedAccessories([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      if (showNotification) {
        showNotification("Failed to empty food tray.", "error");
      }
    } finally {
      setClearingCart(false);
    }
  };

  // =========================================================================
  // CHECKOUT ORCHESTRATION (COD & RAZORPAY ONLINE FLOW)
  // =========================================================================
  const handleProceedToCheckout = async () => {
    if (!selectedAddress) {
      if (showNotification) {
        showNotification("Please select a delivery address to proceed.", "error");
      }
      setIsAddressModalOpen(true);
      return;
    }

    const kitchen = foodCart?.foodId || {};
    const foodId = kitchen._id || (typeof foodCart?.foodId === 'string' ? foodCart?.foodId : null);

    if (!foodId) {
      if (showNotification) {
        showNotification("Unable to determine kitchen details.", "error");
      }
      return;
    }

    let lat = 30.7114;
    let lng = 76.6908;
    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("userCoords");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat && parsed.lng) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setCheckingOut(true);

    // Build payload matching API documentation
    const orderPayload = {
      foodId,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.couponName : undefined,
      userLat: lat,
      userLng: lng,
      deliverySlot: isRapid ? "Rapid Express (25-30 mins)" : "Immediate (30-45 mins)",
      address: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        houseNo: selectedAddress.houseNo,
        sector: selectedAddress.sector || undefined,
        landmark: selectedAddress.landmark || undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        addressType: selectedAddress.addressType || "Home"
      }
    };

    try {
      // --- FLOW A: CASH ON DELIVERY (COD) ---
      if (paymentMethod === 'COD') {
        const response = await UserAPI.placeFoodOrder(orderPayload);
        if (response && response.success) {
          await clearFoodCart();
          setPlacedOrderData(response.data);
          setIsSuccessModalOpen(true);
          if (showNotification) {
            showNotification(response.message || "Food order placed successfully (COD)!", "success");
          }
        } else {
          if (showNotification) {
            showNotification(response?.message || "Failed to place COD order.", "error");
          }
        }
        setCheckingOut(false);
        return;
      }

      // --- FLOW B: RAZORPAY ONLINE PAYMENT ---
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        if (showNotification) {
          showNotification("Razorpay payment gateway failed to load.", "error");
        }
        setCheckingOut(false);
        return;
      }

      const orderRes = await UserAPI.placeFoodOrder(orderPayload);
      if (!orderRes || !orderRes.success) {
        if (showNotification) {
          showNotification(orderRes?.message || "Failed to initiate online order.", "error");
        }
        setCheckingOut(false);
        return;
      }

      const razorpayKey = orderRes.key || orderRes.key_id || orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayOrderId = orderRes.razorpayOrderId || orderRes.orderId || orderRes.order_id;
      const appointmentId = orderRes.appointmentId || orderRes.bookingId || orderRes._id;
      const amount = orderRes.amount || (orderRes.amountInRupees ? orderRes.amountInRupees * 100 : billSummary?.totalAmount ? billSummary.totalAmount * 100 : 0);

      // Configure Razorpay Checkout Sheet
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: orderRes.currency || "INR",
        name: kitchen.name || "Healthy Cloud Kitchen",
        description: "Nutritional Meal Checkout",
        image: getMediaUrl(kitchen.profileImage) || PLACEHOLDER_IMAGE,
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyPayload = {
              appointmentId: appointmentId,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature
            };

            const verifyRes = await UserAPI.verifyRazorpayPayment(verifyPayload);
            if (verifyRes && verifyRes.success) {
              await clearFoodCart();
              setPlacedOrderData(verifyRes.data);
              setIsSuccessModalOpen(true);
              if (showNotification) {
                showNotification("Payment verified successfully & food order confirmed!", "success");
              }
            } else {
              if (showNotification) {
                showNotification(verifyRes?.message || "Payment verification failed.", "error");
              }
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            if (showNotification) {
              showNotification("Payment verification error.", "error");
            }
          }
        },
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.phone
        },
        theme: {
          color: "#3d3f96"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout process error:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "An error occurred during checkout.", "error");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const hasItems = foodCart && foodCart.items && foodCart.items.length > 0;

  if (!hasItems && !isSuccessModalOpen) {
    return <EmptyCart />;
  }

  const kitchen = foodCart?.foodId || {};

  return (
    <main className="min-h-screen bg-[#f8fbff] py-8 sm:py-12 antialiased select-none text-slate-800 text-left">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={14} className="stroke-[2.5]" />
            <span>Back to Menu</span>
          </button>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearingCart}
            className="text-xs font-black text-rose-600 hover:text-rose-800 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {clearingCart ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span>Clear Full Tray</span>
          </button>
        </div>

        {/* Primary Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List + Accessories */}
          <div className="lg:col-span-7 space-y-5">
            <CartItemsList
              items={foodCart?.items || []}
              updatingId={updatingId}
              onQtyChange={handleQtyChange}
              onRemoveItem={handleRemoveItem}
              getMediaUrl={getMediaUrl}
              placeholderImage={PLACEHOLDER_IMAGE}
            />

            <AccessoriesCard
              selectedAccessories={selectedAccessories}
              onUpdateAccessoryQty={handleUpdateAccessoryQty}
              optOutOfCutlery={optOutOfCutlery}
              onToggleOptOutCutlery={handleToggleOptOutCutlery}
            />
          </div>

          {/* Right Column: Kitchen, Address, Offers & Real-Time Bill Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <KitchenInfoCard
              kitchen={kitchen}
              getMediaUrl={getMediaUrl}
              placeholderImage={KITCHEN_PLACEHOLDER}
            />

            <DeliveryAddressCard
              selectedAddress={selectedAddress}
              loadingAddress={loadingAddress}
              onOpenAddressModal={() => setIsAddressModalOpen(true)}
            />

            <CouponCard
              appliedCoupon={appliedCoupon}
              discountAmount={billSummary?.couponDiscount || 0}
              onOpenCouponModal={() => setIsCouponModalOpen(true)}
              onRemoveCoupon={() => {
                setAppliedCoupon(null);
                if (showNotification) {
                  showNotification("Coupon removed.", "success");
                }
              }}
            />

            <CostSummaryCard
              billSummary={billSummary}
              distanceText={distanceText}
              isRapid={isRapid}
              onToggleRapid={() => setIsRapid(!isRapid)}
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              onProceedCheckout={handleProceedToCheckout}
              checkingOut={checkingOut}
              calculating={calculatingBill}
            />
          </div>

        </div>

      </div>

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <Address
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddressId={selectedAddress?._id}
          onSelectAddress={(addr) => {
            setSelectedAddress(addr);
            setIsAddressModalOpen(false);
          }}
        />
      )}

      {/* Coupons Selection Modal */}
      {isCouponModalOpen && (
        <Coupons
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          cartTotal={billSummary?.itemTotal || foodCartTotal}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={(coupon) => {
            setAppliedCoupon(coupon);
            if (showNotification) {
              showNotification(`Coupon ${coupon.couponName} applied!`, "success");
            }
          }}
          onRemoveCoupon={() => {
            setAppliedCoupon(null);
            if (showNotification) {
              showNotification("Coupon removed.", "success");
            }
          }}
        />
      )}

      {/* Order Confirmed Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        orderData={placedOrderData}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </main>
  );
}