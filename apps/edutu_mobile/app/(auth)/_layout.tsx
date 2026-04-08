import { Redirect, Stack } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { ActivityIndicator, View } from 'react-native'

export default function AuthRoutesLayout() {
    const { isSignedIn, isLoaded } = useAuth()
    const { user } = useUser()

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        )
    }

    if (isSignedIn) {
        if (user && !user.unsafeMetadata?.onboardingComplete) {
            return <Redirect href="/onboarding" />
        }
        return <Redirect href="/(app)" />
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0F172A' },
            }}
        >
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="reset-password" />
        </Stack>
    )
}
