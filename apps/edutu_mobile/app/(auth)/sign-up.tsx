/**
 * Sign-up screen
 *
 * Clerk fields → email, password, firstName, lastName
 * Country / interests → collected in /onboarding after verification
 */
import * as React from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useSignUp, useOAuth } from '@clerk/clerk-expo'
import * as WebBrowser from 'expo-web-browser'
import { Link, useRouter } from 'expo-router'
import { User, Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react-native'

// Allow Expo to complete the OAuth session when returning from the browser
WebBrowser.maybeCompleteAuthSession()

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' })
    const { startOAuthFlow: appleOAuth }  = useOAuth({ strategy: 'oauth_apple'  })

    const [fullName,     setFullName]     = React.useState('')
    const [emailAddress, setEmailAddress] = React.useState('')
    const [password,     setPassword]     = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)

    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code,       setCode]       = React.useState('')
    const [loading,    setLoading]    = React.useState(false)
    const [oauthLoading, setOauthLoading] = React.useState<'google' | 'apple' | null>(null)
    const [error,      setError]      = React.useState('')

    // ── OAuth ──────────────────────────────────────────────────────────────────
    const handleOAuth = async (provider: 'google' | 'apple') => {
        setError('')
        setOauthLoading(provider)
        try {
            const flow = provider === 'google' ? googleOAuth : appleOAuth
            const { createdSessionId, setActive: setActiveSession } = await flow()
            if (createdSessionId && setActiveSession) {
                await setActiveSession({ session: createdSessionId })
                router.replace('/onboarding')
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || `${provider} sign-in failed`)
        } finally {
            setOauthLoading(null)
        }
    }

    // ── Email sign-up ──────────────────────────────────────────────────────────
    const onSignUpPress = async () => {
        if (!isLoaded) return
        setError('')

        if (!fullName.trim())      { setError('Please enter your full name');         return }
        if (!emailAddress.trim())  { setError('Please enter your email');             return }
        if (password.length < 8)   { setError('Password must be at least 8 characters'); return }

        setLoading(true)
        try {
            await signUp.create({
                emailAddress,
                password,
                firstName: fullName.split(' ')[0],
                lastName:  fullName.split(' ').slice(1).join(' ') || undefined,
            })
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    // ── Email verification ─────────────────────────────────────────────────────
    const onVerifyPress = async () => {
        if (!isLoaded) return
        setLoading(true)
        setError('')
        try {
            const attempt = await signUp.attemptEmailAddressVerification({ code })
            if (attempt.status === 'complete') {
                await setActive({ session: attempt.createdSessionId })
                router.replace('/onboarding')
            } else {
                setError('Verification incomplete. Please try again.')
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Invalid verification code')
        } finally {
            setLoading(false)
        }
    }

    const resendCode = async () => {
        if (!isLoaded) return
        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            Alert.alert('Code Sent', 'A new code was sent to ' + emailAddress)
        } catch {
            Alert.alert('Error', 'Failed to resend. Try again.')
        }
    }

    // ── Verify screen ──────────────────────────────────────────────────────────
    if (pendingVerification) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.iconBox}>
                            <Mail color="#3B82F6" size={32} />
                        </View>
                        <Text style={styles.title}>Verify Email</Text>
                        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
                        <Text style={styles.emailHighlight}>{emailAddress}</Text>
                    </View>

                    {error ? <ErrorBox message={error} /> : null}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                value={code}
                                placeholder="000000"
                                placeholderTextColor="#64748B"
                                onChangeText={setCode}
                                style={styles.codeInput}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={onVerifyPress}
                            style={[styles.button, (loading || code.length < 6) && styles.buttonDisabled]}
                            disabled={loading || code.length < 6}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Verifying…' : 'Verify & Continue'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={resendCode} style={styles.centeredRow}>
                            <Text style={styles.mutedText}>
                                Didn't receive it?{' '}
                                <Text style={styles.linkText}>Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    // ── Sign-up screen ─────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Sparkles color="#3B82F6" size={32} />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join Edutu to discover opportunities worldwide
                    </Text>
                </View>

                {/* OAuth buttons */}
                <View style={styles.oauthRow}>
                    <TouchableOpacity
                        style={styles.oauthBtn}
                        onPress={() => handleOAuth('google')}
                        disabled={oauthLoading !== null}
                    >
                        <Text style={styles.oauthIcon}>G</Text>
                        <Text style={styles.oauthLabel}>
                            {oauthLoading === 'google' ? 'Opening…' : 'Google'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.oauthBtn}
                        onPress={() => handleOAuth('apple')}
                        disabled={oauthLoading !== null}
                    >
                        <Text style={styles.oauthIcon}></Text>
                        <Text style={styles.oauthLabel}>
                            {oauthLoading === 'apple' ? 'Opening…' : 'Apple'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with email</Text>
                    <View style={styles.dividerLine} />
                </View>

                {error ? <ErrorBox message={error} /> : null}

                <View style={styles.form}>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputRow}>
                            <User color="#64748B" size={20} />
                            <TextInput
                                value={fullName}
                                placeholder="John Doe"
                                placeholderTextColor="#64748B"
                                onChangeText={setFullName}
                                style={styles.inputInner}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputRow}>
                            <Mail color="#64748B" size={20} />
                            <TextInput
                                value={emailAddress}
                                placeholder="you@example.com"
                                placeholderTextColor="#64748B"
                                onChangeText={setEmailAddress}
                                style={styles.inputInner}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputRow}>
                            <Lock color="#64748B" size={20} />
                            <TextInput
                                value={password}
                                placeholder="Min. 8 characters"
                                placeholderTextColor="#64748B"
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                                style={styles.inputInner}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword((v) => !v)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword ? (
                                    <EyeOff color="#64748B" size={20} />
                                ) : (
                                    <Eye color="#64748B" size={20} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={onSignUpPress}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerRow}>
                        <Text style={styles.mutedText}>Already have an account? </Text>
                        <Link href="/sign-in">
                            <Text style={styles.linkText}>Sign in</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

