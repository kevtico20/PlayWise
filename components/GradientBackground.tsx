import { APP_COLORS } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Platform, useWindowDimensions } from "react-native";

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBackground({
  children,
  className = "",
}: GradientBackgroundProps) {
  const { height } = useWindowDimensions();

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      className={`flex-1 ${className}`}
      style={Platform.OS === "web" ? { height } : { flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
