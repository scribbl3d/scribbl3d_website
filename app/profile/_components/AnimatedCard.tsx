import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnimatedCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AnimatedCard({
  children,
  title,
  description,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
          <CardDescription className="text-xs md:text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  );
}
