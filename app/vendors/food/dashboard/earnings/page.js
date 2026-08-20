"use client";

import React, { useState } from 'react';

// Linked bank details mock (Read-Only reference from Bank Details page)
const LINKED_BANK = {
  bankName: "ICICI Bank",
  accountNumber: "••••  ••••  7890",
  holderName: "FOOD VENDOR 1"
};

const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-79401",
    date: "14 Jun 2026",
    description: "Payout settled to Bank Account",
    type: "Debit", // Credit (Earnings) or Debit (Payouts)
    amount: 18500,
    status: "Completed" // "Completed", "Processing", "Failed"
  },
  {
    id: "TXN-79399",
    date: "12 Jun 2026",
    description: "Fulfillment Payout: Order #ORD-9481",
    type: "Credit",
    amount: 405.80,
    status: "Completed"
  },
  {
    id: "TXN-79395",
    date: "10 Jun 2026",
    description: "Weekly Subscription Tiffin Settlement",
    type: "Credit",
    amount: 12450.00,
    status: "Completed"
  },
  {
    id: "TXN-79380",
    date: "08 Jun 2026",
    description: "Platform Fee Commission Deduction",
    type: "Debit",
    amount: 622.50,
    status: "Completed"
  }
];

export default function WalletEarningsPage() {
  const [walletBalance, setWalletBalance] = useState(24850.00);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Withdrawal Submission
  const handleWithdrawalRequest = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (amountNum > walletBalance) {
      alert("Insufficient wallet balance.");
      return;
    }

    setIsProcessing(true);

    // Simulate Network delay
    setTimeout(() => {
      // Deduct balance
      setWalletBalance(prev => prev - amountNum);

      // Append Transaction
      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        date: "Today, Just Now",
        description: "Payout request submitted to Bank",
        type: "Debit",
        amount: amountNum,
        status: "Processing"
      };
      setTransactions([newTxn, ...transactions]);

      // Reset & Close
      setWithdrawAmount('');
      setIsProcessing(false);
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in py-4 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Wallet & Earnings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit detailed ledgers, track total cashflow accomplishments, and request instant bank payouts.</p>
        </div>

        {/* Request Payout CTA */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <PayoutIcon className="w-4 h-4 stroke-[2.5]" />
          Request Wallet Withdrawal
        </button>
      </div>

      {/* Financial Wallet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Current Available Balance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Wallet Balance</span>
            <p className="text-2xl sm:text-3xl font-black text-[#3D3F96] font-mono">₹{walletBalance.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Instantly withdrawable to bank</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center flex-shrink-0">
            <WalletIcon className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Total Accumulated Earnings Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifetime Gross Earnings</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">₹3,42,800.00</p>
            <p className="text-[10px] text-slate-400 font-semibold">Cumulative lifetime income</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <EarningsIcon className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Last Settled Payout Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Settled Payout</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">₹18,500.00</p>
            <p className="text-[10px] text-slate-400 font-semibold">Dispatched on June 14, 2026</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <BankIcon className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

      </div>

      {/* Wallet Ledger / Transactions History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">Wallet Ledger Statement</h2>
          <p className="text-xs text-slate-400 mt-1">Timeline of completed orders, recurring payouts, and withdrawals.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                <th className="py-5 px-6">Transaction ID</th>
                <th className="py-5 px-6">Date</th>
                <th className="py-5 px-6">Statement Description</th>
                <th className="py-5 px-6">Type</th>
                <th className="py-5 px-6">Amount</th>
                <th className="py-5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#3D3F96]/5 transition-all duration-150">
                  {/* Transaction ID */}
                  <td className="py-5 px-6 font-bold text-slate-500">{txn.id}</td>
                  {/* Date */}
                  <td className="py-5 px-6 text-slate-400 font-semibold text-xs">{txn.date}</td>
                  {/* Description */}
                  <td className="py-5 px-6 font-semibold text-slate-800">{txn.description}</td>
                  {/* Credit or Debit Type pill */}
                  <td className="py-5 px-6">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                      txn.type === 'Debit'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {txn.type === 'Debit' ? 'Debit / Out' : 'Credit / In'}
                    </span>
                  </td>
                  {/* Financial Amount */}
                  <td className={`py-5 px-6 font-bold text-sm font-mono ${
                    txn.type === 'Debit' ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {txn.type === 'Debit' ? '-' : '+'}$ {txn.amount.toFixed(2)}
                  </td>
                  {/* Settlement Status */}
                  <td className="py-5 px-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      txn.status === 'Completed'
                        ? 'text-emerald-600 border-emerald-100 bg-emerald-50'
                        : 'text-amber-600 border-amber-100 bg-amber-50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Processing' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL PAYOUT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10">
                  <PayoutIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg uppercase tracking-tight">Request Payout</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Withdraw earnings to your linked bank</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleWithdrawalRequest} className="space-y-5">
              
              {/* Pre-populated Bank Details Info Card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Routing Destination Bank</span>
                  <span className="text-slate-800 font-bold uppercase">{LINKED_BANK.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number Reference</span>
                  <span className="text-slate-800 font-bold">{LINKED_BANK.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered Holder</span>
                  <span className="text-slate-800 font-bold uppercase">{LINKED_BANK.holderName}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max={walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max ready: ₹${walletBalance}`}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Payout...' : 'Submit Withdrawal Request'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function WalletIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3" />
    </svg>
  );
}

function EarningsIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M4.5 19.25V6.25m15 13V6.25M7.5 11.25h9" />
    </svg>
  );
}

function BankIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10m0 0a3 3 0 10-3-3m3 3a3 3 0 113-3m-9 13h12a2 2 0 002-2V10a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
    </svg>
  );
}

function PayoutIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-3 3m0 0l-3-3m3 3V9m0-6H7.5a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V15" />
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