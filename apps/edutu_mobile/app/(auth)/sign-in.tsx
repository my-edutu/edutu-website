import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import React from 'react'
import { Mail, Lock, ArrowRight } from 'lucide-react-native'

export default function SignInPage() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const onSignInPress = async () => {
        if (!isLoaded) return
        setError('')
        setLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
            } else if (signInAttempt.status === 'needs_second_factor') {
                setError('Two-factor authentication required')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
                setError('Sign in incomplete. Please try again.')
            }
        } catch (err: any) {
            const message = err.errors?.[0]?.message || 'Failed to sign in'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = () => {
        if (!emailAddress.trim()) {
            Alert.alert('Error', 'Please enter your email first')
            return
        }
        router.push({
            pathname: '/reset-password',
            params: { email: emailAddress }
        })
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </View>

                {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWithIcon}>
                            <Mail color="#64748B" size={20} />
                            <TextInput
                                autoCapitalize="none"
                                value={emailAddress}
                                placeholder="you@example.com"
                                placeholderTextColor="#64748B"
                                onChangeText={setEmailAddress}
                                style={styles.inputInner}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWithIcon}>
                            <Lock color="#64748B" size={20} />
                            <TextInput
                                value={password}
                                placeholder="Enter password"
                                placeholderTextColor="#64748B"
                                secureTextEntry={true}
                                onChangeText={setPassword}
                                style={styles.inputInner}
                            />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onSignInPress}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                        {!loading && <ArrowRight color="white" size={20} />}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Link href="/sign-up">
                            <Text style={styles.linkText}>Sign up</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#94A3B8',
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#FCA5A5',
        fontSize: 14,
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CBD5E1',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#334155',
        gap: 10,
    },
    inputInner: {
        flex: 1,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 16,
    },
    forgotBtn: {
        alignItems: 'flex-end',
    },
    forgotText: {
        color: '#3B82F6',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 24,
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    linkText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: 'bold',
    },
})
