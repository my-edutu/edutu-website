import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemePackage = 'default' | 'ocean' | 'sunset' | 'forest' | 'royal';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
    background: string;
    foreground: string;
    card: string;
    border: string;
    accent: string;
    primary: string;
}

interface ThemeContextType {
    mode: ThemeMode;
    packageId: ThemePackage;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
    setPackage: (pkg: ThemePackage) => void;
    colors: ThemeColors;
}

const THEME_PACKAGES: Record<ThemePackage, {
    light: { accent: string, background: string, primary: string },
    dark: { accent: string, background: string, primary: string }
}> = {
    default: {
        light: { accent: '#6366f1', background: '#ffffff', primary: '#4f46e5' },
        dark: { accent: '#818cf8', background: '#020617', primary: '#6366f1' }
    },
    ocean: {
        light: { accent: '#0ea5e9', background: '#f0fdf4', primary: '#0284c7' },
        dark: { accent: '#38bdf8', background: '#020617', primary: '#0ea5e9' }
    },
    sunset: {
        light: { accent: '#f59e0b', background: '#fffdf5', primary: '#d97706' },
        dark: { accent: '#fbbf24', background: '#0f0c1a', primary: '#f59e0b' }
    },
    forest: {
        light: { accent: '#10b981', background: '#f0fdf4', primary: '#059669' },
        dark: { accent: '#34d399', background: '#020617', primary: '#10b981' }
    },
    royal: {
        light: { accent: '#8b5cf6', background: '#fff1f2', primary: '#7c3aed' },
        dark: { accent: '#a78bfa', background: '#0f0c1a', primary: '#8b5cf6' }
    }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [packageId, setPackage] = useState<ThemePackage>('default');

    const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

    const activeTheme = THEME_PACKAGES[packageId][isDark ? 'dark' : 'light'];

    const colors: ThemeColors = {
        background: activeTheme.background,
        foreground: isDark ? '#f8fafc' : '#0f172a',
        card: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
        border: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        accent: activeTheme.accent,
        primary: activeTheme.primary,
    };

    return (
        <ThemeContext.Provider value={{ mode, packageId, isDark, setMode, setPackage, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}