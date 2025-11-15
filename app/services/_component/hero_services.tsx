export default function PrototypingServices() {
  return (
    <div className="text-white pb-[30px] md:pb-[55px] pt-[55px] md:pt-[110px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8 md:mb-16">
          <h1 className="text-center font-gilroy text-[32px] md:text-[48.047px] font-medium leading-[1.2] md:leading-[70px] pb-[30px] md:pb-[55px]">
            <span className="text-[#C4FFB0]">Prototyping </span>
            <span className="text-white">Services</span>
          </h1>
        </div>
        <div className="bg-[#3d544d]/25 backdrop-blur rounded-lg p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-8">
            <Stat number="1000+" label="Prototypes Delivered" />
            <Stat number="500+" label="STLs Designed" />
            <Stat number="2+" label="Years Experience" />
            <Stat number="1500+" label="Worldwide Clients" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-['M_PLUS_1'] leading-tight">
        {number}
      </div>
      <div className="mt-2 text-[#2bb32a] text-xs md:text-sm lg:text-base font-medium font-['M_PLUS_1']">
        {label}
      </div>
    </div>
  );
}
