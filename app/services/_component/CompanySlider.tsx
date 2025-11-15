"use client";

import type React from "react";
import Image from "next/image";

const CompanySlider: React.FC = () => {
  const companies = [
    { src: "/services/company_logo_slider/1.png", alt: "Company 1" },
    { src: "/services/company_logo_slider/2.png", alt: "Company 2" },
    { src: "/services/company_logo_slider/3.png", alt: "Company 3" },
    { src: "/services/company_logo_slider/4.png", alt: "Company 4" },
    { src: "/services/company_logo_slider/5.png", alt: "Company 5" },
    { src: "/services/company_logo_slider/6.png", alt: "Company 6" },
  ];

  const doubledCompanies = [...companies, ...companies];

  return (
    <div className="overflow-hidden w-full h-[90px] md:h-[120px] mt-[45px] md:mt-[90px]">
      <div className="flex animate-slide touch-pan-x">
        {doubledCompanies.map((company, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[150px] md:w-[200px] mx-3 md:mx-5"
          >
            <Image
              src={company.src || "/placeholder.svg"}
              alt={company.alt}
              width={200}
              height={120}
              className="object-contain h-[90px] md:h-[120px]"
              loading="lazy"
              unoptimized={true} // Key prop
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanySlider;
