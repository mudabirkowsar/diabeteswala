"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  GlassWater, 
  Flame, 
  MapPin, 
  Clock, 
  Star, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import UserAPI from '../../../../services/UserAPI';

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_DRINK = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600";

export default function SmoothieDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [drink, setDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const getInitialCoords = () => {
    let lat = 30.698383813970036;
    let lng = 76.68573589283919;

    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("userCoords");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat !== undefined && parsed.lng !== undefined) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error("Error reading stored coordinates:", e);
        }
      }
    }
    return { lat, lng };
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const coords = getInitialCoords();
        const response = await UserAPI.getDrinkDetails(id, coords);
        if (response && response.success && response.data) {
          setDrink(response.data);
        } else {
          toast.error("Smoothie details not found.");
        }
      } catch (err) {
        console.error("Error retrieving drink details:", err);
        toast.error("Unable to load smoothie profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: drink?.name || 'Smoothie Details',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#3D3F96] border-t-transparent animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">
          Loading Smoothie Formulation...
        </p>
      </div>
    );
  }

  if (!drink) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <GlassWater className="w-16 h-16 text-slate-300 mb-3" />
        <h2 className="text-lg font-black text-slate-800">Drink Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">This health drink might be temporarily unavailable.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2.5 bg-[#3D3F96] text-white font-bold text-xs rounded-xl shadow-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const imagesList = Array.isArray(drink.images) && drink.images.length > 0 
    ? drink.images 
    : [PLACEHOLDER_DRINK];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 select-none">
      <Toaster position="top-center" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
          {drink.drinkType || "Smoothie Details"}
        </span>
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <Share2 size={18} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Gallery / Image Carousel */}
        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
          <img
            src={getMediaUrl(imagesList[activeImageIdx]) || PLACEHOLDER_DRINK}
            alt={drink.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_DRINK; }}
          />

          {/* Badges on Gallery */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black text-white shadow-md ${
              drink.dietType === 'Vegan' 
                ? 'bg-emerald-500' 
                : drink.dietType === 'Veg' 
                ? 'bg-green-500' 
                : 'bg-rose-500'
            }`}>
              {drink.dietType || "Vegan"}
            </span>

            {drink.isPopular && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md flex items-center gap-1">
                <Sparkles size={12} /> Popular
              </span>
            )}
          </div>

          {/* Carousel Arrows */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                {imagesList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImageIdx === idx ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Drink Overview Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-[#3D3F96] bg-[#3D3F96]/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {drink.foodEffectCategory || "General Health Focus"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {drink.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shrink-0">
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{drink.discountPrice || drink.price}
              </span>
              {drink.discountPrice && drink.price !== drink.discountPrice && (
                <span className="text-xs text-slate-400 line-through font-mono font-bold">
                  ₹{drink.price}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {drink.description}
          </p>
        </div>

        {/* Nutritional & Clinical Specs Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Nutritional & Clinical Profile
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</span>
              <p className="text-sm font-black text-[#3D3F96] mt-1 flex items-center justify-center gap-1">
                <Flame size={14} className="text-amber-500" /> {drink.calories} Kcal
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sugar</span>
              <p className="text-sm font-black text-amber-600 mt-1">
                {drink.sugar !== undefined ? `${drink.sugar}g` : "0g"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portion / Vol</span>
              <p className="text-sm font-black text-slate-700 mt-1">{drink.servingSize || "350ml"}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</span>
              <p className="text-sm font-black text-slate-700 mt-1 flex items-center justify-center gap-1">
                <Clock size={13} className="text-slate-400" /> {drink.prepTime || 10} Mins
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Ingredients Breakdown List */}
        {Array.isArray(drink.ingredients) && drink.ingredients.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Ingredients Formula ({drink.ingredients.length})
              </h3>
              <span className="text-[10px] font-black text-[#3D3F96] bg-[#3D3F96]/10 px-2.5 py-0.5 rounded-lg">
                Pure Formulation
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {drink.ingredients.map((ing, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#3D3F96]" />
                    <span className="font-bold text-slate-800">{ing.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                      {ing.quantity || "1 portion"}
                    </span>
                    {ing.calories !== undefined && (
                      <span className="font-mono font-bold text-amber-600 text-xs">
                        {ing.calories} Kcal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kitchen / Vendor Information */}
        {drink.vendorId && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Prepared By Kitchen
            </h3>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={getMediaUrl(drink.vendorId.profileImage) || PLACEHOLDER_DRINK}
                    alt={drink.vendorId.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER_DRINK; }}
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">{drink.vendorId.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-rose-500" />
                    {drink.vendorId.address || "Certified Kitchen Partner"}
                  </p>
                </div>
              </div>

              {drink.distanceText && (
                <span className="text-xs font-extrabold text-[#3D3F96] bg-[#3D3F96]/10 px-3 py-1.5 rounded-xl">
                  {drink.distanceText}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search & Health Tags */}
        {Array.isArray(drink.tags) && drink.tags.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Health & Diet Tags</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {drink.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-xl">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-6 py-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Final Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{drink.discountPrice || drink.price}
              </span>
              {drink.discountPrice && (
                <span className="text-xs text-slate-400 line-through font-mono font-bold">
                  ₹{drink.price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => toast.success(`${drink.name} added to cart!`)}
            className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#3D3F96]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <ShoppingBag size={16} />
            ORDER SMOOTHIE
          </button>
        </div>
      </div>

    </div>
  );
}