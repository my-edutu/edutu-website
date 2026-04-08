import { View, Text, Image, type ViewProps } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: string[]) {
    return twMerge(clsx(inputs));
}

interface AvatarProps extends ViewProps {
    name?: string;
    imageUrl?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const SIZES = {
    xs: { container: "w-6 h-6 rounded-lg",   text: "text-[8px]" },
    sm: { container: "w-8 h-8 rounded-xl",   text: "text-xs"    },
    md: { container: "w-10 h-10 rounded-2xl", text: "text-sm"   },
    lg: { container: "w-14 h-14 rounded-2xl", text: "text-base" },
    xl: { container: "w-20 h-20 rounded-3xl", text: "text-xl"   },
};

export function Avatar({ name = "?", imageUrl, size = "md", className, ...props }: AvatarProps) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? "")
        .join("");

    const { container, text } = SIZES[size];

    return (
        <View
            className={cn(
                "bg-blue-600 items-center justify-center overflow-hidden",
                container,
                className ?? ""
            )}
            {...props}
        >
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <Text className={cn("text-white font-bold", text)}>
                    {initials || "?"}
                </Text>
            )}
        </View>
    );
}
