import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    className?: string;
}

const H3 = ({ className = "", children, ...rest }: H3Props) => {
    return (
        <h3
            {...rest}
            className={cn(
                "font-semibold text-base sm:text-lg xl:text-5xl 2xl:text-5xl text-primary",
                className
            )}
        >
            {children}
        </h3>
    );
};

export default H3;

H3.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
