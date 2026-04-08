import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "../cache";
import { ThemeProvider, useTheme } from "../components/context/ThemeContext";
import "../global.css";

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error(
        "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );
}

function RootLayoutContent() {
    const { colors, isDark } = useTheme();
    
    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Slot />
        </GestureHandlerRootView>
    );
}

export default function RootLayout() {
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={PUBLISHABLE_KEY}>
            <ClerkLoaded>
                <ThemeProvider>
                    <RootLayoutContent />
                </ThemeProvider>
            </ClerkLoaded>
        </ClerkProvider>
    );
}