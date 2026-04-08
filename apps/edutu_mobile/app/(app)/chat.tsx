import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator,
    Modal,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Send, 
    Plus, 
    History, 
    X, 
    Bot, 
    User, 
    Sparkles,
    Brain,
    Zap,
    Users,
    ChevronRight,
    ArrowLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../components/context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useChat } from '@edutu/core/src/hooks/useChat';
import { ChatMessage, ChatThread } from '@edutu/core/src/types/chat';

export default function ChatScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const [input, setInput] = useState('');
    const [isThreadsVisible, setIsThreadsVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const backgroundColor = colors.background;
    const textPrimary = colors.foreground;
    const textSecondary = isDark ? '#94A3B8' : '#64748B';
    const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF";
    const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0";
    const inputBg = isDark ? "#1E293B" : "#F1F5F9";
    const accentColor = "#6366F1";

    const quickPrompts = useMemo(() => [
        { text: 'Help me find scholarships', icon: Sparkles, topic: 'Scholarships' },
        { text: 'Career guidance', icon: Brain, topic: 'Career growth' },
        { text: 'Skills to develop', icon: Zap, topic: 'Skill development' },
        { text: 'Networking tips', icon: Users, topic: 'Networking' },
    ], []);

    const {
        threads,
        messages,
        selectedThreadId,
        isLoadingThreads,
        isLoadingMessages,
        isSending,
        selectThread,
        sendMessage,
        archiveThread
    } = useChat({
        supabase,
        userId: user?.id || null,
        onSessionRecorded: (topic) => console.log('Session recorded:', topic)
    });

    const handleSend = useCallback(async (overrideText?: string, topic?: string) => {
        const text = (overrideText || input).trim();
        if (!text || isSending) return;
        setInput('');
        try {
            await sendMessage(text);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    }, [input, isSending, sendMessage]);

    const showWelcomePrompts = useMemo(() => 
        !isLoadingMessages && messages.length === 1 && messages[0].role === 'assistant' && !selectedThreadId,
        [isLoadingMessages, messages, selectedThreadId]
    );

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isBot = item.role === 'assistant';
        return (
            <View style={[styles.messageRow, isBot ? {} : styles.messageRowUser]}>
                <View style={[styles.messageContainer, isBot ? {} : styles.messageContainerUser]}>
                    <View style={[styles.avatar, { backgroundColor: isBot ? accentColor : (isDark ? '#475569' : '#64748B') }]}>
                        {isBot ? <Bot size={18} color="white" /> : <User size={18} color="white" />}
                    </View>
                    <View style={[
                        styles.messageBubble, 
                        isBot ? { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: borderColor } : { backgroundColor: accentColor }
                    ]}>
                        <Text style={[styles.messageText, { color: isBot ? textPrimary : '#FFFFFF' }]}>
                            {item.content}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderThreadItem = ({ item }: { item: ChatThread }) => (
        <TouchableOpacity 
            onPress={() => {
                selectThread(item.id);
                setIsThreadsVisible(false);
            }}
            style={[
                styles.threadItem,
                { backgroundColor: cardBg, borderColor },
                selectedThreadId === item.id && { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: accentColor }
            ]}
        >
            <Text style={[styles.threadTitle, { color: textPrimary }]} numberOfLines={1}>
                {item.title || 'New Conversation'}
            </Text>
            <Text style={[
                styles.threadDate,
                { color: textSecondary },
                selectedThreadId === item.id && { color: '#A5B4FC' }
            ]}>
                {new Date(item.updated_at).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
                    <ArrowLeft size={24} color={textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>AI Coach</Text>
                <TouchableOpacity 
                    onPress={() => setIsThreadsVisible(true)}
                    style={[styles.historyBtn, { backgroundColor: cardBg }]}
                >
                    <History size={20} color={textSecondary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {isLoadingMessages ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={accentColor} size="large" />
                        <Text style={[styles.loadingText, { color: textSecondary }]}>Loading conversation...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIcon}>
                                    <Bot size={40} color={accentColor} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: textPrimary }]}>I'm Edutu, your AI Coach</Text>
                                <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                                    Ask me anything about scholarships, career growth, or skill development.
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                            showWelcomePrompts ? (
                                <View style={styles.promptsContainer}>
                                    {quickPrompts.map((prompt) => (
                                        <TouchableOpacity
                                            key={prompt.text}
                                            onPress={() => handleSend(prompt.text, prompt.topic)}
                                            style={[styles.promptItem, { backgroundColor: cardBg, borderColor }]}
                                        >
                                            <View style={styles.promptIcon}>
                                                <prompt.icon size={20} color={accentColor} />
                                            </View>
                                            <Text style={[styles.promptText, { color: textPrimary }]}>{prompt.text}</Text>
                                            <ChevronRight size={16} color={textSecondary} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor }]}>
                    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                        <TextInput
                            style={[styles.input, { color: textPrimary }]}
                            placeholder="Message Edutu..."
                            placeholderTextColor={textSecondary}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity 
                            onPress={() => handleSend()}
                            disabled={!input.trim() || isSending}
                            style={[
                                styles.sendBtn,
                                { backgroundColor: input.trim() && !isSending ? accentColor : (isDark ? '#334155' : '#CBD5E1') }
                            ]}
                        >
                            {isSending ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Send size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Threads Modal */}
            <Modal
                visible={isThreadsVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsThreadsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textPrimary }]}>Conversations</Text>
                            <TouchableOpacity onPress={() => setIsThreadsVisible(false)}>
                                <X size={24} color={textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            onPress={() => {
                                selectThread(null);
                                setIsThreadsVisible(false);
                            }}
                            style={[styles.newConvBtn, { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }]}
                        >
                            <Plus size={20} color={accentColor} />
                            <Text style={styles.newConvText}>New Conversation</Text>
                        </TouchableOpacity>

                        {isLoadingThreads ? (
                            <ActivityIndicator color={accentColor} />
                        ) : (
                            <FlatList
                                data={threads}
                                keyExtractor={(item) => item.id}
                                renderItem={renderThreadItem}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyThreads, { color: textSecondary }]}>No recent conversations</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    historyBtn: { padding: 8, borderRadius: 8 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, fontSize: 16 },
    messagesList: { padding: 20, paddingBottom: 100 },
    messageRow: { marginBottom: 16 },
    messageRowUser: { justifyContent: 'flex-end' },
    messageContainer: { flexDirection: 'row', alignItems: 'flex-start', maxWidth: '85%' },
    messageContainerUser: { flexDirection: 'row-reverse' },
    avatar: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
    messageBubble: { padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 8 },
    messageText: { fontSize: 14, lineHeight: 20 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    promptsContainer: { paddingTop: 20 },
    promptItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
    promptIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    promptText: { flex: 1, fontSize: 14, fontWeight: '600' },
    inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 4, borderWidth: 1 },
    input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
    sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    newConvBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
    newConvText: { color: '#6366F1', fontWeight: 'bold', marginLeft: 12 },
    threadItem: { padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
    threadTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    threadDate: { fontSize: 10 },
    emptyThreads: { textAlign: 'center', marginTop: 40 },
});