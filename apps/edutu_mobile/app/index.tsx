import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, Text, Easing } from 'react-native'
import { useRouter } from 'expo-router'

export default function SplashScreen() {
    const router = useRouter()
    
    const logoScale = useRef(new Animated.Value(0)).current
    const logoOpacity = useRef(new Animated.Value(0)).current
    const taglineOpacity = useRef(new Animated.Value(0)).current
    const taglineTranslate = useRef(new Animated.Value(30)).current

    useEffect(() => {
        Animated.sequence([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                delay: 400,
                useNativeDriver: true,
            }),
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 600,
                delay: 800,
                useNativeDriver: true,
            }),
            Animated.timing(taglineTranslate, {
                toValue: 0,
                duration: 600,
                delay: 800,
                useNativeDriver: true,
            }),
        ]).start()

        const navigateTimeout = setTimeout(() => {
            router.replace('/onboarding-welcome')
        }, 2500)

        return () => clearTimeout(navigateTimeout)
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
                    <Text style={styles.logoEmoji}>🎓</Text>
                </Animated.View>
                <Animated.Text style={[styles.logoText, { opacity: logoOpacity }]}>Edutu</Animated.Text>
            </View>
            
            <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] }]}>
                <Text style={styles.tagline}>Your Gateway to Global Opportunities</Text>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoEmoji: {
        fontSize: 56,
    },
    logoText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    taglineContainer: {
        position: 'absolute',
        bottom: 80,
    },
    tagline: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
})