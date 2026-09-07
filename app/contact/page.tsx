"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 - 9599523434",
    href: "tel:+919599523434",
  },
  {
    icon: Mail,
    label: "Email",
    value: "scribbl3dofficial@gmail.com",
    href: "mailto:scribbl3dofficial@gmail.com",
  },
  {
    icon: MapPin,
    label: "Address",
    value:
      "Plot no. 685, Behind MCD Primary School, Saini Mohalla, Nangloi - 110041",
    href: "https://maps.app.goo.gl/h6uMQDsBXFQTtwYt6?g_st=iw",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon - Sat: 10:00 AM - 7:00 PM",
    href: null,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Phone: optional, but if filled must be 10 digits (Indian)
    if (formData.phone.trim()) {
      const digits = formData.phone.replace(/[\s\-+()]/g, "");
      // Allow 10-digit or country-code prefixed (e.g. 91XXXXXXXXXX)
      if (!/^\d{10}$/.test(digits) && !/^91\d{10}$/.test(digits)) {
        newErrors.phone = "Enter a valid 10-digit phone number";
      }
    }

    // Email: browser handles basic check via type="email" + required,
    // but add explicit check too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (res.ok) {
        toast({
          title: "Message Sent!",
          description:
            "Thank you for reaching out. We'll get back to you within 24 hours.",
        });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly via phone/email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-[80px]">
      {/* Hero Section */}
      <section className="relative w-full pt-8 pb-10 sm:pt-12 sm:pb-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1729] via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,_rgba(59,130,246,0.1),_transparent_70%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-blue-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="text-white font-extrabold text-[28px] sm:text-4xl lg:text-5xl tracking-tight leading-[1.15]">
            We&apos;d Love to Hear{" "}
            <span className="text-blue-400">From You</span>
          </h1>
          <p className="mt-3 text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Have a question about our 3D printers, resins, or custom printing
            services? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Contact Info Side */}
          <div className="lg:col-span-5">
            <h2 className="text-white font-semibold text-lg mb-4">
              Contact Information
            </h2>

            <div className="space-y-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/20 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all duration-300">
                      <Icon className="h-[18px] w-[18px] text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1">
                        {item.label}
                      </p>
                      <p className="text-[14px] text-gray-200 leading-relaxed break-words">
                        {item.value}
                      </p>
                    </div>
                    {item.href && (
                      <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors mt-1 flex-shrink-0" />
                    )}
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            {/* Map */}
            <div className="mt-4 rounded-xl overflow-hidden border border-white/[0.07] hover:border-white/10 transition-colors">
              <a
                href="https://maps.app.goo.gl/h6uMQDsBXFQTtwYt6?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83942620313!2d77.0688991053991!3d28.646677471842192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03f16cba9e61%3A0xdf0f2715fa434bee!2sNangloi!5e0!3m2!1sen!2sin!4v1638280991682!5m2!1sen!2sin"
                  width="100%"
                  height="180"
                  className="pointer-events-none"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Scribbl3D Location"
                />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 sm:p-8">
              <h2 className="text-white font-semibold text-lg mb-1">
                Send us a Message
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              <form action="#" method="POST" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-blue-500/50 focus-visible:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className={`h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-blue-500/50 focus-visible:ring-blue-500/20 rounded-lg ${errors.email ? "border-red-500/50" : ""}`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Phone
                    </label>
                    <Input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      maxLength={15}
                      className={`h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-blue-500/50 focus-visible:ring-blue-500/20 rounded-lg ${errors.phone ? "border-red-500/50" : ""}`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Printer inquiry"
                      required
                      className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-blue-500/50 focus-visible:ring-blue-500/20 rounded-lg"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                    rows={5}
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-blue-500/50 focus-visible:ring-blue-500/20 rounded-lg resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
