"use client";
import React from 'react';
import { Plus, Star, Info, AlertCircle, Pill, ShieldCheck } from 'lucide-react';

const AllMedicines = ({ pharmacyId, searchQuery }) => {
  // Enhanced Dummy Data for Products with Clinical Details
  const products = [
    { 
      id: 1, 
      pharmacyId: 1, 
      name: "Metformin 500mg", 
      brand: "Glycomet", 
      activeIngredient: "Metformin Hydrochloride IP",
      form: "Sustained Release Tablet",
      packSize: "Strip of 15 Tablets",
      price: "₹145", 
      oldPrice: "₹180",
      discount: "19% OFF",
      rating: 4.8, 
      rx: true, 
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      id: 2, 
      pharmacyId: 1, 
      name: "Voglibose 0.3mg", 
      brand: "Voglistar", 
      activeIngredient: "Voglibose IP",
      form: "Orally Disintegrating Tablet",
      packSize: "Strip of 10 Tablets",
      price: "₹210", 
      oldPrice: "₹260",
      discount: "19% OFF",
      rating: 4.7, 
      rx: true, 
      img: "https://images.unsplash.com/photo-1603398938378-e54eab446f91?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      id: 3, 
      pharmacyId: 2, 
      name: "Insulin Glargine 100 IU/ml", 
      brand: "Lantus", 
      activeIngredient: "Insulin Glargine rDNA Origin",
      form: "Pre-filled Pen",
      packSize: "1 Pen of 3ml",
      price: "₹650", 
      oldPrice: "₹800",
      discount: "18% OFF",
      rating: 4.9, 
      rx: true, 
      img: "https://images.unsplash.com/photo-1579154235828-ac51edfb3983?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      id: 4, 
      pharmacyId: 3, 
      name: "Accu-Chek Test Strips", 
      brand: "Roche", 
      activeIngredient: "Blood Glucose Test Strips",
      form: "Diagnostic Strips",
      packSize: "Box of 50 Strips",
      price: "₹975", 
      oldPrice: "₹1150",
      discount: "15% OFF",
      rating: 4.6, 
      rx: false, 
      img: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      id: 5, 
      pharmacyId: 4, 
      name: "Sugar-Free Multi", 
      brand: "NutriCare", 
      activeIngredient: "Multivitamins & Antioxidants",
      form: "Softgel Capsule",
      packSize: "Bottle of 30 Capsules",
      price: "₹450", 
      oldPrice: "₹550",
      discount: "18% OFF",
      rating: 4.5, 
      rx: false, 
      img: "https://images.unsplash.com/photo-1550573105-05867a0da714?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      id: 6, 
      pharmacyId: 2, 
      name: "Dapagliflozin 10", 
      brand: "Forxiga", 
      activeIngredient: "Dapagliflozin Propanediol Monohydrate",
      form: "Film-Coated Tablet",
      packSize: "Strip of 14 Tablets",
      price: "₹580", 
      oldPrice: "₹700",
      discount: "17% OFF",
      rating: 4.7, 
      rx: true, 
      img: "https://images.unsplash.com/photo-1584017945516-30751f77a81b?q=80&w=400&auto=format&fit=crop" 
    }
  ];

  // Filtering Logic
  const filtered = products.filter(p => {
    const matchesPharmacy = pharmacyId ? p.pharmacyId === pharmacyId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPharmacy && matchesSearch;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {filtered.length > 0 ? (
        filtered.map((product) => (
          <div key={product.id} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 p-1.5 sm:p-2 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between overflow-hidden">
            <div>
              {/* Product Image Area */}
              <div className="relative h-36 sm:h-52 rounded-[1rem] sm:rounded-[2rem] overflow-hidden bg-slate-50">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                
                {product.rx && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg flex items-center gap-1">
                    <AlertCircle size={8} className="sm:w-2.5 sm:h-2.5" /> RX REQUIRED
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1 shadow-sm border border-slate-100">
                  <Star size={10} className="fill-yellow-400 text-yellow-400 sm:w-3 sm:h-3" />
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-700">{product.rating}</span>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-3 sm:p-5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{product.brand}</p>
                  <span className="text-[8px] sm:text-[9px] font-bold text-[#3d3f96] bg-indigo-50/60 px-1.5 py-0.5 rounded-md shrink-0">{product.form}</span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-800 mt-1 sm:mt-1.5 group-hover:text-[#3d3f96] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                
                <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium mt-1 truncate">
                  Active: {product.activeIngredient}
                </p>
                <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-0.5">
                  Pack: {product.packSize}
                </p>
              </div>
            </div>

            {/* Price & Action Section at Bottom */}
            <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0 mt-auto">
              <div className="border-t border-slate-50 pt-3">
                
                {/* Pricing Block */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-xl font-black text-slate-900 leading-none">{product.price}</span>
                      {product.oldPrice && (
                        <span className="text-[9px] sm:text-[11px] text-slate-400 line-through font-bold">{product.oldPrice}</span>
                      )}
                    </div>
                  </div>
                  {product.discount && (
                    <span className="text-[8px] sm:text-[10px] bg-red-50 text-red-500 font-extrabold px-1.5 py-0.5 rounded-md">
                      {product.discount}
                    </span>
                  )}
                </div>

                {/* View Details Linear Gradient Button */}
                <button className="mt-4 w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4d9e] text-white text-[10px] sm:text-xs font-bold rounded-xl sm:rounded-2xl shadow-md shadow-indigo-100/50 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <Info size={14} className="sm:w-3.5 sm:h-3.5" /> 
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100">
          <Pill size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">No medicines found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AllMedicines;