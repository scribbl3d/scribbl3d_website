import Parallax from "./parallax";

interface ParallaxSectionProps {
  backgroundImage: string;
  height: string;
}

export default function ParallaxSection({
  backgroundImage,
  height,
}: ParallaxSectionProps) {
  return (
    <Parallax backgroundImage={backgroundImage} height={height}>
      <div className="text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          From Vision to Reality,
          <br />
          One Layer at a Time
        </h1>
        <p className="text-xl md:text-2xl">Innovative 3D Printing Solutions</p>
      </div>
    </Parallax>
  );
}
