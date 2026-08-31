"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.8:5002";

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

// --- RAZORPAY SDK LOADER HELPER ---
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

// 🛡️ Helper to accurately detect if an item is a Combo or a Single Meal
const resolveProductType = (item) => {
  if (
    item.productType === 'Combo' || 
    item.productType === 'FoodComboOffer' || 
    item.itemType === 'FoodComboOffer' || 
    item.itemType === 'Combo' ||
    item.isCombo ||
    item.comboOfferId ||
    item.comboId ||
    (Array.isArray(item.dishes) && item.dishes.length > 0)
  ) {
    return 'Combo';
  }
  return 'MealItem';
};

// 🛡️ Helper to safely extract Item ID
const resolveItemId = (item) => {
  return item.itemId?._id || item.itemId || item._id || item.id;
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

  // Accessories / Addons States
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [optOutOfCutlery, setOptOutOfCutlery] = useState(false);

  // Checkout Options & Live Calculated Bill Breakdown States
  const [isRapid, setIsRapid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' or 'COD'
  const [billSummary, setBillSummary] = useState(null);
  const [orderRestrictions, setOrderRestrictions] = useState({ isCodAvailable: true, isRapidAvailable: true });
  const [distanceText, setDistanceText] = useState('Calculating...');
  const [appliedLocation, setAppliedLocation] = useState(null);
  const [calculatingBill, setCalculatingBill] = useState(false);

  // Order Confirmation Modal State
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // --- Format Addons Array for Payload ---
  const formattedAddons = useMemo(() => {
    if (optOutOfCutlery) return [];
    return selectedAccessories.map((a) => ({
      addonId: a._id || a.addonId || a.id,
      quantity: a.quantity || 1
    }));
  }, [optOutOfCutlery, selectedAccessories]);

  // Accessories Cost Total Calculation
  const accessoriesTotal = useMemo(() => {
    if (optOutOfCutlery) return 0;
    return selectedAccessories.reduce((acc, curr) => acc + (Number(curr.price) || 0) * (curr.quantity || 1), 0);
  }, [optOutOfCutlery, selectedAccessories]);

  // --- 1. Live Bill Breakdown Calculation (POST /api/food/checkout/calculate) ---
  const calculateLiveBill = useCallback(async (targetAddr = selectedAddress) => {
    const kitchen = foodCart?.foodId || {};
    // Extract Kitchen ID safely
    const foodId = kitchen._id || (typeof foodCart?.foodId === 'string' ? foodCart?.foodId : (foodCart?.vendorId || null));

    if (!foodCart?.items || foodCart.items.length === 0) return;

    setCalculatingBill(true);
    try {
      let lat = 30.7046;
      let lng = 76.7179;

      if (targetAddr?.lat && targetAddr?.lng) {
        lat = Number(targetAddr.lat);
        lng = Number(targetAddr.lng);
      } else if (typeof window !== "undefined") {
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

      // 🛡️ Format items accurately with Combo detection
      const calculationPayload = {
        foodId: foodId || undefined,
        address: targetAddr ? {
          city: targetAddr.city,
          state: targetAddr.state
        } : undefined,
        userLat: lat,
        userLng: lng,
        couponCode: appliedCoupon ? appliedCoupon.couponName : undefined,
        isRapid,
        items: (foodCart.items || []).map((item) => ({
          itemId: resolveItemId(item),
          quantity: item.quantity || 1,
          productType: resolveProductType(item) // 👈 Ab Combo ko 100% "Combo" hi bhejega!
        })),
        addons: formattedAddons
      };

      const response = await UserAPI.previewFoodBill(calculationPayload);
      if (response && response.success) {
        setBillSummary(response.billSummary);

        if (response.orderRestrictions) {
          setOrderRestrictions(response.orderRestrictions);
          if (response.orderRestrictions.isCodAvailable === false && paymentMethod === 'COD') {
            setPaymentMethod('Online');
          }
          if (response.orderRestrictions.isRapidAvailable === false && isRapid) {
            setIsRapid(false);
          }
        }

        if (response.distance) {
          setDistanceText(response.distance);
        }

        if (response.appliedLocation) {
          setAppliedLocation(response.appliedLocation);
        }
      }
    } catch (err) {
      console.error("Error previewing bill:", err);
    } finally {
      setCalculatingBill(false);
    }
  }, [foodCart, appliedCoupon, isRapid, selectedAddress, paymentMethod, formattedAddons]);

  // --- 2. Fetch Initial Default Address on Mount ---
  useEffect(() => {
    const fetchInitialAddress = async () => {
      setLoadingAddress(true);
      try {
        const response = await UserAPI.getAddressList();
        if (response && response.success) {
          const addressList = response.data || [];
          const defaultAddr = addressList.find((a) => a.isDefault);
          const chosen = defaultAddr || (addressList.length > 0 ? addressList[0] : null);
          if (chosen) {
            setSelectedAddress(chosen);
            calculateLiveBill(chosen);
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

  // --- 3. Recalculate bill whenever dependencies update ---
  useEffect(() => {
    if (foodCart && foodCart.items && foodCart.items.length > 0) {
      calculateLiveBill(selectedAddress);
    }
  }, [calculateLiveBill, selectedAddress, foodCart]);

  // --- Single Source of Truth for Final Payable Total ---
  const finalPayableTotal = billSummary?.totalAmount ?? (foodCartTotal + accessoriesTotal);

  // --- Accessory Handlers ---
  const handleUpdateAccessoryQty = (item, delta) => {
    setSelectedAccessories((prev) => {
      const existing = prev.find((a) => (a._id || a.id) === (item._id || item.id));
      if (!existing && delta > 0) {
        return [...prev, { ...item, quantity: 1 }];
      }
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((a) => (a._id || a.id) !== (item._id || item.id));
        }
        return prev.map((a) => ((a._id || a.id) === (item._id || item.id) ? { ...a, quantity: newQty } : a));
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

  // --- Cart Item Modifiers ---
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
    const foodId = kitchen._id || (typeof foodCart?.foodId === 'string' ? foodCart?.foodId : (foodCart?.vendorId || null));

    let lat = 30.7046;
    let lng = 76.7179;
    if (selectedAddress.lat && selectedAddress.lng) {
      lat = Number(selectedAddress.lat);
      lng = Number(selectedAddress.lng);
    } else if (typeof window !== "undefined") {
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

    const orderPayload = {
      foodId: foodId || undefined,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.couponName : undefined,
      userLat: lat,
      userLng: lng,
      deliverySlot: isRapid ? "Rapid Express (25-30 mins)" : "Immediate (30-45 mins)",
      isRapid,
      bookingType: "Direct",
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
      },
      items: (foodCart.items || []).map((item) => ({
        itemId: resolveItemId(item),
        quantity: item.quantity || 1,
        productType: resolveProductType(item) // 👈 Accurate detection for order placement
      })),
      addons: formattedAddons
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

      const amountInPaise = orderRes.amount || (orderRes.amountInRupees ? Math.round(orderRes.amountInRupees * 100) : Math.round(finalPayableTotal * 100));

      const options = {
        key: razorpayKey,
        amount: amountInPaise,
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

        {/* Top Back Navigation Bar */}
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

          {/* Left Column: Cart Items List + Dynamic Accessories */}
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
              getMediaUrl={getMediaUrl}
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
              orderRestrictions={orderRestrictions}
              distanceText={distanceText}
              appliedLocation={appliedLocation}
              isRapid={isRapid}
              onToggleRapid={() => setIsRapid(!isRapid)}
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              onProceedCheckout={handleProceedToCheckout}
              checkingOut={checkingOut}
              calculating={calculatingBill}
              fallbackSubtotal={foodCartTotal}
              accessoriesTotal={accessoriesTotal}
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
            calculateLiveBill(addr);
            if (showNotification) {
              showNotification(`Delivery address set to ${addr.city}. Updating delivery rates...`, "success");
            }
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
