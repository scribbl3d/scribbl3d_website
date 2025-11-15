import Image from "next/image";

export default function Component() {
  const offerings = [
    {
      title: "Reliable Designs",
      description: "Your data and funds will be securely protected.",
      icon: "/services/whatofferpng/1.png",
    },
    {
      title: "Precision Printing",
      description: "Your data and funds will be securely protected.",
      icon: "/services/whatofferpng/2.png",
    },
    {
      title: "Fast Turnaround Times",
      description: "Your assets and information will be safely guarded.",
      icon: "/services/whatofferpng/3.png",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(
            circle 300px at bottom right,
            rgba(34, 197, 94, 0.3),
            rgba(34, 197, 94, 0.1) 60%,
            transparent 80%
          )`,
        }}
      />
      <div className="relative text-white py-[95px] md:py-[190px] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-center mb-8 md:mb-12 font-mplus1 text-[32px] md:text-[40px] font-bold leading-[1.2] md:leading-[48px] text-white">
            What do we offer?
          </h2>
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:justify-between md:space-x-2">
            {offerings.map((offering, index) => (
              <div key={index} className="flex items-start space-x-3 md:w-1/3">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center pt-3">
                    <Image
                      src={offering.icon || "/placeholder.svg"}
                      alt={offering.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 md:w-16 md:h-16 text-white"
                      loading="lazy"
                      unoptimized={true} // Key prop
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-semibold">
                    {offering.title}
                  </h3>
                  <p className="text-gray-400 text-[14px] md:text-[16px] max-w-[250px] md:w-[300px]">
                    {offering.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