// ─── Tiny helper ──────────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
    return (
        <View style={styles.errorBox}>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: '#0F172A' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },

    header:         { marginBottom: 28, alignItems: 'center' },
    iconBox: {
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    title:          { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
    subtitle:       { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
    emailHighlight: { fontSize: 14, color: '#3B82F6', fontWeight: '600', marginTop: 4 },

    oauthRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    oauthBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 13,
        borderRadius: 12, backgroundColor: '#1E293B',
        borderWidth: 1, borderColor: '#334155',
    },
    oauthIcon:  { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    oauthLabel: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

    dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#1E293B' },
    dividerText: { fontSize: 13, color: '#475569' },

    errorBox: {
        backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12,
        padding: 12, marginBottom: 16,
    },
    errorText: { color: '#FCA5A5', fontSize: 14, textAlign: 'center' },

    form:       { gap: 14 },
    inputGroup: { gap: 6 },
    label:      { fontSize: 13, fontWeight: '600', color: '#CBD5E1' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1E293B', borderRadius: 12,
        paddingHorizontal: 14, borderWidth: 1, borderColor: '#334155', gap: 10,
    },
    inputInner: { flex: 1, paddingVertical: 13, color: '#FFFFFF', fontSize: 15 },

    codeInput: {
        backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
        color: '#FFFFFF', fontSize: 24, fontWeight: 'bold',
        letterSpacing: 8, borderWidth: 1, borderColor: '#334155',
    },

    button:         { backgroundColor: '#3B82F6', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.55 },
    buttonText:     { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

    centeredRow: { alignItems: 'center', marginTop: 4 },
    footerRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    mutedText:   { color: '#94A3B8', fontSize: 14 },
    linkText:    { color: '#3B82F6', fontSize: 14, fontWeight: 'bold' },
})