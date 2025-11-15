"use client";

import { motion } from "framer-motion";
import { BasicInformation } from "./BasicInformation";
import { SecuritySettings } from "./SecuritySettings";
import { User } from "@/app/types";

interface PersonalInfoProps {
  user: User;
}

export function PersonalInfo({ user }: PersonalInfoProps) {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.2 }}
    >
      <BasicInformation user={user} />
      <SecuritySettings />
    </motion.div>
  );
}
