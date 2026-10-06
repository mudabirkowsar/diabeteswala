import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import { CheckCircle2, Wallet, Users } from 'lucide-react';

function Footer() {
  const footerSections = [
    {
      title: "SHOP PRODUCTS",
      links: ["Food Category", "Food Shops", "Meal Type", "Medicine Shop", "Medicine Products", "Medicines", "Lab Tests"]
    },
    {
      title: "BLOG",
      links: ["Doctor Tips", "Mind & Body", "Monitoring", "Food Lab", "Recipes", "Food & Nutrition"]
    },
    {
      title: "QUICK LINKS",
      links: ["About Us", "Privacy Policy", "Terms & Conditions", "Contact Us"]
    }
  ];

  const socialIcons = [
    { Icon: FaFacebookF, href: "#" },
    { Icon: FaInstagram, href: "#" },
    { Icon: FaXTwitter, href: "#" },
    { Icon: FaYoutube, href: "#" },
    { Icon: FaLinkedinIn, href: "#" },
  ];

  return (
    <footer className="bg-[#3d3f96] text-white pt-10 md:pt-16 pb-8 md:pb-10 px-4 sm:px-6 md:px-12 antialiased select-none">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- TOP SECTION: LINKS & INFO --- */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-10 md:mb-16">
          
          {/* Dynamic Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
                {section.title}
              </h3>
              <ul className="mt-3 sm:mt-6 space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-200 hover:text-white transition-colors text-xs sm:text-sm block py-0.5">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect With Us Section */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
              CONNECT WITH US
            </h3>
            <p className="mt-3 sm:mt-6 text-xs sm:text-sm text-gray-200 mb-4 sm:mb-5 leading-relaxed">
              Stay updated with our latest news and offers.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socialIcons.map((item, index) => (
                <a 
                  key={index} 
                  href={item.href} 
                  className="bg-[#5255a5] p-2 sm:p-2.5 rounded-md hover:bg-[#6367c0] transition-all hover:-translate-y-1 active:scale-95"
                >
                  <item.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Download App Section */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-bold text-xs sm:text-base md:text-lg mb-1 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
              DOWNLOAD APP
            </h3>
            <div className="mt-3 sm:mt-6 flex flex-row sm:flex-col gap-3">
              <Link href="#" className="block w-32 sm:w-40 hover:opacity-80 transition-opacity">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play" 
                  className="w-full h-auto rounded-md sm:rounded-lg border border-white/20"
                />
              </Link>
              <Link href="#" className="block w-32 sm:w-40 hover:opacity-80 transition-opacity">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="w-full h-auto rounded-md sm:rounded-lg border border-white/20"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: FEATURE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3.5 sm:gap-5 shadow-lg">
            <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[#3d3f96] flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-xl leading-tight">Default Heading</h4>
              <p className="text-xs sm:text-sm text-gray-200 mt-0.5 sm:mt-1">Default content description goes here.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3.5 sm:gap-5 shadow-lg">
            <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[#3d3f96] flex-shrink-0">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-xl leading-tight">Default Heading</h4>
              <p className="text-xs sm:text-sm text-gray-200 mt-0.5 sm:mt-1">Default content description goes here.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3.5 sm:gap-5 shadow-lg">
            <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[#3d3f96] flex-shrink-0">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-xl leading-tight">Default Heading</h4>
              <p className="text-xs sm:text-sm text-gray-200 mt-0.5 sm:mt-1">Default content description goes here.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;