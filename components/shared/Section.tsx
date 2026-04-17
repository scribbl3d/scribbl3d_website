import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
}

const Section = ({ children, className = "", ...rest }: SectionProps) => {
    return (
        <section
            {...rest}
            className={cn("font-urbanist mb-6.4 lg:mb-8 xl:mb-9.6 2xl:mb-15", className)}
        >
            {children}
        </section>
    );
};

Section.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Section;
