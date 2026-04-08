import { useState, useRef } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated'
import { ArrowRight, Globe, Rocket, Award, Sparkles } from 'lucide-react-native'

const { width } = Dimensions.get('window')

const ONBOARDING_SCREENS = [
    {
        id: 1,
        emoji: '🌍',
        icon: Globe,
        title: 'Discover Global Opportunities',
        description: 'Access scholarships, grants, and educational programs from around the world tailored to your profile.',
        prompt: 'Ready to explore opportunities that match your dreams?',
        gradient: ['#1e3a5f', '#0f172a'],
    },
    {
        id: 2,
        icon: Rocket,
        title: 'Personalized Learning Path',
        description: 'Get AI-powered recommendations for courses and programs that align with your goals and interests.',
        prompt: 'Let\'s create your personalized journey to success!',
        gradient: ['#2d1b4e', '#0f172a'],
    },
    {
        id: 3,
        icon: Award,
        title: 'Track Your Achievements',
        description: 'Set goals, earn badges, and showcase your accomplishments to universities and employers.',
        prompt: 'Start building your legacy today!',
        gradient: ['#1b4d2d', '#0f172a'],
    },
]

function OnboardingPage({ item, isActive }: { item: typeof ONBOARDING_SCREENS[0], isActive: boolean }) {
    const scale = useSharedValue(0.8)
    
    if (isActive) {
        scale.value = withSpring(1, { damping: 15, stiffness: 100 })
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value,
    }))

    const IconComponent = item.icon

    return (
        <View style={[styles.page, { backgroundColor: item.gradient[1] }]}>
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                <View style={styles.iconCircle}>
                    <IconComponent color="#60A5FA" size={64} />
                </View>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.promptContainer}>
                <Sparkles color="#60A5FA" size={18} />
                <Text style={styles.prompt}>{item.prompt}</Text>
            </Animated.View>
        </View>
    )
}

export default function OnboardingWelcome() {
    const router = useRouter()
    const pagerRef = useRef<PagerView>(null)
    const [currentPage, setCurrentPage] = useState(0)

    const handlePageSelected = (event: { nativeEvent: { position: number } }) => {
        setCurrentPage(event.nativeEvent.position)
    }

    const goToNext = () => {
        if (currentPage < ONBOARDING_SCREENS.length - 1) {
            pagerRef.current?.setPage(currentPage + 1)
        } else {
            router.push('/(auth)/sign-in')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.pagerContainer}>
                <PagerView
                    ref={pagerRef}
                    style={styles.pagerView}
                    onPageSelected={handlePageSelected}
                    overdrag={true}
                >
                    {ONBOARDING_SCREENS.map((item, index) => (
                        <OnboardingPage 
                            key={item.id} 
                            item={item} 
                            isActive={index === currentPage} 
                        />
                    ))}
                </PagerView>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {ONBOARDING_SCREENS.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentPage === index && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.pageIndicator}>
                    {currentPage + 1} of {ONBOARDING_SCREENS.length}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={goToNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {currentPage === ONBOARDING_SCREENS.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <ArrowRight color="white" size={20} />
                </TouchableOpacity>

                {currentPage < ONBOARDING_SCREENS.length - 1 && (
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    pagerContainer: {
        flex: 1,
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        position: 'absolute',
        bottom: -10,
        fontSize: 36,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 24,
    },
    promptContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    prompt: {
        fontSize: 14,
        color: '#60A5FA',
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#334155',
    },
    dotActive: {
        backgroundColor: '#3B82F6',
        width: 24,
    },
    pageIndicator: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: 13,
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    skipText: {
        color: '#64748B',
        fontSize: 15,
    },
})