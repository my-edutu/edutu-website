import React, { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import {
    ArrowRight,
    ChevronDown,
    GraduationCap,
    Globe,
    Phone,
    Search,
    Sparkles,
    Check,
    X,
    User,
    Building,
    Target,
    Award,
    Lightbulb,
} from 'lucide-react-native'
import { COUNTRIES, GRADE_LEVELS, INTERESTS, AMBITIONS, SCHOOL_TYPES, YES_NO_OPTIONS } from './data/onboarding-data'
import type { Country } from './data/onboarding-data'

const STEPS = [
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'education', title: 'Education', icon: Building },
    { id: 'interests', title: 'Interests', icon: Target },
]

export default function OnboardingScreen() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(0)
    
    const [fullName, setFullName] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
    const [countryModal, setCountryModal] = useState(false)
    const [countrySearch, setCountrySearch] = useState('')
    const [localPhone, setLocalPhone] = useState('')

    const [isGraduate, setIsGraduate] = useState<string | null>(null)
    const [schoolType, setSchoolType] = useState<string | null>(null)
    const [schoolName, setSchoolName] = useState('')
    const [gradeLevel, setGradeLevel] = useState<string | null>(null)

    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [selectedAmbitions, setSelectedAmbitions] = useState<string[]>([])
    const [customInterest, setCustomInterest] = useState('')

    const [loading, setLoading] = useState(false)

    const filteredCountries = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.dial.includes(countrySearch),
    )

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest],
        )
    }

    const toggleAmbition = (ambition: string) => {
        setSelectedAmbitions((prev) =>
            prev.includes(ambition)
                ? prev.filter((i) => i !== ambition)
                : [...prev, ambition],
        )
    }

    const saveAndNavigate = async () => {
        if (!isLoaded || !user) return
        setLoading(true)
        try {
            const allInterests = [...selectedInterests]
            if (customInterest.trim()) {
                customInterest.split(',').forEach((i) => {
                    const t = i.trim()
                    if (t && !allInterests.includes(t)) allInterests.push(t)
                })
            }

            await user.update({
                unsafeMetadata: {
                    onboardingComplete: true,
                    fullName: fullName,
                    country: selectedCountry.name,
                    countryCode: selectedCountry.code,
                    phone: localPhone ? `${selectedCountry.dial}${localPhone}` : '',
                    isGraduate: isGraduate,
                    schoolType: schoolType,
                    schoolName: schoolName,
                    gradeLevel: gradeLevel,
                    interests: allInterests.length > 0 ? allInterests : ['General'],
                    ambitions: selectedAmbitions,
                },
            })
            await user.reload()
            router.replace('/(app)')
        } catch (err) {
            console.error('Error updating profile:', err)
            Alert.alert('Error', 'Failed to save preferences. Please try again.')
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            saveAndNavigate()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return fullName.trim().length > 0
            case 1:
                return isGraduate !== null
            case 2:
                return selectedInterests.length > 0 || selectedAmbitions.length > 0
            default:
                return true
        }
    }

    if (!isLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 100 }} />
            </SafeAreaView>
        )
    }

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                    <View key={step.id} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCompleted && styles.stepCircleCompleted,
                            ]}
                        >
                            {isCompleted ? (
                                <Check color="white" size={16} />
                            ) : (
                                <Icon
                                    color={isActive ? '#FFFFFF' : '#64748B'}
                                    size={16}
                                />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.stepLabel,
                                isActive && styles.stepLabelActive,
                                isCompleted && styles.stepLabelCompleted,
                            ]}
                        >
                            {step.title}
                        </Text>
                    </View>
                )
            })}
        </View>
    )

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderProfileStep()
            case 1:
                return renderEducationStep()
            case 2:
                return renderInterestsStep()
            default:
                return null
        }
    }

    const renderProfileStep = () => (
        <Animated.View entering={FadeInUp.duration(400)}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconBox}>
                    <User color="#60A5FA" size={28} />
                </View>
                <Text style={styles.stepTitle}>Tell Us About Yourself</Text>
                <Text style={styles.stepSubtitle}>
                    This helps us personalize your experience and find the best opportunities for you
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <User color="#94A3B8" size={14} /> Full Name
                    </Text>
                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#64748B"
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Globe color="#94A3B8" size={14} /> Country
                    </Text>
                    <Text style={styles.hint}>We'll show opportunities available in your region</Text>
                    <TouchableOpacity
                        style={styles.pickerRow}
                        onPress={() => setCountryModal(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.flagLarge}>{selectedCountry.flag}</Text>
                        <Text style={styles.pickerText}>{selectedCountry.name}</Text>
                        <ChevronDown color="#64748B" size={18} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Phone color="#94A3B8" size={14} /> Phone Number (Optional)
                    </Text>
                    <Text style={styles.hint}>For scholarship alerts and important updates</Text>
                    <View style={styles.phoneRow}>
                        <View style={styles.dialBadge}>
                            <Text style={styles.dialFlag}>{selectedCountry.flag}</Text>
                            <Text style={styles.dialCodeText}>{selectedCountry.dial}</Text>
                        </View>
                        <View style={styles.dialDivider} />
                        <TextInput
                            value={localPhone}
                            onChangeText={setLocalPhone}
                            placeholder="800 000 0000"
                            placeholderTextColor="#64748B"
                            style={styles.phoneInput}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>
                </View>
            </View>
        </Animated.View>
    )

    const renderEducationStep = () => (
        <Animated.View entering={FadeInUp.duration(400)}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconBox}>
                    <Building color="#60A5FA" size={28} />
                </View>
                <Text style={styles.stepTitle}>Your Education</Text>
                <Text style={styles.stepSubtitle}>
                    Help us find programs that match your academic level
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <GraduationCap color="#94A3B8" size={14} /> Have you completed high school?
                    </Text>
                    <Text style={styles.hint}>This determines which programs you qualify for</Text>
                    <View style={styles.optionsRow}>
                        {YES_NO_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    isGraduate === option.value && styles.optionCardSelected,
                                ]}
                                onPress={() => setIsGraduate(option.value)}
                            >
                                <Text style={styles.optionIcon}>{option.icon}</Text>
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        isGraduate === option.value && styles.optionLabelSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {isGraduate === 'no' && (
                    <Animated.View entering={FadeInDown.duration(300)}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Grade Level</Text>
                            <View style={styles.optionsGrid}>
                                {GRADE_LEVELS.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.gradeCard,
                                            gradeLevel === level.value && styles.gradeCardSelected,
                                        ]}
                                        onPress={() => setGradeLevel(level.value)}
                                    >
                                        <Text style={styles.gradeIcon}>{level.icon}</Text>
                                        <Text
                                            style={[
                                                styles.gradeLabel,
                                                gradeLevel === level.value && styles.gradeLabelSelected,
                                            ]}
                                        >
                                            {level.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>School Type</Text>
                    <View style={styles.optionsGrid}>
                        {SCHOOL_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.schoolCard,
                                    schoolType === type.value && styles.schoolCardSelected,
                                ]}
                                onPress={() => setSchoolType(type.value)}
                            >
                                <Text style={styles.schoolIcon}>{type.icon}</Text>
                                <Text
                                    style={[
                                        styles.schoolLabel,
                                        schoolType === type.value && styles.schoolLabelSelected,
                                    ]}
                                    numberOfLines={2}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>School Name (Optional)</Text>
                    <TextInput
                        value={schoolName}
                        onChangeText={setSchoolName}
                        placeholder="Enter your school name"
                        placeholderTextColor="#64748B"
                        style={styles.input}
                    />
                </View>
            </View>
        </Animated.View>
    )

    const renderInterestsStep = () => (
        <Animated.View entering={FadeInUp.duration(400)}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconBox}>
                    <Target color="#60A5FA" size={28} />
                </View>
                <Text style={styles.stepTitle}>Your Interests & Goals</Text>
                <Text style={styles.stepSubtitle}>
                    Select what matters most to you
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Lightbulb color="#94A3B8" size={14} /> What are you interested in?
                    </Text>
                    <Text style={styles.hint}>Choose topics you're passionate about</Text>
                    <View style={styles.interestsGrid}>
                        {INTERESTS.map((interest) => {
                            const isSelected = selectedInterests.includes(interest)
                            return (
                                <TouchableOpacity
                                    key={interest}
                                    style={[
                                        styles.interestChip,
                                        isSelected && styles.interestChipSelected,
                                    ]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    <Text
                                        style={[
                                            styles.interestChipText,
                                            isSelected && styles.interestChipTextSelected,
                                        ]}
                                    >
                                        {interest}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <TextInput
                        value={customInterest}
                        onChangeText={setCustomInterest}
                        placeholder="Other interests (comma-separated)"
                        placeholderTextColor="#64748B"
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Award color="#94A3B8" size={14} /> What are your ambitions?
                    </Text>
                    <Text style={styles.hint}>Select your goals so we can find the right opportunities</Text>
                    <View style={styles.ambitionsList}>
                        {AMBITIONS.map((ambition) => {
                            const isSelected = selectedAmbitions.includes(ambition.value)
                            return (
                                <TouchableOpacity
                                    key={ambition.value}
                                    style={[
                                        styles.ambitionCard,
                                        isSelected && styles.ambitionCardSelected,
                                    ]}
                                    onPress={() => toggleAmbition(ambition.value)}
                                >
                                    <View style={styles.ambitionLeft}>
                                        <Text style={styles.ambitionIcon}>{ambition.icon}</Text>
                                        <View style={styles.ambitionTextContainer}>
                                            <Text
                                                style={[
                                                    styles.ambitionLabel,
                                                    isSelected && styles.ambitionLabelSelected,
                                                ]}
                                            >
                                                {ambition.label}
                                            </Text>
                                            <Text style={styles.ambitionHint}>{ambition.hint}</Text>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected,
                                        ]}
                                    >
                                        {isSelected && <Check color="white" size={14} />}
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </View>
        </Animated.View>
    )

    return (
        <>
            <Modal visible={countryModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setCountryModal(false)
                                    setCountrySearch('')
                                }}
                            >
                                <X color="#94A3B8" size={22} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchRow}>
                            <Search color="#64748B" size={18} />
                            <TextInput
                                value={countrySearch}
                                onChangeText={setCountrySearch}
                                placeholder="Search country…"
                                placeholderTextColor="#64748B"
                                style={styles.searchInput}
                            />
                        </View>

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.countryRow}
                                    onPress={() => {
                                        setSelectedCountry(item)
                                        setCountryModal(false)
                                        setCountrySearch('')
                                    }}
                                >
                                    <Text style={styles.flag}>{item.flag}</Text>
                                    <Text style={styles.countryName}>{item.name}</Text>
                                    <Text style={styles.dialCodeText}>{item.dial}</Text>
                                    {selectedCountry.code === item.code && (
                                        <Check color="#3B82F6" size={18} />
                                    )}
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </View>
            </Modal>

            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {renderStepIndicator()}
                        {renderStepContent()}
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.footerButtons}>
                            {currentStep > 0 && (
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={handleBack}
                                >
                                    <Text style={styles.backButtonText}>Back</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    !canProceed() && styles.buttonDisabled,
                                ]}
                                onPress={handleNext}
                                disabled={!canProceed() || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>
                                            {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
                                        </Text>
                                        <ArrowRight color="white" size={20} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 20, paddingTop: 24 },

    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
    },
    stepItem: { alignItems: 'center' },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E293B',
        borderWidth: 2,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    stepCircleCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
    stepLabel: { fontSize: 12, color: '#64748B', marginTop: 6 },
    stepLabelActive: { color: '#60A5FA', fontWeight: '600' },
    stepLabelCompleted: { color: '#10B981' },

    stepHeader: { alignItems: 'center', marginBottom: 28 },
    stepIconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    stepTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' },
    stepSubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

    form: { gap: 24 },
    inputGroup: { gap: 8 },
    label: { fontSize: 15, fontWeight: '600', color: '#E2E8F0' },
    hint: { fontSize: 12, color: '#64748B', marginTop: -4 },

    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 14,
        color: 'white',
        fontSize: 15,
    },

    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 10,
    },
    flagLarge: { fontSize: 22 },
    pickerText: { flex: 1, color: '#FFFFFF', fontSize: 16 },

    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        overflow: 'hidden',
    },
    dialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 13,
        backgroundColor: '#0F172A',
    },
    dialFlag: { fontSize: 18 },
    dialCodeText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
    dialDivider: { width: 1, height: '100%', backgroundColor: '#334155' },
    phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, color: '#FFFFFF', fontSize: 15 },

    optionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    optionCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    optionCardSelected: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3B82F6' },
    optionIcon: { fontSize: 28 },
    optionLabel: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
    optionLabelSelected: { color: '#60A5FA' },

    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    gradeCard: {
        width: '48%',
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    gradeCardSelected: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3B82F6' },
    gradeIcon: { fontSize: 20 },
    gradeLabel: { flex: 1, fontSize: 13, color: '#94A3B8' },
    gradeLabelSelected: { color: '#60A5FA', fontWeight: '500' },

    schoolCard: {
        width: '31%',
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        gap: 6,
    },
    schoolCardSelected: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3B82F6' },
    schoolIcon: { fontSize: 20 },
    schoolLabel: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
    schoolLabelSelected: { color: '#60A5FA', fontWeight: '500' },

    interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    interestChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    interestChipSelected: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3B82F6' },
    interestChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
    interestChipTextSelected: { color: '#60A5FA' },

    ambitionsList: { gap: 10, marginTop: 8 },
    ambitionCard: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ambitionCardSelected: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3B82F6' },
    ambitionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    ambitionIcon: { fontSize: 24 },
    ambitionTextContainer: { flex: 1 },
    ambitionLabel: { fontSize: 14, fontWeight: '500', color: '#E2E8F0', marginBottom: 2 },
    ambitionLabelSelected: { color: '#60A5FA' },
    ambitionHint: { fontSize: 11, color: '#64748B' },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },

    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        backgroundColor: '#0F172A',
    },
    footerButtons: { flexDirection: 'row', gap: 12 },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    backButtonText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
    button: {
        flex: 1,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: { flex: 1, paddingVertical: 10, color: '#FFFFFF', fontSize: 15 },
    countryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, gap: 12 },
    flag: { fontSize: 22 },
    countryName: { flex: 1, color: '#FFFFFF', fontSize: 15 },
})