import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { Tabs, Redirect, useRouter, useSegments } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Home,
    Compass,
    ShoppingBag,
    Menu,
    Sparkles,
    Bell,
    Briefcase,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../components/context/ThemeContext";

// ─── Badge Component ─────────────────────────────────────────────────────────
function Badge({ count, isDark }: { count?: number | "!"; isDark: boolean }) {
    if (count === undefined || count === null) return null;
    const label = typeof count === "number" ? (count > 99 ? "99+" : String(count)) : count;
    return (
        <View style={[styles.badge, { borderColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    );
}

// ─── Tab Item ─────────────────────────────────────────────────────────────────
function TabItem({
    icon: Icon,
    label,
    isActive,
    badge,
    onPress,
    theme,
    isDark,
}: {
    icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    label: string;
    isActive: boolean;
    badge?: number | "!";
    onPress: () => void;
    theme: any;
    isDark: boolean;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.tabItem,
                isActive && { backgroundColor: theme.activePill }
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
        >
            <View style={styles.iconContainer}>
                <Icon
                    size={21}
                    color={isActive ? theme.activeColor : theme.inactive}
                    strokeWidth={isActive ? 2.5 : 2}
                />
                <Badge count={badge} isDark={isDark} />
            </View>

            <Text
                style={[
                    styles.tabLabel,
                    { color: isActive ? theme.labelActive : theme.inactive },
                    isActive && { fontWeight: "700" }
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Edutu AI Button ──────────────────────────────────────────────────────────
function EdutuAIButton({ onPress }: { onPress: () => void }) {
    const { isDark, colors } = useTheme();
    const [isHolding, setIsHolding] = useState(false);
    const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
    
    const accentColor = colors.accent || "#6366F1";

    return (
        <View style={styles.aiBtnWrapper}>
            {showVoiceIndicator && (
                <View style={styles.voiceIndicator}>
                    <Text style={styles.voiceText}>Listening...</Text>
                </View>
            )}
            <TouchableOpacity
                onPress={onPress}
                onPressIn={() => { setIsHolding(true); setShowVoiceIndicator(true); }}
                onPressOut={() => { setIsHolding(false); setTimeout(() => setShowVoiceIndicator(false), 1000); onPress(); }}
                activeOpacity={1}
                style={styles.aiBtnContainer}
                accessibilityRole="button"
                accessibilityLabel="Edutu AI Voice"
             >
                {isHolding && <View style={[styles.aiGlowOuter, { transform: [{ scale: 1.2 }] }]} />}
                {!isHolding && <View style={styles.aiGlowOuter} />}
                <LinearGradient
                    colors={[accentColor, "#06B6D4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiGradientPill}
                >
                    <Sparkles size={22} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
                <View style={[styles.aiGlow, { backgroundColor: accentColor }]} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Shared App Header ────────────────────────────────────────────────────────
function AppHeader({ isDark, colors }: { isDark: boolean, colors: any }) {
    const router = useRouter();
    const accentColor = colors.accent || "#6366F1";
    // In a real app we'd get this from a hook, hardcoding for now
    const unreadNotifications = 1;

    return (
        <SafeAreaView edges={['top']} style={[styles.headerOuter, { backgroundColor: colors.background }]}>
            <View style={styles.headerInner}>
                <View style={styles.brandContainer}>
                    <LinearGradient
                        colors={["#4F46E5", "#06B6D4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoIcon}
                    >
                        <View style={styles.logoInnerSquare} />
                    </LinearGradient>
                    <Text style={[styles.brandText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        edutu
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/notifications')}
                    activeOpacity={0.7}
                    style={[styles.bellBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}
                >
                    <Bell size={20} color={accentColor} strokeWidth={2} />
                    {unreadNotifications > 0 && <View style={[styles.bellBadge, { borderColor: colors.background }]} />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Bottom Navigation Bar ────────────────────────────────────────────────────
function BottomNav({
    tabs,
    activeRoute,
    onTabPress,
    onAIPress,
    isDark,
}: {
    tabs: Array<{
        key: string;
        route: string;
        label: string;
        icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
        badge?: number | "!";
    }>;
    activeRoute: string;
    onTabPress: (key: string, route: string) => void;
    onAIPress: () => void;
    isDark: boolean;
}) {
    // Dynamic theme tokens
    const THEME = {
        navBg: isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.70)",
        activePill: isDark ? "rgba(99, 102, 241, 0.20)" : "#F0F0F5",
        activeColor: isDark ? "#818CF8" : "#4F46E5",
        inactive: isDark ? "#94A3B8" : "#475569",
        border: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        labelActive: isDark ? "#A5B4FC" : "#4F46E5",
        shadow: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)",
    };

    return (
        <View style={styles.navContainer} pointerEvents="box-none">
            <View style={[styles.navPillWrapper, { shadowColor: THEME.shadow }]}>
                <BlurView
                    intensity={isDark ? 40 : 65}
                    tint={isDark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.navPillOverlay, { backgroundColor: THEME.navBg, borderColor: THEME.border }]}>
                    {tabs.map((tab) => (
                        <TabItem
                            key={tab.key}
                            icon={tab.icon}
                            label={tab.label}
                            isActive={activeRoute === tab.key}
                            badge={tab.badge}
                            onPress={() => onTabPress(tab.key, tab.route)}
                            theme={THEME}
                            isDark={isDark}
                        />
                    ))}
                </View>
            </View>

            <EdutuAIButton onPress={onAIPress} />
        </View>
    );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function AppLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const { isDark, colors } = useTheme();
    const router = useRouter();
    const segments = useSegments();
    const insets = useSafeAreaInsets();

    const currentRoute = segments[segments.length - 1];

    const getActiveRoute = (): string => {
        if (!currentRoute || currentRoute === "index" || currentRoute === "(app)") return "home";
        if (currentRoute === "explore") return "explore";
        if (currentRoute === "opportunities") return "opportunities";
        if (currentRoute === "marketplace") return "market";
        if (currentRoute === "profile") return "menu";
        return "subpage";
    };

    const activeRoute = getActiveRoute();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    if (user && !user.unsafeMetadata?.onboardingComplete) {
        return <Redirect href="/onboarding" />;
    }

    const tabs = [
        { key: "home", route: "/", label: "Home", icon: Home, badge: undefined },
        { key: "explore", route: "/explore", label: "Explore", icon: Compass, badge: undefined },
        { key: "opportunities", route: "/opportunities", label: "Jobs", icon: Briefcase, badge: undefined },
        { key: "market", route: "/marketplace", label: "Market", icon: ShoppingBag, badge: undefined },
        { key: "menu", route: "/profile", label: "Menu", icon: Menu, badge: undefined },
    ];

    return (
        <View style={[styles.appContainer, { backgroundColor: colors.background }]}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: "none" },
                }}
            >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="explore" />
                <Tabs.Screen name="opportunities" />
                <Tabs.Screen name="marketplace" />
                <Tabs.Screen name="profile" />
                <Tabs.Screen name="notifications" options={{ href: null }} />
                <Tabs.Screen name="chat" options={{ href: null }} />
            </Tabs>

            {/* Shared Top Header - only on main tabs */}
            {['home', 'explore', 'opportunities', 'market', 'menu'].includes(activeRoute) && (
                <AppHeader isDark={isDark} colors={colors} />
            )}

            {/* Bottom Gradient Overlay & Navigation - only on main tabs */}
            {['home', 'explore', 'opportunities', 'market', 'menu'].includes(activeRoute) && (
                <>
                    <LinearGradient
                        colors={isDark
                            ? ["transparent", "rgba(2, 6, 23, 0.8)", "rgba(2, 6, 23, 1)"]
                            : ["transparent", "rgba(248, 250, 252, 0.8)", "rgba(248, 250, 252, 1)"]
                        }
                        style={[styles.bottomFade, { height: 120 + insets.bottom }]}
                        pointerEvents="none"
                    />

                    <BottomNav
                        tabs={tabs}
                        activeRoute={activeRoute}
                        onTabPress={(key, route) => router.push(route as never)}
                        onAIPress={() => router.push("/chat")}
                        isDark={isDark}
                    />
                </>
            )}

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
    },
    navContainer: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 34 : 24,
        left: 14,
        right: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        zIndex: 100,
    },
    navPillWrapper: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        overflow: "hidden",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 10,
    },
    navPillOverlay: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 32,
    },
    tabItem: {
        flex: 1,
        height: 48,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        marginHorizontal: 2,
    },
    iconContainer: {
        position: "relative",
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
        letterSpacing: 0.1,
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
        borderWidth: 1.5,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 8,
        fontWeight: "800",
        lineHeight: 10,
    },
    aiBtnContainer: {
        position: "relative",
    },
    aiBtnWrapper: {
        position: "relative",
        alignItems: "center",
    },
    voiceIndicator: {
        position: "absolute",
        bottom: 80,
        backgroundColor: "#10B981",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    voiceText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    aiGradientPill: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    aiLabel: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
        marginTop: 1,
    },
    aiGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 32,
        backgroundColor: "#4F46E5",
        opacity: 0.15,
        transform: [{ scale: 1.1 }],
        zIndex: -1,
    },
    aiGlowOuter: {
        position: "absolute",
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: 42,
        backgroundColor: "#4F46E5",
        opacity: 0.2,
        zIndex: -2,
    },

    // ── Header Styles ───────────────────────────────────────────
    headerOuter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    headerInner: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
    },
    logoInnerSquare: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        transform: [{ rotate: '15deg' }],
    },
    brandText: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -1,
    },
    bellBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    bellBadge: {
        position: 'absolute',
        top: 10,
        right: 11,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#020617',
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
    },
});