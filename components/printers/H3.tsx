import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
const baseStyles =
    "font-semibold text-base sm:text-lg xl:text-5xl 2xl:text-5xl text-primary";

const H3 = ({ className = "", children }) => {
    return <h3 className={twMerge(baseStyles, className)}>{children}</h3>;
};

export default H3;

H3.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
