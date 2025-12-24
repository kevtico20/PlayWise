import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={['#010009', '#0C006F']}
      className={`flex-1 ${className}`}
    >
      {children}
    </LinearGradient>
  );
}
