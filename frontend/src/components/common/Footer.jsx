import React from 'react';
import { UtensilsCrossed, Clock, MapPin, ShieldCheck, Phone, Mail, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Customer Portal Footer
 * Styled with warm cream, olive green, saffron gold, and dark brown.
 * Incorporates verified contact details for OfficeBite corporate canteen.
 */
export const Footer = () => {
  return (
    <footer className="bg-[#FAF6EE] border-t border-[#EAE3D6] mt-24 pt-16 pb-10 text-[#261C14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#EAE3D6]">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3D5A2B] to-[#507538] text-white flex items-center justify-center shadow-md shadow-[#3D5A2B]/15">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-black text-2xl text-[#261C14] tracking-tight">
                  Office<span className="text-[#3D5A2B]">Bite</span>
                </span>
                <span className="block text-[10px] text-[#D48B18] font-bold tracking-widest uppercase">
                  Royal Dining Experience
                </span>
              </div>
            </div>
            <p className="text-xs text-[#73675C] leading-relaxed">
              Wholesome, chef-curated meals crafted exclusively for employees. Skip the long lunch counter lines with digital ordering and desk deliveries.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3D5A2B] bg-[#EEF3E8] border border-[#D4E0C9] px-3.5 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-[#3D5A2B]" />
              <span>FSSAI Certified Corporate Kitchen</span>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#261C14] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D48B18]" />
              <span>Canteen Operating Hours</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#73675C]">
              <li className="flex justify-between pb-1.5 border-b border-[#EAE3D6]/60">
                <span className="font-semibold text-[#261C14]">Breakfast & Dosa:</span>
                <span>8:00 AM – 11:00 AM</span>
              </li>
              <li className="flex justify-between pb-1.5 border-b border-[#EAE3D6]/60">
                <span className="font-semibold text-[#261C14]">Lunch & Thalis:</span>
                <span>12:00 PM – 3:30 PM</span>
              </li>
              <li className="flex justify-between pb-1.5 border-b border-[#EAE3D6]/60">
                <span className="font-semibold text-[#261C14]">Snacks & Filter Coffee:</span>
                <span>4:00 PM – 7:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold text-[#261C14]">Dinner Service:</span>
                <span>7:30 PM – 9:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Canteen Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#261C14] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3D5A2B]" />
              <span>Location & Counters</span>
            </h4>
            <div className="space-y-2.5 text-xs text-[#73675C]">
              <div className="bg-white p-3 rounded-2xl border border-[#EAE3D6] shadow-2xs">
                <p className="font-bold text-[#261C14] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3D5A2B]" />
                  Central Food Court (Floor 3)
                </p>
                <p className="text-[11px] text-[#73675C] mt-1">
                  Krishnagiri Dt, TamilNadu-635104
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#EAE3D6] shadow-2xs">
                <p className="font-bold text-[#261C14] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D48B18]" />
                  Express Counter & Beverages
                </p>
                <p className="text-[11px] text-[#73675C] mt-1">Atrium Block B • Quick Token Dispatch</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#261C14] uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#3D5A2B]" />
              <span>Contact & Helpdesk</span>
            </h4>
            <p className="text-xs text-[#73675C] leading-relaxed">
              Dietary requirements, party catering, or canteen feedback? Get in touch with our team directly.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <a
                href="mailto:nithishganesh1710@gmail.com"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EAE3D6] text-[#261C14] hover:text-[#3D5A2B] hover:border-[#3D5A2B] transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center shrink-0 group-hover:bg-[#3D5A2B] group-hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold truncate">nithishganesh1710@gmail.com</span>
              </a>

              <a
                href="tel:9363584566"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EAE3D6] text-[#261C14] hover:text-[#3D5A2B] hover:border-[#3D5A2B] transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center shrink-0 group-hover:bg-[#3D5A2B] group-hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">9363584566</span>
              </a>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-[#EAE3D6] text-[#261C14] shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-[#FDF5E6] text-[#D48B18] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium leading-tight">
                  Krishnagiri Dt, TamilNadu-635104
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#73675C]">
          <p>© {new Date().getFullYear()} OfficeBite — Inspired by Kanigiri Royal Flavors. All rights reserved.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/" className="hover:text-[#3D5A2B] transition-colors">Home</Link>
            <Link to="/menu" className="hover:text-[#3D5A2B] transition-colors">Royal Menu</Link>
            <Link to="/orders" className="hover:text-[#3D5A2B] transition-colors">My Orders</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
