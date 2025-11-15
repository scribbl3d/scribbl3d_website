import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] py-8 sm:py-[60px] flex flex-col items-center">
      <div className="w-full max-w-[1000px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-start space-y-4">
            <h3 className="text-white text-lg font-semibold">Contact Us</h3>
            <a
              href="tel:+919599523434"
              className="text-[#B5B5B5] text-base font-medium hover:text-white transition-colors flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              +91 - 9599523434
            </a>
            <div className="text-[#999999] text-base font-medium max-w-[366px] flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <p>
                Plot no. 685, Behind MCD Primary School, Saini Mohalla, Nangloi
                - 110041
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4">
            <h3 className="text-white text-lg font-semibold">Social</h3>
            {[
              {
                name: "LinkedIn",
                href: "https://in.linkedin.com/company/scribbl3dprinting",
              },
              {
                name: "Instagram",
                href: "https://www.instagram.com/scribbl3d_/",
              },
              {
                name: "Twitter",
                href: "https://twitter.com/Scribbl3d_?t=0qa36squ-k_VP89FK9BSlw&s=09",
              },
              { name: "About Us", href: "/about" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#0099FF] text-base font-medium hover:text-[#CCCCCC] transition-colors duration-300 active:scale-95"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="w-full h-[154px] rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83942620313!2d77.0688991053991!3d28.646677471842192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03f16cba9e61%3A0xdf0f2715fa434bee!2sNangloi!5e0!3m2!1sen!2sin!4v1638280991682!5m2!1sen!2sin"
              width="100%"
              height="154"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>

        <div className="w-full pt-4 pb-4 border-t border-[rgba(255,255,255,0.2)]">
          <div className="w-full flex flex-col items-center mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-center">
              {[
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms & Conditions", href: "/terms-conditions" },
                { name: "Refund & Cancellation", href: "/refund-policy" },
                { name: "Return & Shipping", href: "/return-policy" },
              ].map((policy) => (
                <Link
                  key={policy.name}
                  href={policy.href}
                  className="text-white text-sm font-medium hover:text-[#CCCCCC] transition-colors duration-300 active:scale-95"
                >
                  {policy.name}
                </Link>
              ))}
            </div>
            <div className="w-full border-b border-[rgba(255,255,255,0.2)]"></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[#999999] text-sm font-medium">
              © 2025 Scribbl3D, Inc.
            </p>
            <p className="text-[#969696] text-sm font-medium">
              <a
                href="https://dhruvpaul.framer.website/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-300 active:scale-95"
              >
                Designed by Paul
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
