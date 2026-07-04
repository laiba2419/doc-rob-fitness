import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ChatMessage = {
  id: string;
  from: 'bot' | 'user';
  text: string;
};

const suggestedPrompts = [
  'What are some effective warm-up exercises?',
  'What are some healthy snacks for a fitness routine?',
  'How can I improve my flexibility?',
];

export default function FitBotScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Note: yahan actual AI backend call lagani hai, abhi placeholder reply hai
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), from: 'bot', text: ' backend not connected.' },
      ]);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <BackHeader />
          <Text style={[styles.title, { color: theme.text }]}>FitBot</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.greetingWrap} showsVerticalScrollIndicator={false}>
            <View style={[styles.botIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color={theme.primary} />
            </View>
            <Text style={[styles.greetingTitle, { color: theme.text }]}>Hello, Jacob! How may I help you?</Text>

            <View style={styles.promptsWrap}>
              {suggestedPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={[styles.promptChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.messagesWrap} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.from === 'user'
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [styles.botBubble, { backgroundColor: theme.surface }],
                ]}
              >
                <Text style={{ color: msg.from === 'user' ? '#FFFFFF' : theme.text, fontSize: 13 }}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Type your question..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={() => sendMessage(input)}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700' },
  menuBtn: { padding: 4 },

  greetingWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 40 },
  botIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  greetingTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },

  promptsWrap: { width: '100%', gap: 10, marginTop: 8 },
  promptChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  promptText: { fontSize: 13, flex: 1, marginRight: 8 },

  messagesWrap: { flexGrow: 1, paddingVertical: 10, gap: 10 },
  messageBubble: { maxWidth: '80%', borderRadius: 14, padding: 12 },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: { alignSelf: 'flex-start' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    marginTop: 10,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 10 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
