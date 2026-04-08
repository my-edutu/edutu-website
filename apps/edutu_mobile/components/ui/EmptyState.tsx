import { View, Text, type ViewProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps extends ViewProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, ...props }: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-8 py-12" {...props}>
            {Icon && (
                <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-4">
                    <Icon size={36} color="#475569" />
                </View>
            )}
            <Text className="text-white text-xl font-bold text-center mb-2">{title}</Text>
            {description && (
                <Text className="text-slate-400 text-sm text-center leading-5 mb-6">
                    {description}
                </Text>
            )}
            {action}
        </View>
    );
}
