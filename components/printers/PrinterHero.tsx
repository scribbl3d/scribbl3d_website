import { motion } from "framer-motion";
import Container from "./Container";
import H3 from "./H3";
import Hero from "./Hero";
import SplitText from "./SplitText";
type HeroContentProps = {
    onClick: () => void;
};
const translateContainer = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.1,
            when: "beforeChildren",
            staggerChildren: 0.2,
        },
    },
};
const container = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.1,
            when: "beforeChildren",
            staggerChildren: 0.2,
        },
    },
};
const headingsTwo = {
    initial: { y: -20, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 1,
            type: "tween",
        },
    },
};

const wavyHeadings = {
    initial: { y: "100%" },
    animate: {
        y: 0,
        transition: {
            duration: 0.5,
            type: "tween",
        },
    },
};

const HeroContent = ({ onClick }: HeroContentProps) => {
    return (
        <Container>
            <div
                style={{
                    paddingTop:
                        "clamp(3rem, calc((100vw - 1439px) * 80), 5rem)",
                }}
            >
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    variants={translateContainer}
                    className="text-white w-full 
                2xs:w-[94%] sm:w-[600px] md:w-[680px] lg:w-[700px] xl:w-[810px] 2xl:w-[1100px] 3xl:w-[1200px]
                "
                >
                    <SplitText
                        className="flex flex-wrap gap-x-2 sm:gap-x-3 text-white"
                        variants={wavyHeadings}
                    >
                        Discover&nbsp;Cutting-Edge 3D Printers
                    </SplitText>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileInView="animate"
                    variants={container}
                    className="overflow-x-hidden"
                >
                    <motion.div variants={headingsTwo}>
                        <H3 className="font-normal text-white mt-0.8 sm:mt-2.4 xl:mt-5 sm:text-[2.6rem] lg:text-5xl">
                            Explore our extensive selection of 3D printers.
                        </H3>
                    </motion.div>
                </motion.div>
            </div>
        </Container>
    );
};

const PrinterHero = () => {
    return (
        <div>
            <Hero
                content={
                    <HeroContent
                        onClick={() => {
                            /*NOTHING FOR ON CLICK */
                        }}
                    />
                }
                url="https://res.cloudinary.com/dlbrgchrh/video/upload/v1767461878/printer-images/doef4s0pr9mzikpb6hzu.mp4"
                type="video"
                wrapperClass="xl:h-[830px] 2xl:h-screen"
            />
        </div>
    );
};

export default PrinterHero;
