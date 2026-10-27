// PharmacyCartPage.jsx
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
import PharmacyItemsList from './components/PharmacyItemsList';
import PharmacyInfoCard from './components/PharmacyInfoCard';
import PatientProfileCard from './components/PatientProfileCard';
import PrescriptionCard from './components/PrescriptionCard';
import DeliveryModeCard from './components/DeliveryModeCard';
import DeliveryInstructionsCard from './components/DeliveryInstructionsCard';
import DeliveryAddressCard from './components/DeliveryAddressCard';
import CouponCard from './components/CouponCard';
import CostSummaryCard from './components/CostSummaryCard';
import Address from './components/Address';
import Coupons from './components/Coupons';
import OrderSuccessModal from './components/OrderSuccessModal';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.10:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let cleanPath = path.replace(/\\/g, '/');
  cleanPath = cleanPath.replace(/^public\//, '');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PHARMACY_PLACEHOLDER = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400";
const ITEM_PLACEHOLDER = "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400";

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

export default function PharmacyCartPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const {
    pharmacyCart,
    pharmacyCartTotal,
    updatePharmacyItemQuantity,
    removePharmacyItem,
    clearPharmacyCart
  } = useCart();

  // Action States
  const [updatingId, setUpdatingId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Address States
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Family / Patient Member States
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState({ _id: "Self", memberName: "Self", relation: "Primary Account" });

  // Coupon States
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Delivery Mode & Slot States
  const [deliveryMode, setDeliveryMode] = useState('standard'); // 'standard' | 'rapid' | 'slot'
  const [deliveryCharges, setDeliveryCharges] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSlotLoading, setIsSlotLoading] = useState(false);
  const [isSlotClosed, setIsSlotClosed] = useState(false);

  // Delivery Instructions State
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Prescription Upload State
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);

  // Checkout Evaluation & Bill States
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' | 'COD'
  const [billSummary, setBillSummary] = useState(null);
  const [orderRestrictions, setOrderRestrictions] = useState({ isCodAvailable: true, isRapidAvailable: true });
  const [calculatingBill, setCalculatingBill] = useState(false);

  // Order Success Modal State
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const cartItems = pharmacyCart?.items || [];
  const pharmacy = pharmacyCart?.pharmacyId || {};
  const pharmacyId = pharmacy._id || (typeof pharmacy === 'string' ? pharmacy : pharmacyCart?.vendorId);

  // 🛡️ Rx Mandatory Detection
  const isPrescriptionRequired = useMemo(() => {
    const hasRxItem = cartItems.some(
      (item) =>
        item.medicineId?.prescription_required === "YES" ||
        item.medicineId?.prescriptionRequired === "YES" ||
        item.prescriptionRequired === "YES"
    );
    return hasRxItem || billSummary?.rxMandatory === true;
  }, [cartItems, billSummary]);

  // Navigate to add more medicine for this specific pharmacy
  const handleAddMoreMedicines = () => {
    if (pharmacyId) {
      router.push(`/pharmacy/allproductsandmedicines?pharmacyId=${pharmacyId}`);
    } else {
      router.push(`/pharmacy/allproductsandmedicines`);
    }
  };

  // --- 1. Live Bill Evaluation (POST /user/pharmacy/checkout) ---
  const calculateLiveBill = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) return;

    setCalculatingBill(true);
    try {
      const calculationPayload = {
        collectionType: "Home Delivery",
        isRapid: deliveryMode === 'rapid',
        isSlotSelected: deliveryMode === 'slot',
        appointmentTime: deliveryMode === 'slot' ? selectedSlot?.displayTime : undefined,
        couponCode: appliedCoupon ? appliedCoupon.couponName : undefined
      };

      const response = await UserAPI.evaluateUserPharmacyCheckoutSummary(calculationPayload);
      if (response && response.success && response.data) {
        const checkoutData = response.data;
        setBillSummary(checkoutData.billSummary);

        if (checkoutData.isCodAvailable !== undefined) {
          setOrderRestrictions((prev) => ({
            ...prev,
            isCodAvailable: checkoutData.isCodAvailable
          }));
          if (checkoutData.isCodAvailable === false && paymentMethod === 'COD') {
            setPaymentMethod('Online');
          }
        }
      }
    } catch (err) {
      console.error("Error evaluating pharmacy checkout bill:", err);
    } finally {
      setCalculatingBill(false);
    }
  }, [cartItems, deliveryMode, selectedSlot, appliedCoupon, paymentMethod]);

  // --- 2. Initial Fetch for Address, Family Members & Store Config ---
  useEffect(() => {
    const fetchInitialDependencies = async () => {
      setLoadingAddress(true);
      try {
        const [addrRes, famRes, chargesRes] = await Promise.all([
          UserAPI.getAddressList(),
          UserAPI.getFamilyMembers(),
          UserAPI.getUserPharmacyDeliveryCharges()
        ]);

        if (addrRes && addrRes.success) {
          const list = addrRes.data || [];
          const defaultAddr = list.find((a) => a.isDefault) || (list.length > 0 ? list[0] : null);
          if (defaultAddr) setSelectedAddress(defaultAddr);
        }

        if (famRes && famRes.success) {
          setFamilyMembers(famRes.data || []);
        }

        if (chargesRes && chargesRes.success && chargesRes.data) {
          setDeliveryCharges(chargesRes.data);
          setOrderRestrictions({
            isCodAvailable: chargesRes.data.isCodAvailable ?? chargesRes.data.isCODAvailable ?? true,
            isRapidAvailable: chargesRes.data.isRapidAvailable ?? true
          });
        }
      } catch (err) {
        console.error("Error fetching cart dependencies:", err);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchInitialDependencies();
  }, []);

  // --- 3. Time Slots Fetch when Slot Mode is Chosen ---
  useEffect(() => {
    if (deliveryMode !== 'slot' || !pharmacyId) return;

    const fetchSlots = async () => {
      setIsSlotLoading(true);
      try {
        const res = await UserAPI.getUserPharmacyDeliverySlots({
          pharmacyId,
          date: selectedDate
        });
        if (res && res.success) {
          setIsSlotClosed(res.isClosed || false);
          setAvailableSlots(res.slots || []);
          const firstOpen = (res.slots || []).find((s) => !s.isFull);
          setSelectedSlot(firstOpen || null);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setIsSlotLoading(false);
      }
    };

    fetchSlots();
  }, [deliveryMode, pharmacyId, selectedDate]);

  // --- 4. Recalculate bill whenever dependencies update ---
  useEffect(() => {
    if (cartItems.length > 0) {
      calculateLiveBill();
    }
  }, [calculateLiveBill, cartItems.length]);

  // --- Cart Item Modifiers ---
  const handleQtyChange = async (itemId, currentQty, action) => {
    setUpdatingId(itemId);
    try {
      if (currentQty === 1 && action === 'dec') {
        const response = await removePharmacyItem(itemId);
        if (showNotification && response) {
          showNotification("Item removed from your cart.", "success");
        }
      } else {
        await updatePharmacyItemQuantity(itemId, action);
      }
    } catch (err) {
      console.error("Error updating item quantity:", err);
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
      const response = await removePharmacyItem(itemId);
      if (showNotification && response) {
        showNotification("Item removed from your cart.", "success");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      if (showNotification) {
        showNotification("Failed to remove item.", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your pharmacy cart?")) return;
    setClearingCart(true);
    try {
      const response = await clearPharmacyCart();
      if (showNotification && response) {
        showNotification("Your pharmacy cart has been cleared.", "success");
      }
      setAppliedCoupon(null);
      setPrescriptionFiles([]);
      setDeliveryInstructions("");
    } catch (err) {
      console.error("Error clearing cart:", err);
      if (showNotification) {
        showNotification("Failed to empty pharmacy cart.", "error");
      }
    } finally {
      setClearingCart(false);
    }
  };

  // =========================================================================
  // CHECKOUT ORCHESTRATION WITH ANYINSTRUCTION & STRICT PRESCRIPTION CHECK
  // =========================================================================
  const handleProceedToCheckout = async () => {
    if (!selectedAddress) {
      if (showNotification) {
        showNotification("Please select a delivery address to proceed.", "error");
      }
      setIsAddressModalOpen(true);
      return;
    }

    if (deliveryMode === 'slot' && !selectedSlot) {
      if (showNotification) {
        showNotification("Please select a preferred delivery time slot.", "error");
      }
      return;
    }

    // 🛑 STRICT PRESCRIPTION VALIDATION
    if (isPrescriptionRequired && prescriptionFiles.length === 0) {
      if (showNotification) {
        showNotification(
          "Doctor's prescription is required for medicines in your cart. Please upload a valid prescription to place your order.",
          "error"
        );
      }
      const rxSection = document.getElementById("prescription-section");
      if (rxSection) {
        rxSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setCheckingOut(true);

    const formData = new FormData();
    formData.append("paymentMethod", paymentMethod);
    formData.append("collectionType", "Home Delivery");

    const addressPayload = {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      houseNo: selectedAddress.houseNo,
      sector: selectedAddress.sector || undefined,
      landmark: selectedAddress.landmark || undefined,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      addressType: selectedAddress.addressType || "Home"
    };
    formData.append("address", JSON.stringify(addressPayload));

    formData.append("isRapid", (deliveryMode === 'rapid').toString());
    formData.append("isSlotSelected", (deliveryMode === 'slot').toString());

    if (deliveryMode === 'slot' && selectedSlot) {
      formData.append("appointmentTime", selectedSlot.displayTime);
      formData.append("appointmentDate", selectedDate);
    }

    if (appliedCoupon?.couponName) {
      formData.append("couponCode", appliedCoupon.couponName);
    }

    const patientIds = [selectedPatient?._id || "Self"];
    formData.append("patientIds", JSON.stringify(patientIds));

    // Special delivery instructions for rider
    if (deliveryInstructions.trim()) {
      formData.append("anyInstruction", deliveryInstructions.trim());
      formData.append("instructions", deliveryInstructions.trim());
    }

    // Append all selected prescription files
    prescriptionFiles.forEach((file) => {
      formData.append("prescriptionImages", file);
    });

    try {
      // --- FLOW A: CASH ON DELIVERY (COD) ---
      if (paymentMethod === 'COD') {
        const response = await UserAPI.placeUserPharmacyOrder(formData);
        if (response && response.success) {
          await clearPharmacyCart();
          setPlacedOrderData(response.data);
          setIsSuccessModalOpen(true);
          if (showNotification) {
            showNotification(response.message || "Pharmacy order placed successfully (COD)!", "success");
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

      const orderRes = await UserAPI.placeUserPharmacyOrder(formData);
      if (!orderRes || !orderRes.success) {
        if (showNotification) {
          showNotification(orderRes?.message || "Failed to initiate online order.", "error");
        }
        setCheckingOut(false);
        return;
      }

      const razorpayKey = orderRes.key || orderRes.key_id || orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayOrderId = orderRes.razorpayOrderId || orderRes.orderId || orderRes.order_id;
      const orderId = orderRes.orderId;

      const amountInPaise = orderRes.amount || Math.round((billSummary?.totalAmount || pharmacyCartTotal) * 100);

      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: orderRes.currency || "INR",
        name: pharmacy.name || "Partner Pharmacy",
        description: "Prescription & Medication Checkout",
        image: getMediaUrl(pharmacy.profileImage) || PHARMACY_PLACEHOLDER,
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyPayload = {
              orderId: orderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            };

            const verifyRes = await UserAPI.verifyUserPharmacyPayment(verifyPayload);
            if (verifyRes && verifyRes.success) {
              await clearPharmacyCart();
              setPlacedOrderData(verifyRes.data || verifyRes);
              setIsSuccessModalOpen(true);
              if (showNotification) {
                showNotification("Payment verified successfully & order confirmed!", "success");
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

  const hasItems = cartItems.length > 0;

  if (!hasItems && !isSuccessModalOpen) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] py-4 sm:py-8 lg:py-12 antialiased select-none text-slate-800 text-left">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">

        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-[11px] sm:text-xs uppercase tracking-wider transition-colors cursor-pointer bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs"
          >
            <ArrowLeft size={13} className="stroke-[2.5]" />
            <span>Back to Catalog</span>
          </button>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearingCart}
            className="text-[11px] sm:text-xs font-black text-rose-600 hover:text-rose-800 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {clearingCart ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            <span>Clear Full Cart</span>
          </button>
        </div>

        {/* Primary Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">

          {/* Left Column: Cart Items, Patient, Delivery Mode, Instructions, Prescription */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
            <PharmacyItemsList
              items={cartItems}
              updatingId={updatingId}
              onQtyChange={handleQtyChange}
              onRemoveItem={handleRemoveItem}
              onAddMoreMedicines={handleAddMoreMedicines}
              getMediaUrl={getMediaUrl}
              placeholderImage={ITEM_PLACEHOLDER}
            />

            <PatientProfileCard
              familyMembers={familyMembers}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
              getMediaUrl={getMediaUrl}
            />

            <DeliveryModeCard
              deliveryMode={deliveryMode}
              onSelectMode={setDeliveryMode}
              deliveryCharges={deliveryCharges}
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              isSlotLoading={isSlotLoading}
              isSlotClosed={isSlotClosed}
            />

            <DeliveryInstructionsCard
              instructions={deliveryInstructions}
              setInstructions={setDeliveryInstructions}
            />

            <PrescriptionCard
              files={prescriptionFiles}
              setFiles={setPrescriptionFiles}
              isMandatory={isPrescriptionRequired}
            />
          </div>

          {/* Right Column: Pharmacy, Address, Coupons & Real-Time Bill Breakdown */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            <PharmacyInfoCard
              pharmacy={pharmacy}
              getMediaUrl={getMediaUrl}
              placeholderImage={PHARMACY_PLACEHOLDER}
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
              deliveryMode={deliveryMode}
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              onProceedCheckout={handleProceedToCheckout}
              checkingOut={checkingOut}
              calculating={calculatingBill}
              fallbackSubtotal={pharmacyCartTotal}
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
            if (showNotification) {
              showNotification(`Delivery address set to ${addr.city}.`, "success");
            }
          }}
        />
      )}

      {/* Coupons Selection Modal */}
      {isCouponModalOpen && (
        <Coupons
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          cartTotal={billSummary?.itemTotal || pharmacyCartTotal}
          appliedCoupon={appliedCoupon}
          pharmacyId={pharmacyId}
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