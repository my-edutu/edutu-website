import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = false, onBack, right }: ScreenHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-slate-800">
            {showBack && (
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3"
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={20} color={COLORS.text.secondary} />
                </TouchableOpacity>
            )}
            <View className="flex-1">
                <Text className="text-white text-xl font-bold">{title}</Text>
                {subtitle && (
                    <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
                )}
            </View>
            {right && <View>{right}</View>}
        </View>
    );
}
