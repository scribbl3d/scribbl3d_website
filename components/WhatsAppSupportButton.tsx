"use client";

interface WhatsAppSupportButtonProps {
    phoneNumber: string;
    message?: string;
}

export default function WhatsAppSupportButton({
    phoneNumber,
    message = "Hello Scribbl3d Support,\nI'm reaching out for assistance and more information about your products and services. Could you please help?\nThank you!",
}: WhatsAppSupportButtonProps) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
        >
            {/* ── MOBILE: icon-only circle ── */}
            <span
                className="
          fixed bottom-5 right-5 z-50
          flex sm:hidden
          items-center justify-center
          w-11 h-11 rounded-full
          bg-[#0d1b2a]
          border border-white/10
          shadow-[0_4px_20px_rgba(0,0,0,0.5)]
          hover:shadow-[0_4px_24px_rgba(37,211,102,0.3)]
          hover:border-[#25D366]/40
          transition-all duration-300
          active:scale-95
        "
            >
                {/* Official WhatsApp icon */}
                <img
                    src="https://cdn.simpleicons.org/whatsapp/25D366"
                    alt="WhatsApp"
                    width={22}
                    height={22}
                />

                {/* Live dot */}
                <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                </span>
            </span>

            {/* ── DESKTOP: full pill ── */}
            <span
                className="
          fixed bottom-6 right-6 z-50
          hidden sm:flex
          items-center gap-3
          bg-[#0d1b2a]
          pl-4 pr-5 py-[11px]
          rounded-full
          border border-white/10
          shadow-[0_4px_24px_rgba(0,0,0,0.45)]
          hover:shadow-[0_4px_28px_rgba(37,211,102,0.2)]
          hover:border-[#25D366]/35
          transition-all duration-300
          hover:scale-[1.03] active:scale-95
        "
            >
                {/* Official WhatsApp icon */}
                <img
                    src="https://cdn.simpleicons.org/whatsapp/25D366"
                    alt="WhatsApp"
                    width={22}
                    height={22}
                    className="flex-shrink-0"
                />

                {/* Divider */}
                <span className="w-px h-6 bg-white/10 flex-shrink-0" />

                {/* Text */}
                <span className="flex flex-col items-start justify-center leading-none gap-[4px]">
                    <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/45 leading-none">
                        Need help?
                    </span>
                    <span className="text-[13px] font-semibold text-white tracking-tight leading-none">
                        Chat with us
                    </span>
                </span>

                {/* Live dot */}
                <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                </span>
            </span>
        </a>
    );
}
