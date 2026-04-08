import { View, type ViewProps } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "../context/ThemeContext";

function cn(...inputs: string[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
    className?: string;
    /** Use 'glass' for translucent overlay, 'solid' for opaque dark card */
    variant?: "glass" | "solid" | "elevated";
}

/**
 * Base card primitive.
 * - glass:    white/10 bg, subtle border (for overlays on gradients)
 * - solid:    slate-800 bg, slate-700 border (standard content card)
 * - elevated: slate-700 bg, slightly lighter border (highlighted sections)
 */
export function Card({ className, children, variant = "solid", ...props }: CardProps) {
    const { isDark } = useTheme();
    
    const base = "rounded-2xl overflow-hidden";
    const variants = isDark ? {
        glass:    "bg-white/10 border border-white/15",
        solid:    "bg-slate-800 border border-slate-700",
        elevated: "bg-slate-700 border border-slate-600",
    } : {
        glass:    "bg-white/50 border border-slate-200",
        solid:    "bg-white border border-slate-200",
        elevated: "bg-slate-50 border border-slate-200",
    };

    return (
        <View className={cn(base, variants[variant], className ?? "")} {...props}>
            {children}
        </View>
    );
}