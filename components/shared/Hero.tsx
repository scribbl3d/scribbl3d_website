import React from "react";
import { cn } from "@/lib/utils";
import Section from "./Section";

type HeroProps = {
    content: React.ReactNode;
    url: string;
    type: "video" | "image";
    align?: string;
    wrapperClass?: string;
    containerClass?: string;
};

const Hero = ({
    content,
    url,
    align,
    type,
    wrapperClass = "",
    containerClass = "",
}: HeroProps) => {
    return (
        <Section className={containerClass}>
            <div
                className={cn(
                    "bg-white relative h-[593px] sm:h-[993px] xl:h-screen",
                    wrapperClass
                )}
            >
                {type === "video" ? (
                    <video
                        src={url}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <img
                        src={url}
                        alt="hero"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                <div
                    className={cn(
                        "absolute inset-0 h-full flex isolate bg-primary/40",
                        align ?? "items-center"
                    )}
                >
                    {content}
                </div>
            </div>
        </Section>
    );
};

export default Hero;
