import { motion } from "framer-motion";
import cn from "./cn";
const h1BaseStyles =
    "text-primary font-semibold text-5xl sm:text-5.6xl xl:text-8.0xl 2xl:text-8.8xl 3xl:text-9xl ";
const h2baseStyles =
    "text-primary font-semibold text-4xl sm:text-5xl xl:text-7xl  2xl:text-8xl gap-x-0.5 sm:gap-x-1 flex flex-wrap";
const SplitText = ({ children, className, variants, heading = "h1" }) => {
    const renderBlockText = children.split(" ").map((item) => (
        <span
            className="overflow-y-hidden"
            style={{
                lineHeight: "initial",
            }}
        >
            <motion.span variants={variants} className="inline-block">
                {item}
            </motion.span>
        </span>
    ));

    if (heading === "h1") {
        return (
            <h1 className={cn(h1BaseStyles, className)}>{renderBlockText}</h1>
        );
    } else {
        return (
            <h2 className={cn(h2baseStyles, className)}>{renderBlockText}</h2>
        );
    }
};
export default SplitText;

// <motion.span
// initial="initial"
// whileInView="animate"
// variants={container}
// className={cn("flex flex-wrap", wrapperClass)}
// >
// {children.split(" ").map((item) => (
//     <span className=" overflow-y-hidden block">
//         <motion.span variants={variants} className="inline-block">
//             {item}
//         </motion.span>
//     </span>
// ))}
// </motion.span>
