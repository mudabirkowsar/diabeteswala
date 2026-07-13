import React from 'react';
import Link from 'next/link';
// Social Icons from React Icons (More reliable for brand logos)
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
// UI Icons from Lucide
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
    <footer className="bg-[#3d3f96] text-white pt-16 pb-10 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- TOP SECTION: LINKS & INFO --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Dynamic Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-2 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
                {section.title}
              </h3>
              <ul className="mt-6 space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect With Us Section */}
          <div>
            <h3 className="font-bold text-lg mb-2 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
              CONNECT WITH US
            </h3>
            <p className="mt-6 text-sm text-gray-200 mb-5 leading-relaxed">
              Stay updated with our latest news and offers.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialIcons.map((item, index) => (
                <a 
                  key={index} 
                  href={item.href} 
                  className="bg-[#5255a5] p-2.5 rounded-md hover:bg-[#6367c0] transition-all hover:-translate-y-1"
                >
                  <item.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Download App Section */}
          <div>
            <h3 className="font-bold text-lg mb-2 inline-block border-b-2 border-white/50 pb-1 tracking-wide">
              DOWNLOAD APP
            </h3>
            <div className="mt-6 space-y-4">
              <Link href="#" className="block w-40 hover:opacity-80 transition-opacity">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play" 
                  className="w-full h-auto rounded-lg border border-white/20"
                />
              </Link>
              <Link href="#" className="block w-40 hover:opacity-80 transition-opacity">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="w-full h-auto rounded-lg border border-white/20"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: FEATURE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
            <div className="bg-white p-3 rounded-xl text-[#3d3f96] flex-shrink-0">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-xl leading-tight">Default Heading</h4>
              <p className="text-sm text-gray-200 mt-1">Default content description goes here.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
            <div className="bg-white p-3 rounded-xl text-[#3d3f96] flex-shrink-0">
              <Wallet size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-xl leading-tight">Default Heading</h4>
              <p className="text-sm text-gray-200 mt-1">Default content description goes here.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#4d50a3] border border-white/10 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
            <div className="bg-white p-3 rounded-xl text-[#3d3f96] flex-shrink-0">
              <Users size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-xl leading-tight">Default Heading</h4>
              <p className="text-sm text-gray-200 mt-1">Default content description goes here.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;