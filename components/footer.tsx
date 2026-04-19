import { MapPin, Phone, Mail, Linkedin, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#0a0a0a] border-t border-white/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Main Footer Content */}
                <div className="py-8 sm:py-12 lg:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
                        {/* Company Info - 3 columns */}
                        <div className="sm:col-span-2 lg:col-span-3 space-y-4 sm:space-y-5">
                            <Link href="/" className="inline-block">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src="/logo.webp"
                                        alt="Scribbl3D Logo"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10"
                                    />
                                    <span className="text-xl font-bold text-white">
                                        Scribbl3D
                                    </span>
                                </div>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed pr-4">
                                Your trusted partner in 3D printing solutions. From printers to resins and custom prints, we bring your ideas to life.
                            </p>
                            
                            {/* Social Media */}
                            <div className="space-y-2.5 sm:space-y-3">
                                <h4 className="text-white text-sm font-semibold">
                                    Follow Us
                                </h4>
                                <div className="flex items-center gap-3">
                                    <a
                                        href="https://in.linkedin.com/company/scribbl3dprinting"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-[#0077B5]/10 hover:bg-[#0077B5] border border-[#0077B5]/30 hover:border-[#0077B5] rounded-lg flex items-center justify-center text-[#0077B5] hover:text-white transition-all duration-200"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/scribbl3d_/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-gradient-to-br from-[#f58529]/10 via-[#dd2a7b]/10 to-[#8134af]/10 hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] border border-[#dd2a7b]/30 hover:border-[#dd2a7b] rounded-lg flex items-center justify-center text-[#dd2a7b] hover:text-white transition-all duration-200"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="h-4 w-4" />
                                    </a>
                                    <a
                                        href="https://twitter.com/Scribbl3d_?t=0qa36squ-k_VP89FK9BSlw&s=09"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2] border border-[#1DA1F2]/30 hover:border-[#1DA1F2] rounded-lg flex items-center justify-center text-[#1DA1F2] hover:text-white transition-all duration-200"
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links & Products Combined */}
                        <div className="grid grid-cols-2 gap-6 sm:contents lg:contents">
                            {/* Quick Links - 2 columns */}
                            <div className="lg:col-span-2">
                                <h3 className="text-white text-sm font-semibold mb-3 sm:mb-4">
                                    Quick Links
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        { name: "Home", href: "/" },
                                        { name: "About Us", href: "/about" },
                                        { name: "Contact", href: "/contact" },
                                        { name: "Blog", href: "/blog" },
                                    ].map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-blue-400 text-sm hover:text-blue-300 transition-colors duration-200"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Products - 2 columns */}
                            <div className="lg:col-span-2">
                                <h3 className="text-white text-sm font-semibold mb-3 sm:mb-4">
                                    Products
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        { name: "3D Printers", href: "/printers" },
                                        { name: "Resins", href: "/resins" },
                                        { name: "Filaments", href: "/filaments" },
                                        { name: "Pre-built Models", href: "/prebuilt-products" },
                                    ].map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-blue-400 text-sm hover:text-blue-300 transition-colors duration-200"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Contact Info & Map - 5 columns */}
                        <div className="sm:col-span-2 lg:col-span-5 space-y-4 sm:space-y-5">
                            <div>
                                <h3 className="text-white text-sm font-semibold mb-3 sm:mb-4">
                                    Contact Us
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="tel:+919599523434"
                                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                                        >
                                            <Phone className="h-4 w-4" />
                                            <span className="text-sm">+91 - 9599523434</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="mailto:scribbl3dofficial@gmail.com"
                                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm break-all">scribbl3dofficial@gmail.com</span>
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 text-gray-400">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">
                                            Plot no. 685, Behind MCD Primary School, Saini Mohalla, Nangloi - 110041
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Google Maps */}
                            <div className="w-full h-[160px] sm:h-[180px] rounded-lg overflow-hidden border border-white/10">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83942620313!2d77.0688991053991!3d28.646677471842192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03f16cba9e61%3A0xdf0f2715fa434bee!2sNangloi!5e0!3m2!1sen!2sin!4v1638280991682!5m2!1sen!2sin"
                                    width="100%"
                                    height="160"
                                    className="sm:!h-[180px]"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps Location"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 py-6 pb-20 sm:py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                        {/* Policy Links */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 sm:gap-x-6 gap-y-2">
                            {[
                                { name: "Privacy Policy", href: "/privacy-policy" },
                                { name: "Terms & Conditions", href: "/terms-conditions" },
                                { name: "Refund Policy", href: "/refund-policy" },
                                { name: "Shipping Policy", href: "/return-policy" },
                            ].map((policy, index) => (
                                <div key={policy.name} className="flex items-center">
                                    <Link
                                        href={policy.href}
                                        className="text-blue-400/80 text-xs hover:text-blue-300 transition-colors duration-200"
                                    >
                                        {policy.name}
                                    </Link>
                                    {index < 3 && (
                                        <span className="text-gray-700 mx-3 hidden sm:inline">•</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Copyright */}
                        <p className="text-gray-500 text-xs text-center md:text-right">
                            © {new Date().getFullYear()} Scribbl3D, Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
