import AnnouncementBanner from "./landingpage/AnnouncementBanner";
import ImageCarousel from "./landingpage/image-carousel";
import MakeItYourOwn from "./landingpage/herosectionimage";
import TrendingNow from "./landingpage/trending-now";
import NewLaunch from "./landingpage/new-launch";
import HomeEssentials from "./landingpage/home-essentials";
import Thelatest from "./landingpage/the-latest";
import Cosplay from "./landingpage/cosplay";
import Figurine from "./landingpage/figurine";
import HouseholdUtilities from "./landingpage/household-utilities";
import Keychains from "./landingpage/keychains";
import Kits from "./landingpage/kits";
import Lamps from "./landingpage/lamps";
import Personalised from "./landingpage/personalised";
import Statues from "./landingpage/statues";
import Utilities from "./landingpage/utilities";
import WallDecor from "./landingpage/wall-decor";

export default function Home() {
  return (
    <main className="w-full">
      <div className="pt-[80px]">
        <AnnouncementBanner />
        <MakeItYourOwn />
        <ImageCarousel />
        <TrendingNow />
        <NewLaunch />
        <HomeEssentials />
        <Thelatest />
        <Cosplay />
        <Figurine />
        <HouseholdUtilities />
        <Keychains />
        <Kits />
        <Lamps />
        <Personalised />
        <Statues />
        <Utilities />
        <WallDecor />
      </div>
    </main>
  );
}
