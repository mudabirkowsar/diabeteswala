'use client';

import React, { useState } from 'react';

const REVIEWS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Working Mom & Runner',
    location: 'Austin, TX',
    program: 'Heart Healthy Plan',
    rating: 5,
    highlight: '"Saved me at least 8 hours of cooking every single week."',
    quote:
      'Between work and managing the kids, healthy eating used to be impossible. These meals taste like a private chef made them, and my lab results at my last checkup were the best they’ve been in years.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
  {
    id: 2,
    name: 'David Miller',
    role: 'Retired Architect',
    location: 'Seattle, WA',
    program: 'Diabetic Friendly Plan',
    rating: 5,
    highlight: '"Consistent blood sugar and zero prep stress."',
    quote:
      'Having doctor-designed meals delivered chilled each week has completely transformed my daily routine. No guesswork with carb counting—just pop it in and enjoy authentic taste.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
  {
    id: 3,
    name: 'Elena Rostova',
    role: 'Fitness Enthusiast',
    location: 'Denver, CO',
    program: 'High Protein Plan',
    rating: 5,
    highlight: '"Restaurant quality clean food without the cleanup."',
    quote:
      'Most meal kits leave you with 5 pans to wash. Here, I get clean macro-balanced proteins and fresh veggies ready in 3 minutes. The Moroccan spiced salmon is unbeatable!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
];

export default function Testimonials() {
  const [activeStory, setActiveStory] = useState(0);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 mb-3">
            <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Real Stories, Real Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3d3f96] tracking-tight">
            What our community says about us
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Over 50,000+ healthy meals delivered with love, precision, and doctor-approved nutrition.
          </p>
        </div>

        {/* Featured Special Message Spotlight (Meals on Wheels & BistroMD Style) */}
        <div className="mb-14 bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3d3f96]/5 rounded-full blur-3xl -z-0 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Quote and Highlight */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#3d3f96] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Special Member Story
                </span>
                <span className="text-xs font-semibold text-red-500">
                  Verified Subscriber
                </span>
              </div>

              <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                “This service didn’t just change my diet—it gave me my evenings and energy back.”
              </blockquote>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                “When my mother needed strict low-sodium meals after her heart surgery, cooking separate dinners every night was wearing our family down. Having delicious, doctor-formulated meals delivered weekly took an enormous weight off our shoulders.”
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-12 h-12 rounded-full ring-2 ring-[#3d3f96] p-0.5 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    alt="Marcus Vance"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Marcus Vance & Family</h4>
                  <p className="text-xs text-slate-500">Caregiver & Member since 2023 • Chicago, IL</p>
                </div>
              </div>
            </div>

            {/* Impact Metric Box */}
            <div className="lg:col-span-4 bg-[#3d3f96] text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg">
              <div>
                <p className="text-xs uppercase font-bold text-red-300 tracking-wider">Verified Result</p>
                <h3 className="text-3xl font-black mt-2">120+ Hrs</h3>
                <p className="text-xs text-blue-100 mt-1">Saved on grocery shopping & prep time every year</p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs font-semibold">Quality Rating</span>
                <div className="flex text-red-400">
                  {'★★★★★'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3-Column Reviews Grid (Daily Harvest Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#3d3f96]/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Stars and Plan Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-red-500 text-sm">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#3d3f96]/10 text-[#3d3f96]">
                    {review.program}
                  </span>
                </div>

                {/* Highlight Title */}
                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#3d3f96] transition-colors">
                  {review.highlight}
                </h3>

                {/* Quote */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {review.quote}
                </p>
              </div>

              {/* User Meta */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate">{review.name}</p>
                    {review.verified && (
                      <span className="text-[#3d3f96]" title="Verified Buyer">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{review.role} • {review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA / Trust Banner */}
        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">
            Rated 4.9/5 stars by over 12,000+ happy eaters
          </p>
          <button className="px-8 py-3.5 bg-[#3d3f96] hover:bg-[#32347c] text-white font-bold rounded-xl shadow-lg shadow-[#3d3f96]/20 transition-all hover:scale-105 active:scale-95">
            Join Our Community & Order Today
          </button>
        </div>

      </div>
    </section>
  );
}