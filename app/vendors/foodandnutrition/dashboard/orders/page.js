"use client";

import React, { useState, useEffect } from 'react';

// Mock Drivers List (Internal Fleet)
const DRIVERS_LIST = [
  { id: "DRV-01", name: "Suresh Kumar", phone: "+91 99887 76655", status: "Active" },
  { id: "DRV-02", name: "Rajesh Sharma", phone: "+91 98765 00112", status: "Active" },
  { id: "DRV-03", name: "Vikram Rathore", phone: "+91 88776 11223", status: "Active" },
  { id: "DRV-04", name: "Manpreet Singh", phone: "+91 77665 22334", status: "On Trip" }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-9481",
    customer: "Amit Verma",
    phone: "+91 98765 43210",
    address: "Flat 302, Green Glen Layout, Bellandur, Bengaluru - 560103",
    items: [
      { name: "Diabetic-Friendly Oats Meal Set", qty: 2, price: 180 },
      { name: "Sugar-Free Chia Seed Pudding", qty: 1, price: 120 }
    ],
    coupon: "DIABETES10",
    tax: 24,
    deliveryCharge: 40,
    packagingCharge: 15,
    grandTotal: 511,
    paymentMethod: "UPI (GPay)",
    paymentStatus: "Paid",
    status: "New",
    date: "12:40 PM",
    remainingSeconds: null,
    assignedDriver: null
  },
  {
    id: "ORD-9480",
    customer: "Priya Nair",
    phone: "+91 91234 56789",
    address: "Villa 14, Lotus Boulevard, Sector 150, Noida, UP - 201310",
    items: [
      { name: "Keto Garden Veg Salad Bowl", qty: 1, price: 220 },
      { name: "Sugar-Free Almond Cookies (Pack of 6)", qty: 2, price: 150 }
    ],
    coupon: "WELCOME50",
    tax: 26,
    deliveryCharge: 35,
    packagingCharge: 10,
    grandTotal: 541,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Preparing",
    date: "12:15 PM",
    remainingSeconds: null,
    assignedDriver: null
  },
  {
    id: "ORD-9475",
    customer: "Rohan Das",
    phone: "+91 88776 55443",
    address: "H-82, Second Floor, Sector 62, Noida, UP - 201301",
    items: [
      { name: "Gluten-Free Quinoa Biryani Set", qty: 1, price: 290 }
    ],
    coupon: "NONE",
    tax: 14.5,
    deliveryCharge: 40,
    packagingCharge: 15,
    grandTotal: 359.5,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Preparing",
    date: "11:30 AM",
    remainingSeconds: null,
    assignedDriver: null
  },
  {
    id: "ORD-9470",
    customer: "Siddharth Sen",
    phone: "+91 77665 44332",
    address: "Block B, Regency Crest, Whitefield, Bengaluru - 560066",
    items: [
      { name: "Low-Carb Cauliflower Fried Rice", qty: 1, price: 210 }
    ],
    coupon: "HEALTHY5",
    tax: 10.5,
    deliveryCharge: 40,
    packagingCharge: 15,
    grandTotal: 265,
    paymentMethod: "Net Banking",
    paymentStatus: "Paid",
    status: "Ready",
    date: "Yesterday, 08:15 PM",
    remainingSeconds: 12, // Initialized with 12s left to let you test the delay popup instantly on load
    assignedDriver: { id: "DRV-01", name: "Suresh Kumar", phone: "+91 99887 76655" }
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [viewMode, setViewMode] = useState('console'); // 'console' or 'history'
  const [historySubTab, setHistorySubTab] = useState('All'); // Sub-tab state for historical records
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for driver dispatch overlay/modal
  const [dispatchingOrder, setDispatchingOrder] = useState(null);
  // Stalled warning popup state
  const [stalledOrderAlert, setStalledOrderAlert] = useState(null);

  // Time formatter (Minutes : Seconds)
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds === 0) return 'Stalled (10m+ Limit)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`;
  };

  // Live Timer Countdown Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let alertTarget = null;

        const updated = prevOrders.map(order => {
          if (order.status === "Ready" && order.remainingSeconds !== null && order.remainingSeconds > 0) {
            const nextSecs = order.remainingSeconds - 1;
            
            // If timer just hit 0, mark as alert target
            if (nextSecs === 0) {
              alertTarget = order;
            }

            return { ...order, remainingSeconds: nextSecs };
          }
          return order;
        });

        if (alertTarget) {
          setStalledOrderAlert(alertTarget);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Transitions & state mutations
  const acceptAndPrepare = (id) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: "Preparing" } : order
    ));
  };

  const rejectOrder = (id) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: "Cancelled", assignedDriver: null, remainingSeconds: null } : order
    ));
  };

  // Triggers dispatch action
  const openDriverDispatch = (order) => {
    setDispatchingOrder(order);
  };

  const confirmDriverAssignment = (driver) => {
    if (!dispatchingOrder) return;

    setOrders(prev => prev.map(order => 
      order.id === dispatchingOrder.id 
        ? { 
            ...order, 
            status: "Ready", 
            remainingSeconds: 600, // Initialize with 10 minutes (600s)
            assignedDriver: { id: driver.id, name: driver.name, phone: driver.phone } 
          } 
        : order
    ));

    // Update opened modal selection if active
    if (selectedOrder && selectedOrder.id === dispatchingOrder.id) {
      setSelectedOrder(prev => ({
        ...prev,
        status: "Ready",
        remainingSeconds: 600,
        assignedDriver: { id: driver.id, name: driver.name, phone: driver.phone }
      }));
    }

    setDispatchingOrder(null);
  };

  const incomingOrders = orders.filter(o => o.status === "New");
  const preparingOrders = orders.filter(o => o.status === "Preparing" || o.status === "Accepted");
  
  // Entire history set filter matches
  const baseHistoryOrders = orders.filter(o => 
    ["Ready", "Picked Up", "Delivered", "Cancelled"].includes(o.status)
  );

  // Filter history by current active sub-tab selection
  const historyOrders = baseHistoryOrders.filter(o => 
    historySubTab === 'All' || o.status === historySubTab
  );

  // Counts specific to historical sub-tabs
  const getHistorySubTabCount = (status) => {
    if (status === 'All') return baseHistoryOrders.length;
    return baseHistoryOrders.filter(o => o.status === status).length;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto relative">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Station</h1>
          <p className="text-sm text-slate-500">Track incoming requests and assign your active drivers for dispatch.</p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('console')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 ${
                viewMode === 'console'
                  ? 'bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KitchenConsoleIcon className="w-4 h-4" />
              Kitchen Console
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                viewMode === 'console' ? 'bg-white text-[#3D3F96]' : 'bg-slate-200 text-slate-700'
              }`}>
                {incomingOrders.length + preparingOrders.length}
              </span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 ${
                viewMode === 'history'
                  ? 'bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              History & Driver Logs
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'console' ? (
        /* KITCHEN ACTIVE CONSOLE WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN 1: NEW INCOMING ORDERS */}
          <div className="bg-slate-100/50 rounded-2xl border border-slate-200/60 p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#3D3F96] animate-pulse" />
                <h2 className="font-bold text-slate-800 text-base">Incoming New Orders</h2>
              </div>
              <span className="px-2.5 py-0.5 bg-[#3D3F96]/10 text-[#3D3F96] rounded-full text-xs font-bold">
                {incomingOrders.length} Pending
              </span>
            </div>

            {incomingOrders.length > 0 ? (
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[600px] pr-1">
                {incomingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#3D3F96]/40 cursor-pointer shadow-sm transition-all duration-150 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-[#3D3F96] group-hover:underline text-base">{order.id}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Received at {order.date}</p>
                      </div>
                      <span className="text-base font-bold text-slate-900">₹{order.grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Ordered Items summary list */}
                    <div className="py-2.5 my-3 border-y border-slate-50 space-y-1 text-sm text-slate-700">
                      {order.items.map(item => (
                        <div key={item.name} className="flex justify-between font-semibold">
                          <span>{item.name}</span>
                          <span className="text-slate-500">x{item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs font-bold text-slate-500">Customer: {order.customer}</p>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {/* Reject Trigger */}
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="px-3.5 py-2 text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 font-bold text-xs rounded-lg transition-all"
                        >
                          Reject
                        </button>
                        {/* Accept Trigger */}
                        <button
                          onClick={() => acceptAndPrepare(order.id)}
                          className="px-4 py-2 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-lg transition-all"
                        >
                          Accept & Prep
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <SmileIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">No New Requests</p>
                <p className="text-xs text-slate-400">All orders have been processed.</p>
              </div>
            )}
          </div>

          {/* COLUMN 2: ACTIVE KITCHEN PREPARATION STATION */}
          <div className="bg-slate-100/50 rounded-2xl border border-slate-200/60 p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h2 className="font-bold text-slate-800 text-base">Preparing Station</h2>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                {preparingOrders.length} In Progress
              </span>
            </div>

            {preparingOrders.length > 0 ? (
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[600px] pr-1">
                {preparingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-400/40 cursor-pointer shadow-sm transition-all duration-150 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#3D3F96] group-hover:underline text-base">{order.id}</p>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded">
                            Preparing
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Kitchen prep stage</p>
                      </div>
                      <span className="text-base font-bold text-slate-900">₹{order.grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Items list */}
                    <div className="py-2.5 my-3 border-y border-slate-50 space-y-1 text-sm text-slate-700">
                      {order.items.map(item => (
                        <div key={item.name} className="flex justify-between font-semibold">
                          <span>{item.name}</span>
                          <span className="text-slate-500">x{item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs font-bold text-slate-500">To: {order.customer}</p>
                      
                      {/* Driver Assignment action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDriverDispatch(order);
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-emerald-500/10 flex items-center gap-1.5"
                      >
                        <DriverIcon className="w-4 h-4 stroke-[2]" />
                        Assign Driver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <ChefIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">Station is Clear</p>
                <p className="text-xs text-slate-400">Accept incoming requests to begin cooking.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* HISTORICAL DRIVER DISPATCH & HISTORY LOG */
        <div className="space-y-4">
          
          {/* Sub-tabs for History Log filtering */}
          <div className="bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60 flex items-center overflow-x-auto gap-1 no-scrollbar">
            {['All', 'Ready', 'Picked Up', 'Delivered', 'Cancelled'].map((tab) => {
              const isActive = historySubTab === tab;
              const displayName = tab === 'All' ? 'All History' : tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setHistorySubTab(tab)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#3D3F96] text-white shadow-lg shadow-[#3D3F96]/15'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <span>{displayName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-[#3D3F96]' 
                      : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {getHistorySubTabCount(tab)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {historyOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold bg-slate-50/70">
                      <th className="py-5 px-6">ID & Items</th>
                      <th className="py-5 px-6">Recipient Info</th>
                      <th className="py-5 px-6">Assigned Driver</th>
                      <th className="py-5 px-6">Grand Total</th>
                      {/* Added "Time Limit / Active Timer" Header Column */}
                      <th className="py-5 px-6">Time Limit</th>
                      <th className="py-5 px-6">Delivery Status</th>
                      <th className="py-5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {historyOrders.map((order) => {
                      const itemSummaryText = order.items.map(i => `${i.name} (x${i.qty})`).join(', ');
                      
                      // Identify if the order is stalled in Ready state for >10 mins
                      const isStalled = order.status === "Ready" && order.remainingSeconds !== null && order.remainingSeconds === 0;

                      return (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedOrder(order)}
                          className="hover:bg-[#3D3F96]/5 cursor-pointer transition-all duration-150 group"
                        >
                          <td className="py-5 px-6">
                            <p className="font-bold text-[#3D3F96] group-hover:underline">{order.id}</p>
                            <p className="text-xs font-normal text-slate-400 mt-1 truncate max-w-[240px]">{itemSummaryText}</p>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0">
                                {getInitials(order.customer)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 leading-tight">{order.customer}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{order.phone}</p>
                              </div>
                            </div>
                          </td>
                          {/* Assigned Driver columns */}
                          <td className="py-5 px-6">
                            {order.assignedDriver ? (
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                  <p className="font-semibold text-slate-800 leading-none">{order.assignedDriver.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">ID: {order.assignedDriver.id}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">No Driver (Cancelled)</span>
                            )}
                          </td>
                          <td className="py-5 px-6 font-bold text-slate-900 text-base">
                            ₹{order.grandTotal.toFixed(2)}
                          </td>
                          {/* Time Limit column mapping */}
                          <td className="py-5 px-6">
                            {order.status === "Ready" ? (
                              <div className="space-y-1">
                                <span className={`inline-flex px-2.5 py-1 rounded text-[11px] font-extrabold ${
                                  isStalled ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-100' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {formatTime(order.remainingSeconds)}
                                </span>
                                {isStalled && (
                                  <p className="text-[9px] text-rose-500 font-extrabold uppercase">Reassign Recommended</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-semibold text-xs">-</span>
                            )}
                          </td>
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                              order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Cancelled' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              {order.status}
                            </span>
                          </td>
                          {/* Dynamic Reassign Button */}
                          <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {order.status === "Ready" && (
                                <button
                                  onClick={() => openDriverDispatch(order)}
                                  className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
                                >
                                  {isStalled ? 'Reassign Now' : 'Reassign'}
                                </button>
                              )}
                              <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <EmptyBoxIcon className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-700">No Past Deliveries</p>
                <p className="text-sm text-slate-400 mt-1">Complete or active driver logs matching this filter will reside here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Dispatch Selection Overlay */}
      {dispatchingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Assign Fleet Courier</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a driver to dispatch order {dispatchingOrder.id}</p>
              </div>
              <button
                onClick={() => setDispatchingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Drivers list */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {DRIVERS_LIST.map((driver) => (
                <div 
                  key={driver.id}
                  onClick={() => confirmDriverAssignment(driver)}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#3D3F96]/40 cursor-pointer flex justify-between items-center transition-all duration-150 hover:bg-white"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{driver.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{driver.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#3D3F96] bg-[#3D3F96]/5 border border-[#3D3F96]/10 px-2.5 py-1 rounded-lg">
                      {driver.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OMNIPRESENT DRIVER DELAY WARNING MODAL POPUP */}
      {stalledOrderAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <WarningAlertIcon className="w-7 h-7 stroke-[2]" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Fulfillment Pickup Delay!</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{stalledOrderAlert.id}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Driver <strong className="text-slate-800 font-extrabold">{stalledOrderAlert.assignedDriver?.name}</strong> has not picked up this order within the 10-minute dispatch threshold. Payout and delivery guarantees are at risk.
                </p>
              </div>

              {/* Action Buttons inside popup */}
              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    // Open driver roster directly from popup
                    setDispatchingOrder(stalledOrderAlert);
                    setStalledOrderAlert(null);
                  }}
                  className="w-full py-3 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10 transition-all uppercase tracking-wider"
                >
                  Reassign Driver Now
                </button>
                <button
                  onClick={() => setStalledOrderAlert(null)}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                  Dismiss Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{selectedOrder.id}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Received {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Kitchen actions block */}
                {["New", "Preparing"].includes(selectedOrder.status) ? (
                  <div className="p-4 bg-[#3D3F96]/5 border border-[#3D3F96]/10 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kitchen Control Status Action</p>
                    <div className="flex items-center gap-3">
                      {selectedOrder.status === 'New' && (
                        <button
                          onClick={() => {
                            acceptAndPrepare(selectedOrder.id);
                            setSelectedOrder(null);
                          }}
                          className="px-4 py-2 bg-[#3D3F96] text-white font-bold text-xs rounded-lg hover:bg-[#3D3F96]/95 transition-all"
                        >
                          Accept Order & Start Prep
                        </button>
                      )}
                      {selectedOrder.status === 'Preparing' && (
                        <button
                          onClick={() => {
                            setDispatchingOrder(selectedOrder);
                          }}
                          className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-1"
                        >
                          <DriverIcon className="w-4 h-4 stroke-[2]" />
                          Assign Driver & Finish Prep
                        </button>
                      )}
                      <button
                        onClick={() => {
                          cancelOrder(selectedOrder.id);
                          setSelectedOrder(null);
                        }}
                        className="px-4 py-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-bold text-xs rounded-lg transition-all"
                      >
                        Reject & Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Driver Assignment Log</p>
                    {selectedOrder.assignedDriver ? (
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Dispatched to driver: <strong className="text-slate-900">{selectedOrder.assignedDriver.name}</strong> ({selectedOrder.assignedDriver.id})
                        </p>
                        {selectedOrder.status === "Ready" && (
                          <button
                            onClick={() => {
                              openDriverDispatch(selectedOrder);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
                          >
                            Reassign Driver
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">No active dispatch log associated with this state.</p>
                    )}
                  </div>
                )}

                {/* Ordered Items summary list */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                    {selectedOrder.items.map((item) => (
                      <div key={item.name} className="p-4 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-1">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">x{item.qty}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">₹{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</h3>
                    <p className="text-sm font-bold text-slate-800">{selectedOrder.customer}</p>
                    <p className="text-xs text-slate-500 mt-1">Phone: {selectedOrder.phone}</p>
                  </div>
                  <div className="p-4 border border-slate-100 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
                
                {/* Financial Summary */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Summary</h3>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Items Total</span>
                      <span className="font-semibold text-slate-800">
                        ₹{selectedOrder.items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coupon Discount</span>
                      <span className={`font-semibold ${selectedOrder.coupon !== 'NONE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {selectedOrder.coupon !== 'NONE' ? 'Active' : 'No Coupon'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Tax Charge</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Packaging Charge</span>
                      <span className="font-semibold text-slate-800">₹{selectedOrder.packagingCharge.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                      <span>Grand Total</span>
                      <span>₹{selectedOrder.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Payment Method:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Custom simple path-icon modules

function KitchenConsoleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function HistoryIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
    </svg>
  );
}

function EmptyBoxIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125 1.125-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CancelAlertIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function SmileIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
    </svg>
  );
}

// Chef icon
function ChefIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.3 16.24c-1.3-.41-2-.76-3.3-1.25m3.3 1.25l.8 3c.1.4.5.7.9.7H19c.6 0 1-.4 1-.9V15c0-1.5-1.5-2.5-3.5-2.5-2.5 0-4.5 1-4.5 3v1.25m3.3-1.25c.4.1.8.3 1.2.5M12 14.99c-1.3-.49-2-.84-3.3-1.25m0 0l-.8 3c-.1.4-.5.7-.9.7H3.5c-.6 0-1-.4-1-.9V15c0-1.5 1.5-2.5 3.5-2.5 2 0 3.1.7 3.5 1.8l2.2.82c1.4.52 2.5 1.45 2.5 2.92v1.21" />
    </svg>
  );
}

function DriverIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.105-9.4A1.125 1.125 0 014.473 7.5h11.22c.518 0 .961.35 1.077.854l1.245 5.42a1.125 1.125 0 01.32.73V18h-.375a1.5 1.5 0 01-3 0M15 18.75a1.5 1.5 0 00-3 0m3 0h3.75a1.125 1.125 0 001.12-1.243l-1.104-9.4a1.125 1.125 0 00-1.12-1.007H15V18" />
    </svg>
  );
}

function WarningAlertIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 15.002 2.285 12 3.75 9.75c1.12-1.722 2.646-3.155 4.5-4.148m11.303 13.5a11.97 11.97 0 01-13.803 0M12 18.75h.008v.008H12v-.008z" />
    </svg>
  );
}