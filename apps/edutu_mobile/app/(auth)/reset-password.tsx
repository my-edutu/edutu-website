import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import React from 'react'

export default function ResetPasswordPage() {
    const { isLoaded, signIn } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onRequestReset = async () => {
        if (!isLoaded) return
        setLoading(true)

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: emailAddress,
            })
            setPendingVerification(true)
            Alert.alert('Email Sent', `A verification code has been sent to ${emailAddress}`)
        } catch (err: any) {
            const error = err.errors?.[0]
            Alert.alert('Error', error?.longMessage || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    const onResetPassword = async () => {
        if (!isLoaded) return
        setLoading(true)

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password: newPassword,
            })

            if (result.status === 'complete') {
                Alert.alert('Success', 'Your password has been reset successfully', [
                    { text: 'OK', onPress: () => router.replace('/sign-in') }
                ])
            } else {
                Alert.alert('Error', 'Failed to reset password. Please try again.')
            }
        } catch (err: any) {
            const error = err.errors?.[0]
            Alert.alert('Error', error?.longMessage || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (pendingVerification) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter the code sent to {emailAddress}</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                value={code}
                                placeholder="Enter code"
                                placeholderTextColor="#94A3B8"
                                onChangeText={setCode}
                                style={styles.input}
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                value={newPassword}
                                placeholder="Enter new password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={true}
                                onChangeText={setNewPassword}
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={onResetPassword}
                            style={[styles.button, loading && styles.buttonDisabled]}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Remembered your password?</Text>
                            <Link href="/sign-in">
                                <Text style={styles.linkText}>Sign in</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Enter email"
                            placeholderTextColor="#94A3B8"
                            onChangeText={setEmailAddress}
                            style={styles.input}
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={onRequestReset}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remembered your password?</Text>
                        <Link href="/sign-in">
                            <Text style={styles.linkText}>Sign in</Text>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CBD5E1',
    },
    input: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
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
