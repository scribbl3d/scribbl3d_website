import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
const baseStyles = "container";
const Container = ({ children, className = "", ...rest }) => {
    return (
        <div {...rest} className={twMerge(baseStyles, className)}>
            {children}
        </div>
    );
};

export default Container;

Container.propType = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
