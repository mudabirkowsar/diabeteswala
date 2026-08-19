"use client";

import React, { useState } from 'react';

const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-8041",
    customer: "Amit Verma",
    type: "Subscription", // "Subscription", "Renewal", "Refund"
    plan: "1 Meal Anytime Plan",
    date: "12 Mar 2026",
    method: "UPI (PhonePe)",
    amount: 1800,
    status: "Settled" // "Settled", "Processing", "Refunded"
  },
  {
    id: "TXN-8039",
    customer: "Priya Nair",
    type: "Renewal",
    plan: "Full Day Diet Plan",
    date: "05 Mar 2026",
    method: "Credit Card",
    amount: 4900,
    status: "Settled"
  },
  {
    id: "TXN-8025",
    customer: "Rohan Das",
    type: "Refund",
    plan: "Low-GI Weekly Lunch Starter",
    date: "28 Feb 2026",
    method: "Bank Transfer",
    amount: 1100,
    status: "Refunded"
  },
  {
    id: "TXN-8012",
    customer: "Anjali Gupta",
    type: "Subscription",
    plan: "2 Meals Daily Combo",
    date: "22 Feb 2026",
    method: "UPI (GPay)",
    amount: 3400,
    status: "Processing"
  }
];

export default function TiffinPayments() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Quick Action: Process Refund
  const handleRefund = (id) => {
    setTransactions(prev => prev.map(txn => {
      if (txn.id === id) {
        return { ...txn, status: "Refunded", type: "Refund" };
      }
      return txn;
    }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Status-badge styling maps
  const statusStyles = {
    Settled: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Processing: 'bg-amber-50 text-amber-700 border-amber-100',
    Refunded: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Payments & Refunds</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Audit subscription cashflows, upcoming automated renewals, and manage customer refunds.</p>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Payout Received</span>
            <p className="text-2xl font-black text-slate-900">₹1,10,100</p>
            <p className="text-[10px] text-slate-400 font-semibold">Total settled funds in bank</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            ₹
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Renewals</span>
            <p className="text-2xl font-black text-slate-900">14 Invoices</p>
            <p className="text-[10px] text-slate-400 font-semibold">Weekly/Monthly auto-debit cycles</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center flex-shrink-0">
            ↻
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refunds Issued</span>
            <p className="text-2xl font-black text-slate-900">₹4,200</p>
            <p className="text-[10px] text-slate-400 font-semibold">Total meal skip adjustments paid</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            ↺
          </div>
        </div>
      </div>

      {/* Transactions Directory Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                <th className="py-5 px-6">Transaction ID</th>
                <th className="py-5 px-6">Subscriber</th>
                <th className="py-5 px-6">Type</th>
                <th className="py-5 px-6">Date</th>
                <th className="py-5 px-6">Method</th>
                <th className="py-5 px-6">Amount</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#3D3F96]/5 transition-all duration-150">
                  
                  {/* ID */}
                  <td className="py-5 px-6 font-bold text-slate-500">{txn.id}</td>

                  {/* Subscriber info */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0">
                        {getInitials(txn.customer)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 leading-tight">{txn.customer}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">{txn.plan}</p>
                      </div>
                    </div>
                  </td>

                  {/* Transaction Type */}
                  <td className="py-5 px-6">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                      txn.type === 'Refund'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : txn.type === 'Renewal'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : 'bg-[#3D3F96]/5 text-[#3D3F96] border-[#3D3F96]/10'
                    }`}>
                      {txn.type}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-5 px-6 text-slate-500 font-bold text-xs">{txn.date}</td>

                  {/* Method */}
                  <td className="py-5 px-6 text-slate-500 font-semibold text-xs">{txn.method}</td>

                  {/* Amount */}
                  <td className="py-5 px-6 font-bold text-slate-900 text-base">₹{txn.amount.toFixed(2)}</td>

                  {/* Status badge */}
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusStyles[txn.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Processing' ? 'bg-amber-500 animate-pulse' : txn.status === 'Settled' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {txn.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-5 px-6 text-right">
                    {txn.status === 'Settled' ? (
                      <button
                        onClick={() => handleRefund(txn.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">-</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}