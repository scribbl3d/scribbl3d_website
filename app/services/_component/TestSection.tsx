"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import { Form3D } from "./Form3d";
import PrototypingRequestForm from "./PrototypingRequestForm";
import { SmallBatchManufacturingForm } from "./SmallBatchManufacturingForm";

const TestSection: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
    const [isPrototypingDialogOpen, setIsPrototypingDialogOpen] =
        useState(false);

    // const handleDialogClose = useCallback(() => {
    //   setIsDialogOpen(false);
    //   setIsBatchDialogOpen(false);
    //   setIsPrototypingDialogOpen(false);
    // }, []);

    const renderDialog = useCallback(
        (
            isOpen: boolean,
            onOpenChange: (open: boolean) => void,
            title: string,
            description: string,
            children: React.ReactNode,
        ) => (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-4 md:p-6">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl md:text-2xl">
                                {title}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-base">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] mt-4">
                        <div className="px-1">{children}</div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        ),
        [],
    );

    const renderSection = useCallback(
        (
            imageUrl: string,
            title: string,
            description: string,
            dialogTitle: string,
            dialogDescription: string,
            FormComponent: React.ComponentType<{ onSubmit: () => void }>,
            isOpen: boolean,
            setIsOpen: (open: boolean) => void,
            imagePosition: "left" | "right" = "right",
        ) => {
            const contentSection = (
                <div className="md:w-1/2 p-4 md:p-8 space-y-4 md:space-y-6 relative z-10">
                    <h2 className="text-2xl md:text-4xl font-bold leading-tight font-mplus1 text-white">
                        {title}
                    </h2>
                    <p className="text-base md:text-lg text-[#ADB2B1] font-poppins">
                        {description}
                    </p>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto bg-[#2BB32A] hover:bg-[#2BB32A]/90 text-white rounded-[32px] md:rounded-[64px] px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-medium">
                                Enquire Now
                                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                        </DialogTrigger>
                        {renderDialog(
                            isOpen,
                            setIsOpen,
                            dialogTitle,
                            dialogDescription,
                            <FormComponent onSubmit={() => setIsOpen(false)} />,
                        )}
                    </Dialog>
                </div>
            );

            const imageSection = (
                <div className="md:w-1/2 mt-6 md:mt-0 flex items-center justify-center h-[300px] md:h-[500px] p-3 relative z-10">
                    <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={title}
                        width={600}
                        height={400}
                        className="object-contain w-full h-full rounded-lg"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            );

            return (
                <section
                    className={cn(
                        "relative overflow-hidden flex flex-col md:flex-row items-center p-4 md:p-8 lg:p-16",
                        imagePosition === "left" && "md:flex-row-reverse",
                    )}
                >
                    {imagePosition === "left" ? (
                        <>
                            {imageSection}
                            {contentSection}
                        </>
                    ) : (
                        <>
                            {imageSection}
                            {contentSection}
                        </>
                    )}
                </section>
            );
        },
        [renderDialog],
    );

    return (
        <div className="w-full bg-[#141414]">
            {/* Rapid Prototyping Section */}
            <div className="relative">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: `radial-gradient(
              circle 260px at top right,
              rgba(34, 197, 94, 0.3),
              rgba(34, 197, 94, 0.1) 70%,
              transparent 90%
            )`,
                    }}
                />
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: `radial-gradient(
              circle 260px at bottom left,
              rgba(161, 67, 176, 0.3),
              rgba(161, 67, 176, 0.1) 70%,
              transparent 90%
            )`,
                    }}
                />
                {renderSection(
                    "/services/forms_images/1.png",
                    "Test Before You Invest: Rapid Prototyping",
                    "Ready to bring your idea to life? We turn product ideas into reality with rapid prototyping using adv. tech and top-tier equipment.",
                    "Request 3D Prototyping Service",
                    "Fill out the form below to request our 3D prototyping services.",
                    PrototypingRequestForm,
                    isPrototypingDialogOpen,
                    setIsPrototypingDialogOpen,
                )}
            </div>

            {/* Batch Manufacturing Section */}
            <div className="relative">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: `radial-gradient(
              circle 300px at top left,
              rgba(161, 67, 176, 0.3),
              rgba(161, 67, 176, 0.1) 60%,
              transparent 80%
            )`,
                    }}
                />
                {renderSection(
                    "/services/forms_images/2.png",
                    "From One to Many: Batch Manufacturing",
                    "Need components, fast? Our efficient batch manufacturing scales with you. Reliable & fast - get what you need, on time.",
                    "Small Batch Manufacturing Request",
                    "Fill out the form below to request our small batch manufacturing services.",
                    SmallBatchManufacturingForm,
                    isBatchDialogOpen,
                    setIsBatchDialogOpen,
                    "left",
                )}
            </div>

            {/* STL File Design Section */}
            <div className="relative">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: `radial-gradient(
              circle 300px at center right,
              rgba(34, 197, 94, 0.3),
              rgba(34, 197, 94, 0.1) 60%,
              transparent 80%
            )`,
                    }}
                />
                {renderSection(
                    "/services/forms_images/3.png",
                    "3D Doctors: Expert Designing of STL Files",
                    "STL got flaws? We fix & customise! Our experts ensure flawless, print-ready files for your creations.",
                    "Request 3D Service",
                    "Fill out the form below to request our 3D services.",
                    Form3D,
                    isDialogOpen,
                    setIsDialogOpen,
                )}
            </div>
        </div>
    );
};

export default TestSection;
