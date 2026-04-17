import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ children, className = "", ...rest }: ContainerProps) => {
    return (
        <div {...rest} className={cn("container", className)}>
            {children}
        </div>
    );
};

export default Container;

Container.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
