"use client";

import { VALUES } from "./constants";

export default function ValuesSection() {
    return (
        <section
            className="px-6 py-10 lg:py-16"
            style={{ background: "#F8FAFC" }}
        >
            <div className="max-w-[1240px] mx-auto">
                <h2
                    className="text-center font-['Inter'] mb-[32px] lg:mb-[48px]"
                    style={{
                        fontSize: "clamp(28px, 4vw, 36px)",
                        fontWeight: 900,
                        lineHeight: "40px",
                        letterSpacing: "0.37px",
                        color: "#101828",
                    }}
                >
                    The Values that Drive Us
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                    {VALUES.map((v) => (
                        <div
                            key={v.title}
                            className="bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            style={{
                                borderRadius: "24px",
                                border: "1px solid #F3F4F6",
                                padding: "40px 32px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div
                                className="flex items-center justify-center mb-[32px]"
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "16px",
                                    background: "#1D4ED8",
                                }}
                            >
                                <span className="flex items-center justify-center w-[28px] h-[28px] text-white [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                    {v.icon}
                                </span>
                            </div>

                            <h3
                                className="font-['Inter'] mb-[12px]"
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    lineHeight: "28px",
                                    letterSpacing: "-0.45px",
                                    color: "#101828",
                                }}
                            >
                                {v.title}
                            </h3>

                            <p
                                className="font-['Inter'] m-0"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 400,
                                    lineHeight: "26px",
                                    letterSpacing: "-0.31px",
                                    color: "#6A7282",
                                }}
                            >
                                {v.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
