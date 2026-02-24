import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
const baseStyles = "font-urbanist mb-6.4 lg:mb-8 xl:mb-9.6 2xl:mb-15";
const Section = ({ children, className = "", ...rest }) => {
    return (
        <section {...rest} className={twMerge(baseStyles, className)}>
            {children}
        </section>
    );
};
Section.propType = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
export default Section;
